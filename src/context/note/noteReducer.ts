import { State, Action } from "./noteTypes";

export function noteReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_LOADING_NOTE":
      return { ...state, loadingNote: action.payload };
    case "SET_NOTES":
      return {
        ...state,
        notesByGroup: {
          ...state.notesByGroup,
          [action.groupId]: action.notes,
        },
        lastNoteDoc: {
          ...state.lastNoteDoc,
          [action.groupId]: action.lastDoc,
        },
        canLoadMoreNotes: {
          ...state.canLoadMoreNotes,
          [action.groupId]: action.canLoadMore,
        },
      };

    case "RESET_NOTES":
      return { ...state, notesByGroup: {} };

    case "ADD_GROUP":
      return {
        ...state,
        noteGroups: [action.payload, ...state.noteGroups],
      };

    case "RENAME_GROUP": {
      const updatedGroups = state.noteGroups.map((group) =>
        group.id === action.payload.groupId
          ? { ...group, name: action.payload.newName }
          : group
      );

      const renamedGroup = updatedGroups.find(
        (group) => group.id === action.payload.groupId
      );

      const otherGroups = updatedGroups.filter(
        (group) => group.id !== action.payload.groupId
      );

      return {
        ...state,
        noteGroups: renamedGroup
          ? [renamedGroup, ...otherGroups]
          : updatedGroups,
      };
    }

    case "DELETE_GROUP":
      return {
        ...state,
        noteGroups: state.noteGroups.filter(
          (group) => group.id !== action.payload
        ),
      };

    case "ADD_NOTE":
      return {
        ...state,
        notesByGroup: {
          ...state.notesByGroup,
          [action.groupId]: [
            action.note,
            ...(state.notesByGroup[action.groupId] || []),
          ],
        },
      };

    case "UPDATE_NOTE": {
      const groupNotes = state.notesByGroup[action.groupId] || [];

      const updatedNotes = groupNotes.map((note) =>
        note.id === action.noteId
          ? {
              ...note,
              ...action.updatedFields,
              updateAt: action.updatedFields.updateAt || new Date(),
            }
          : note
      );

      // Reorder notes to place the updated note at the beginning
      const reorderedNotes = [
        updatedNotes.find((note) => note.id === action.noteId)!,
        ...updatedNotes.filter((note) => note.id !== action.noteId),
      ];

      return {
        ...state,
        notesByGroup: {
          ...state.notesByGroup,
          [action.groupId]: reorderedNotes.map((note) => ({
            ...note,
            imageUrl: note.imageUrl ?? undefined,
          })),
        },
      };
    }

    case "DELETE_NOTE":
      return {
        ...state,
        notesByGroup: {
          ...state.notesByGroup,
          [action.groupId]: (state.notesByGroup[action.groupId] || []).filter(
            (note) => note.id !== action.noteId
          ),
        },
      };

    case "MOVE_NOTE": {
      const fromNotes = state.notesByGroup[action.fromGroupId] || [];
      const updatedFromNotes = fromNotes.filter(
        (note) => note.id !== action.noteId
      );

      return {
        ...state,
        notesByGroup: {
          ...state.notesByGroup,
          [action.fromGroupId]: updatedFromNotes,
        },
      };
    }

    case "APPEND_NOTES": {
      const existing = state.notesByGroup[action.groupId] || [];
      return {
        ...state,
        notesByGroup: {
          ...state.notesByGroup,
          [action.groupId]: [...existing, ...action.notes],
        },
        lastNoteDoc: {
          ...state.lastNoteDoc,
          [action.groupId]: action.lastDoc,
        },
        canLoadMoreNotes: {
          ...state.canLoadMoreNotes,
          [action.groupId]: action.canLoadMore,
        },
      };
    }

    case "SET_GROUPS":
      return {
        ...state,
        noteGroups: action.payload.groups,
        lastGroupDoc: action.payload.lastDoc,
        canLoadMoreGroups: action.payload.canLoadMore,
      };

    case "APPEND_GROUPS":
      return {
        ...state,
        noteGroups: [...state.noteGroups, ...action.payload.groups],
        lastGroupDoc: action.payload.lastDoc,
        canLoadMoreGroups: action.payload.canLoadMore,
      };

    case "UPDATE_PIN": {
      const { groupId, noteId, pinned } = action.payload;

      const notes = state.notesByGroup[groupId] || [];

      const updatedNote = {
        ...notes.find((note) => note.id === noteId)!,
        pinned,
        updateAt: new Date(),
      };

      const otherNotes = notes.filter((note) => note.id !== noteId);

      return {
        ...state,
        notesByGroup: {
          ...state.notesByGroup,
          [groupId]: [updatedNote, ...otherNotes],
        },
      };
    }

    case "UPDATE_LOCK": {
      const { groupId, noteId, locked } = action.payload;

      const notes = state.notesByGroup[groupId] || [];

      const updatedNote = {
        ...notes.find((note) => note.id === noteId)!,
        locked,
        updateAt: new Date(),
      };

      const otherNotes = notes.filter((note) => note.id !== noteId);

      return {
        ...state,
        notesByGroup: {
          ...state.notesByGroup,
          [groupId]: [updatedNote, ...otherNotes],
        },
      };
    }

    case "CLEAR_GROUPS":
      return { ...state, noteGroups: [] };

    default:
      return state;
  }
}
