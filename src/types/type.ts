import { Timestamp } from "firebase/firestore";

export interface Note {
  id: string;
  name: string;
  content: string;
  imageUrl?: string;
  createAt: Timestamp | Date;
  updateAt: Timestamp | Date;
  pinned?: boolean;
  locked?: boolean;
}

export type NoteGroup = {
  id: string;
  name: string;
  updateAt?: Date;
};

// types/firestore.ts

export type FirestoreQueryResult = {
  document?: {
    name: string;
    fields: Record<string, unknown>;
    createTime?: string;
    updateTime?: string;
  };
  readTime?: string;
};
