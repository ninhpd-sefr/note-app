import { Note, NoteGroup } from "../../types/type";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

// --- Type an optional DocumentSnapshot ---
export type OptionalDocSnap = QueryDocumentSnapshot<DocumentData> | null;

// --- State main của reducer ---
export type State = {
  noteGroups: NoteGroup[];
  notesByGroup: Record<string, Note[]>;
  loading: boolean;
  loadingNote: boolean;
  lastNoteDoc: Record<string, OptionalDocSnap>;
  canLoadMoreNotes: Record<string, boolean>;
  lastGroupDoc?: OptionalDocSnap;
  canLoadMoreGroups?: boolean;
};

// --- Interface context expose ---
export type NoteContextType = {
  noteGroups: NoteGroup[];
  notesByGroup: Record<string, Note[]>;
  loading: boolean;
  loadingNote: boolean;
  fetchGroups: (userId: string, reset?: boolean) => Promise<void>;
  addGroup: (userId: string, name: string) => Promise<boolean>;
  renameGroup: (
    groupId: string,
    newName: string,
    userId: string
  ) => Promise<boolean>;
  deleteGroup: (groupId: string, userId: string) => Promise<boolean>;
  fetchNotes: (groupId: string, reset?: boolean) => Promise<void>;
  addNote: (
    groupId: string,
    title: string,
    content: string,
    imageUrl?: string
  ) => Promise<boolean>;
  updateNote: (
    noteId: string,
    groupId: string,
    updatedFields: {
      name: string;
      content: string;
      imageUrl?: string | null;
    }
  ) => Promise<boolean>;
  deleteNote: (noteId: string, groupId: string) => Promise<boolean>;
  moveNote: (
    noteId: string,
    fromGroupId: string,
    toGroupId: string
  ) => Promise<boolean>;
  canLoadMoreNotes: Record<string, boolean>;
  loadMoreNotes: (groupId: string) => Promise<void>;
  loadMoreGroups: (userId: string) => Promise<void>;
  canLoadMoreGroups?: boolean;
  togglePinNote: (
    noteId: string,
    groupId: string,
    currentPinned: boolean
  ) => Promise<boolean>;
  toggleLockNote: (
    noteId: string,
    groupId: string,
    currentLocked: boolean
  ) => Promise<boolean>;
  clearGroups: () => void;
};

// --- Action for reducer ---
export type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_LOADING_NOTE"; payload: boolean }
  | {
      type: "SET_NOTES";
      groupId: string;
      notes: Note[];
      lastDoc: OptionalDocSnap;
      canLoadMore: boolean;
    }
  | { type: "RESET_NOTES" }
  | { type: "ADD_GROUP"; payload: NoteGroup }
  | { type: "RENAME_GROUP"; payload: { groupId: string; newName: string } }
  | { type: "DELETE_GROUP"; payload: string }
  | { type: "ADD_NOTE"; groupId: string; note: Note }
  | { type: "DELETE_NOTE"; groupId: string; noteId: string }
  | {
      type: "UPDATE_NOTE";
      groupId: string;
      noteId: string;
      updatedFields: {
        name: string;
        content: string;
        imageUrl?: string | null;
        updateAt?: Date;
      };
    }
  | {
      type: "MOVE_NOTE";
      noteId: string;
      fromGroupId: string;
      toGroupId: string;
    }
  | {
      type: "APPEND_NOTES";
      groupId: string;
      notes: Note[];
      lastDoc: OptionalDocSnap;
      canLoadMore: boolean;
    }
  | {
      type: "SET_GROUPS";
      payload: {
        groups: NoteGroup[];
        lastDoc: OptionalDocSnap;
        canLoadMore: boolean;
      };
    }
  | {
      type: "APPEND_GROUPS";
      payload: {
        groups: NoteGroup[];
        lastDoc: OptionalDocSnap;
        canLoadMore: boolean;
      };
    }
  | {
      type: "UPDATE_PIN";
      payload: {
        groupId: string;
        noteId: string;
        pinned: boolean;
      };
    }
  | {
      type: "UPDATE_LOCK";
      payload: {
        groupId: string;
        noteId: string;
        locked: boolean;
      };
    }
  | {
      type: "CLEAR_GROUPS";
      payload: null;
    };
