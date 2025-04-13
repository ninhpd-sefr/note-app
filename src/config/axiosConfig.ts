import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resetToLogin } from "../services/navigationService";
import { signOutUser } from "../services/AuthService";

export const getAxiosWithAuth = async () => {
  const raw = await AsyncStorage.getItem("user");

  const parsed = JSON.parse(raw || "null");
  const token = parsed?.stsTokenManager?.accessToken;
  const expirationTime = parsed?.stsTokenManager?.expirationTime;

  if (!token || !expirationTime) {
    throw new Error("Missing token or expirationTime");
  }

  const now = Date.now();
  const isExpired = now >= Number(expirationTime);

  if (isExpired) {
    console.warn(
      "Token expired at:",
      new Date(Number(expirationTime)).toISOString()
    );
    await signOutUser();
    await AsyncStorage.removeItem("user");
    resetToLogin();
    throw new Error("Token expired. Login again.");
  }

  return axios.create({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    timeout: 3000,
  });
};
