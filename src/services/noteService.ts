import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  startAfter,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import Toast from "react-native-toast-message";
import { PAGE_SIZE, PAGE_SIZE_GROUP } from "../context/note/constants";

import { FirestoreQueryResult, Note, NoteGroup } from "../types/type";
import { Action, State } from "../context/note/noteTypes";
import { checkNetworkStability, retryAxios } from "../utils";
import { getAxiosWithAuth } from "../config/axiosConfig";
import { handleAxiosError } from "../utils/errorHandler";
import { getFirestoreQueryUrl, getFirestoreUrl } from "../utils/firebaseUrl";

export function useNoteActions(state: State, dispatch: React.Dispatch<Action>) {
  const fetchGroups = async (userId: string, reset = true) => {
    if (reset) dispatch({ type: "SET_LOADING", payload: true });

    const isStable = await checkNetworkStability();
    if (!isStable) {
      Toast.show({ type: "error", text1: "No stable internet connection" });
      if (reset) dispatch({ type: "SET_LOADING", payload: false });
      return;
    }

    try {
      let q = query(
        collection(db, "noteGroups"),
        where("userID", "==", userId),
        orderBy("updateAt", "desc"),
        limit(PAGE_SIZE_GROUP)
      );

      if (!reset && state.lastGroupDoc) {
        q = query(
          collection(db, "noteGroups"),
          where("userID", "==", userId),
          orderBy("updateAt", "desc"),
          startAfter(state.lastGroupDoc),
          limit(PAGE_SIZE_GROUP)
        );
      }

      const snapshot = await getDocs(q);
      const groups: NoteGroup[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        updateAt: doc.data().updateAt?.toDate(),
      }));

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      const canLoadMore = snapshot.docs.length === PAGE_SIZE_GROUP;

      dispatch({
        type: reset ? "SET_GROUPS" : "APPEND_GROUPS",
        payload: {
          groups,
          lastDoc,
          canLoadMore,
        },
      });
    } catch (err) {
      console.error("Error fetching groups:", err);
      Toast.show({ type: "error", text1: "Failed to fetch groups" });
    } finally {
      if (reset) dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const loadMoreGroups = async (userId: string) => {
    if (!state.canLoadMoreGroups) return;
    await fetchGroups(userId, false);
  };

  const addGroup = async (userId: string, name: string): Promise<boolean> => {
    const trimmed = name.trim();
    if (!trimmed) {
      Toast.show({ type: "error", text1: "Name cannot be empty" });
      return false;
    }

    try {
      const axiosAuth = await getAxiosWithAuth();

      // 🔍 Step 1: Check for duplicate group (by name + userID)
      const checkUrl = getFirestoreQueryUrl();
      const checkPayload = {
        structuredQuery: {
          select: {},
          from: [{ collectionId: "noteGroups" }],
          where: {
            compositeFilter: {
              op: "AND",
              filters: [
                {
                  fieldFilter: {
                    field: { fieldPath: "name" },
                    op: "EQUAL",
                    value: { stringValue: trimmed },
                  },
                },
                {
                  fieldFilter: {
                    field: { fieldPath: "userID" },
                    op: "EQUAL",
                    value: { stringValue: userId },
                  },
                },
              ],
            },
          },
        },
      };

      const checkResponse = await retryAxios(() =>
        axiosAuth.post(checkUrl, checkPayload)
      );

      const duplicateExists = checkResponse.data.some(
        (res: { document?: unknown }) => res.document !== undefined
      );
      if (duplicateExists) {
        Toast.show({ type: "error", text1: "Group name already exists" });
        return false;
      }

      // ✅ Step 2: Create group
      const now = new Date().toISOString();
      const payload = {
        fields: {
          name: { stringValue: trimmed },
          userID: { stringValue: userId },
          createdAt: { timestampValue: now },
          updateAt: { timestampValue: now },
        },
      };

      const createUrl = getFirestoreUrl("noteGroups");
      const response = await retryAxios(() =>
        axiosAuth.post(createUrl, payload)
      );

      const docId = response.data.name?.split("/").pop();
      if (!docId)
        throw new Error("Invalid Firestore response: missing document ID");

      const newGroup: NoteGroup = { id: docId, name: trimmed };
      dispatch({ type: "ADD_GROUP", payload: newGroup });

      Toast.show({ type: "success", text1: "Group added" });
      return true;
    } catch (err) {
      handleAxiosError(err, "add group");
      console.log("❌ Axios error in addGroup:", err);
      return false;
    }
  };

  const renameGroup = async (
    groupId: string,
    newName: string,
    userId: string
  ): Promise<boolean> => {
    const trimmed = newName.trim();
    if (!trimmed) {
      Toast.show({ type: "error", text1: "Name cannot be empty" });
      return false;
    }

    try {
      const axiosAuth = await getAxiosWithAuth();

      // Step 1: Check for duplicate name (same user, different group)
      const checkUrl = getFirestoreQueryUrl();
      const checkPayload = {
        structuredQuery: {
          select: {},
          from: [{ collectionId: "noteGroups" }],
          where: {
            compositeFilter: {
              op: "AND",
              filters: [
                {
                  fieldFilter: {
                    field: { fieldPath: "name" },
                    op: "EQUAL",
                    value: { stringValue: trimmed },
                  },
                },
                {
                  fieldFilter: {
                    field: { fieldPath: "userID" },
                    op: "EQUAL",
                    value: { stringValue: userId },
                  },
                },
              ],
            },
          },
        },
      };

      const checkResponse = await retryAxios(() =>
        axiosAuth.post(checkUrl, checkPayload)
      );

      const duplicateExists = (
        checkResponse.data as FirestoreQueryResult[]
      ).some(
        (res) => res.document && res.document.name?.split("/").pop() !== groupId
      );

      if (duplicateExists) {
        Toast.show({ type: "error", text1: "Group name already exists" });
        return false;
      }

      // Step 2: Update the group name
      const updateUrl = `${getFirestoreUrl(
        "noteGroups"
      )}/${groupId}?updateMask.fieldPaths=name&updateMask.fieldPaths=updateAt`;
      const payload = {
        fields: {
          name: { stringValue: trimmed },
          updateAt: { timestampValue: new Date().toISOString() },
        },
      };

      await retryAxios(() => axiosAuth.patch(updateUrl, payload));

      dispatch({
        type: "RENAME_GROUP",
        payload: { groupId, newName: trimmed },
      });

      Toast.show({ type: "success", text1: "Group renamed" });
      return true;
    } catch (err) {
      handleAxiosError(err, "rename group");
      return false;
    }
  };

  const deleteGroup = async (
    groupId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      const axiosAuth = await getAxiosWithAuth();

      // Step 1: Find all notes with the groupId
      const queryUrl = getFirestoreQueryUrl();
      const queryPayload = {
        structuredQuery: {
          select: {},
          from: [{ collectionId: "notes" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "groupId" },
              op: "EQUAL",
              value: { stringValue: groupId },
            },
          },
        },
      };

      const queryResponse = await retryAxios(() =>
        axiosAuth.post(queryUrl, queryPayload)
      );

      const notes = queryResponse.data as FirestoreQueryResult[];

      // Step 2: Delete all notes in that group
      const deleteNotePromises = notes
        .filter((res) => res.document?.name)
        .map((res) => {
          const noteDocPath = res.document!.name;
          return retryAxios(() =>
            axiosAuth.delete(
              `https://firestore.googleapis.com/v1/${noteDocPath}`
            )
          );
        });

      await Promise.all(deleteNotePromises);

      // Step 3: Delete the group
      const groupUrl = `${getFirestoreUrl("noteGroups")}/${groupId}`;
      await retryAxios(() => axiosAuth.delete(groupUrl));

      // Step 4: Update local state
      Toast.show({ type: "success", text1: "Group and notes deleted" });
      dispatch({ type: "DELETE_GROUP", payload: groupId });

      return true;
    } catch (err) {
      handleAxiosError(err, "delete group");
      return false;
    }
  };

  const fetchNotes = async (groupId: string, reset = true) => {
    if (reset) dispatch({ type: "SET_LOADING_NOTE", payload: true });

    const isStable = await checkNetworkStability();
    if (!isStable) {
      Toast.show({ type: "error", text1: "No stable internet connection" });
      if (reset) dispatch({ type: "SET_LOADING_NOTE", payload: false });
      return;
    }

    try {
      const baseQuery = query(
        collection(db, "notes"),
        where("groupId", "==", groupId),
        orderBy("pinned", "desc"),
        orderBy("updateAt", "desc"),
        limit(PAGE_SIZE)
      );
      const snapshot = await getDocs(baseQuery);

      const notes: Note[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        content: doc.data().content,
        groupId: doc.data().groupId,
        createAt: doc.data().createAt?.toDate() || new Date(),
        updateAt: doc.data().updateAt?.toDate() || new Date(),
        imageUrl: doc.data().imageUrl || undefined,
        pinned: doc.data().pinned || undefined,
        locked: doc.data().locked || undefined,
      }));

      dispatch({
        type: reset ? "SET_NOTES" : "APPEND_NOTES",
        groupId,
        notes,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        canLoadMore: snapshot.docs.length === PAGE_SIZE,
      });
    } catch (error) {
      console.error("Paging fetch failed:", error);
      Toast.show({ type: "error", text1: "Failed to load notes" });
    } finally {
      if (reset) dispatch({ type: "SET_LOADING_NOTE", payload: false });
    }
  };

  const loadMoreNotes = async (groupId: string) => {
    const lastDoc = state.lastNoteDoc[groupId];
    if (!lastDoc) return;

    const isStable = await checkNetworkStability();
    if (!isStable) {
      Toast.show({ type: "error", text1: "No stable internet connection" });
      return;
    }

    try {
      const q = query(
        collection(db, "notes"),
        where("groupId", "==", groupId),
        orderBy("pinned", "desc"),
        orderBy("updateAt", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const notes: Note[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        content: doc.data().content,
        groupId: doc.data().groupId,
        createAt: doc.data().createAt?.toDate() || new Date(),
        updateAt: doc.data().updateAt?.toDate() || new Date(),
        imageUrl: doc.data().imageUrl || undefined,
        pinned: doc.data().pinned || undefined,
        locked: doc.data().locked || undefined,
      }));

      dispatch({
        type: "APPEND_NOTES",
        groupId,
        notes,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        canLoadMore: snapshot.docs.length === PAGE_SIZE,
      });
    } catch (err) {
      console.error("Load more notes failed:", err);
      Toast.show({ type: "error", text1: "Failed to load more notes" });
    }
  };

  const addNote = async (
    groupId: string,
    title: string,
    content: string,
    imageUrl?: string
  ): Promise<boolean> => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please enter both a title and content.",
      });
      return false;
    }

    try {
      const axiosAuth = await getAxiosWithAuth();

      // Step 1: Prepare payload
      const now = new Date().toISOString();
      const payload = {
        fields: {
          name: { stringValue: trimmedTitle },
          content: { stringValue: trimmedContent },
          imageUrl: imageUrl ? { stringValue: imageUrl } : { nullValue: null },
          groupId: { stringValue: groupId },
          createAt: { timestampValue: now },
          updateAt: { timestampValue: now },
          pinned: { booleanValue: false },
          locked: { booleanValue: false },
        },
      };

      // Step 2: Submit note to Firestore
      const url = getFirestoreUrl("notes");
      const response = await retryAxios(() => axiosAuth.post(url, payload));

      // Step 3: Extract Firestore document ID
      const docId = response.data.name?.split("/").pop();
      if (!docId) {
        throw new Error("Missing document ID in Firestore response");
      }

      // Step 4: Build local note object and dispatch
      const newNote = {
        id: docId,
        name: trimmedTitle,
        content: trimmedContent,
        imageUrl: imageUrl || undefined,
        groupId,
        createAt: new Date(now),
        updateAt: new Date(now),
        pinned: false,
        locked: false,
      };

      dispatch({ type: "ADD_NOTE", groupId, note: newNote });

      Toast.show({ type: "success", text1: "Note added" });
      return true;
    } catch (err) {
      handleAxiosError(err, "add note");
      return false;
    }
  };

  const deleteNote = async (
    noteId: string,
    groupId: string
  ): Promise<boolean> => {
    try {
      const axiosAuth = await getAxiosWithAuth();

      // Step 1: Delete note from Firestore
      const url = `${getFirestoreUrl("notes")}/${noteId}`;
      await retryAxios(() => axiosAuth.delete(url));

      // Step 2: Update local state
      dispatch({ type: "DELETE_NOTE", groupId, noteId });

      Toast.show({ type: "success", text1: "Note deleted" });
      return true;
    } catch (err) {
      handleAxiosError(err, "delete note");
      return false;
    }
  };

  const moveNote = async (
    noteId: string,
    fromGroupId: string,
    toGroupId: string
  ): Promise<boolean> => {
    try {
      const axiosAuth = await getAxiosWithAuth();

      // Step 1: Update the note's groupId and updateAt
      const url = `${getFirestoreUrl(
        "notes"
      )}/${noteId}?updateMask.fieldPaths=groupId&updateMask.fieldPaths=updateAt`;
      const payload = {
        fields: {
          groupId: { stringValue: toGroupId },
          updateAt: { timestampValue: new Date().toISOString() },
        },
      };

      await retryAxios(() => axiosAuth.patch(url, payload));

      // Step 2: Update local state
      dispatch({ type: "MOVE_NOTE", noteId, fromGroupId, toGroupId });

      Toast.show({ type: "success", text1: "Note moved successfully" });
      return true;
    } catch (err) {
      handleAxiosError(err, "move note");
      return false;
    }
  };

  const updateNote = async (
    noteId: string,
    groupId: string,
    updatedFields: {
      name: string;
      content: string;
      imageUrl?: string | null;
    }
  ): Promise<boolean> => {
    try {
      const axiosAuth = await getAxiosWithAuth();

      // Step 1: Prepare updated fields
      const now = new Date().toISOString();
      const url = `${getFirestoreUrl(
        "notes"
      )}/${noteId}?updateMask.fieldPaths=name&updateMask.fieldPaths=content&updateMask.fieldPaths=imageUrl&updateMask.fieldPaths=updateAt`;

      const payload = {
        fields: {
          name: { stringValue: updatedFields.name },
          content: { stringValue: updatedFields.content },
          imageUrl: updatedFields.imageUrl
            ? { stringValue: updatedFields.imageUrl }
            : { nullValue: null },
          updateAt: { timestampValue: now },
        },
      };

      // Step 2: Send update to Firestore
      await retryAxios(() => axiosAuth.patch(url, payload));

      // Step 3: Update local state
      dispatch({
        type: "UPDATE_NOTE",
        groupId,
        noteId,
        updatedFields: {
          ...updatedFields,
          updateAt: new Date(now),
        },
      });

      Toast.show({ type: "success", text1: "Note updated" });
      return true;
    } catch (err) {
      handleAxiosError(err, "update note");
      return false;
    }
  };

  const togglePinNote = async (
    noteId: string,
    groupId: string,
    currentPinned: boolean
  ): Promise<boolean> => {
    try {
      const axiosAuth = await getAxiosWithAuth();

      // Step 1: Prepare update payload
      const pinnedValue = !currentPinned;
      const now = new Date().toISOString();
      const url = `${getFirestoreUrl(
        "notes"
      )}/${noteId}?updateMask.fieldPaths=pinned&updateMask.fieldPaths=updateAt`;

      const payload = {
        fields: {
          pinned: { booleanValue: pinnedValue },
          updateAt: { timestampValue: now },
        },
      };

      // Step 2: Send update to Firestore
      await retryAxios(() => axiosAuth.patch(url, payload));

      // Step 3: Update local state
      dispatch({
        type: "UPDATE_PIN",
        payload: { groupId, noteId, pinned: pinnedValue },
      });

      Toast.show({
        type: "success",
        text1: `Note ${pinnedValue ? "pinned" : "unpinned"} successfully`,
      });

      return true;
    } catch (err) {
      handleAxiosError(err, "toggle pin note");
      return false;
    }
  };

  const toggleLockNote = async (
    noteId: string,
    groupId: string,
    currentLocked: boolean
  ): Promise<boolean> => {
    try {
      const axiosAuth = await getAxiosWithAuth();

      // Step 1: Prepare update payload
      const lockedValue = !currentLocked;
      const now = new Date().toISOString();
      const url = `${getFirestoreUrl(
        "notes"
      )}/${noteId}?updateMask.fieldPaths=locked&updateMask.fieldPaths=updateAt`;

      const payload = {
        fields: {
          locked: { booleanValue: lockedValue },
          updateAt: { timestampValue: now },
        },
      };

      // Step 2: Send update to Firestore
      await retryAxios(() => axiosAuth.patch(url, payload));

      // Step 3: Update local state
      dispatch({
        type: "UPDATE_LOCK",
        payload: { groupId, noteId, locked: lockedValue },
      });

      Toast.show({
        type: "success",
        text1: `Note ${lockedValue ? "locked" : "unlocked"} successfully`,
      });

      return true;
    } catch (err) {
      handleAxiosError(err, "toggle lock note");
      return false;
    }
  };

  const clearGroups = () => {
    console.log("clearGroups");
    dispatch({ type: "CLEAR_GROUPS", payload: null });
  };

  return {
    fetchGroups,
    addGroup,
    renameGroup,
    deleteGroup,
    fetchNotes,
    loadMoreNotes,
    loadMoreGroups,
    addNote,
    deleteNote,
    moveNote,
    updateNote,
    togglePinNote,
    toggleLockNote,
    clearGroups,
  };
}
