import React, { createContext, useReducer, useContext, ReactNode } from "react";

import { State, NoteContextType } from "./noteTypes";
import { noteReducer } from "./noteReducer";
import { useNoteActions } from "../../services/noteService";

// Initial state
const initialState: State = {
  noteGroups: [],
  notesByGroup: {},
  loading: false,
  loadingNote: false,
  lastNoteDoc: {},
  canLoadMoreNotes: {},
};

// Create context
const NoteContext = createContext<NoteContextType | undefined>(undefined);

// Provider
export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(noteReducer, initialState);
  const actions = useNoteActions(state, dispatch);

  const value: NoteContextType = {
    ...state,
    ...actions,
  };

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
};

// Hook to use context
export const useNote = (): NoteContextType => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useNote must be used within a NoteProvider");
  }
  return context;
};
