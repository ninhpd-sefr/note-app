import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { LoginManager, AccessToken } from "react-native-fbsdk-next";
import authFirebase, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { handleAuthError } from "../utils/errorHandler";

// Type definition for successful response or error
export type AuthResponse = {
  user: FirebaseUser | FirebaseAuthTypes.User | null;
  error: string | null;
};

// Sign Up with Email & Password
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await AsyncStorage.setItem("user", JSON.stringify(userCredential.user));
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    console.log("Sign up error:", error);
    return { user: null, error: handleAuthError(error) };
  }
};

// Sign In with Email & Password
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    await AsyncStorage.setItem("user", JSON.stringify(userCredential.user));

    Toast.show({
      type: "success",
      text1: "Google Login Successful",
      text2: `Welcome, ${userCredential.user?.email}`,
    });
    return { user: userCredential.user, error: null };
  } catch (error: unknown) {
    console.log("Sign in error:", error);
    return { user: null, error: handleAuthError(error) };
  }
};

// Sign Out
export const signOutUser = async (): Promise<{
  success: boolean;
  error: string | null;
}> => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error: unknown) {
    console.log("Sign out error:", error);
    return { success: false, error: handleAuthError(error) };
  }
};

// Google Login
export const signInWithGoogle = async (
  idToken: string
): Promise<AuthResponse> => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;
    await AsyncStorage.setItem("user", JSON.stringify(user));

    Toast.show({
      type: "success",
      text1: "Google Login Successful",
      text2: `Welcome, ${user.email}`,
    });

    return { user, error: null };
  } catch (error: unknown) {
    console.error("Google Sign-In Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Google login failed";

    Toast.show({
      type: "error",
      text1: "Google Login Failed",
      text2: errorMessage,
    });

    return {
      user: null,
      error: error instanceof Error ? error.message : errorMessage,
    };
  }
};

// Facebook Login
export const signInWithFacebook = async (): Promise<AuthResponse> => {
  try {
    const result = await LoginManager.logInWithPermissions([
      "public_profile",
      "email",
    ]);

    if (result.isCancelled) {
      return { user: null, error: "User cancelled the login process" };
    }

    // Get the Facebook access token
    const data = await AccessToken.getCurrentAccessToken();
    if (!data) {
      throw "Something went wrong while obtaining the access token";
    }

    // Create a Firebase credential with the Facebook token
    const facebookCredential = authFirebase.FacebookAuthProvider.credential(
      data.accessToken
    );

    // Sign-in the user with the credential
    const userCredential = await authFirebase().signInWithCredential(
      facebookCredential
    );
    const user = userCredential.user;

    // Store user info in AsyncStorage
    await AsyncStorage.setItem("user", JSON.stringify(user));

    // Show success toast
    Toast.show({
      type: "success",
      text1: "Facebook Login Successful",
    });

    return { user, error: null };
  } catch (error) {
    console.error("Facebook Login Error:", error);

    Toast.show({
      type: "error",
      text1: "Facebook Login Failed",
    });

    const errorMessage = error instanceof Error ? error.message : String(error);

    return { user: null, error: errorMessage };
  }
};
