import Toast from "react-native-toast-message";
import { Note } from "../types/type";
import * as Network from "expo-network";
import NetInfo from "@react-native-community/netinfo";
import { AxiosError } from "axios";

type NoteOrPlaceholder = Note | { id: string; isPlaceholder: true };
export const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();

export const removeDuplicates = (
  arr: NoteOrPlaceholder[]
): NoteOrPlaceholder[] => {
  const seen = new Set<string>();
  return arr.filter((item) => {
    if (!seen.has(item.id)) {
      // If the id has not been encountered before
      seen.add(item.id); // Add the id to the seen Set
      return true; // Keep the item in the result array
    }
    return false; // Skip the item (duplicate)
  });
};

// check by expo network
export const checkNetworkConnection = async (): Promise<boolean> => {
  const netInfo = await Network.getNetworkStateAsync();
  if (!netInfo.isConnected) {
    console.warn("No internet connection. Please try again later.");
    Toast.show({
      type: "error",
      text1: "Network Error",
      text2: "No internet connection. Please check your network.",
    });
    return false;
  }
  return true;
};

//Check by net info
export const checkNetworkStability = async (): Promise<boolean> => {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected || !netState.isInternetReachable) {
    return false;
  }

  const controller = new AbortController();
  const timeout = 2000;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch("https://www.google.com", {
      method: "HEAD",
      cache: "no-cache",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch (err) {
    clearTimeout(timeoutId);
    return false;
  }
};

// Retry axios request
export const retryAxios = async (
  requestFn: () => Promise<any>,
  retries = 3,
  delay = 3000
): Promise<any> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      const isNetworkError =
        error instanceof Error && "request" in error && !("response" in error);

      if (!isNetworkError || attempt === retries) throw error;

      const retryCount = attempt + 1;
      const currentDelay = delay * retryCount;

      Toast.show({
        type: "info",
        text1: `Network error — retrying (${retryCount}/${retries})`,
        text2: `Waiting ${(currentDelay / 1000).toFixed(
          1
        )}s before next attempt...`,
        visibilityTime: currentDelay - 100,
      });

      console.warn(`🔁 Retry ${retryCount}/${retries} after ${currentDelay}ms`);
      await new Promise((res) => setTimeout(res, currentDelay));
    }
  }
};
