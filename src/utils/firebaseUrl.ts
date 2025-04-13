import Constants from "expo-constants";

// Create Firestore URL for a collection
export const getFirestoreUrl = (collectionName: string): string => {
  const projectId = Constants.expoConfig?.extra?.projectId;
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}`;
};

// Create Firestore URL for a specific document
export const getFirestoreQueryUrl = (): string => {
  const projectId = Constants.expoConfig?.extra?.projectId;
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
};
