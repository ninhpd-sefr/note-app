import { FirebaseError } from "firebase/app";
import Toast from "react-native-toast-message";
import { AxiosError } from "axios";

type FirebaseRestErrorResponse = {
  error: {
    code: number;
    message: string;
    status: string;
  };
};

export const handleAxiosError = (
  err: unknown,
  context: string = "operation"
) => {
  const error = err as AxiosError<FirebaseRestErrorResponse>;

  if (error.response) {
    const message =
      error.response.data?.error?.message || "Unknown server error";

    Toast.show({
      type: "error",
      text1: `Failed to ${context}`,
      text2: message,
    });
  } else if (error.request) {
    Toast.show({
      type: "error",
      text1: "Network error",
      text2: "Please check your internet connection.",
    });
  } else {
    Toast.show({
      type: "error",
      text1: "Unexpected error",
      text2: (error as Error).message || "Unknown error occurred.",
    });
  }
};

// Error Handler for Firebase Auth
export const handleAuthError = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    const errorMap: Record<string, string> = {
      "auth/invalid-email": "Invalid email format",
      "auth/user-not-found": "User not found. Please sign up first",
      "auth/wrong-password": "Incorrect password. Try again",
      "auth/too-many-requests": "Too many attempts. Try again later",
      "auth/network-request-failed": "Check your internet connection",
      "auth/email-already-in-use": "Email already registered. Try logging in",
      "auth/weak-password": "Password should be at least 6 characters",
      "auth/invalid-credential": "Incorrect password or email. Try again",
    };
    return errorMap[error.code] || "An unexpected error occurred.";
  }
  return "An unknown error occurred.";
};
