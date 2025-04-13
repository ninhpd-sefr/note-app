import Constants from "expo-constants";
import * as Network from "expo-network";
import Toast from "react-native-toast-message";

/**
 * Represents the file object structure for FormData
 */
interface FormDataFile {
  uri: string;
  type: string;
  name: string;
}

/**
 * Expected response shape from Cloudinary
 */
interface CloudinaryResponse {
  secure_url?: string;
  error?: {
    message?: string;
  };
}

/**
 * Upload an image to Cloudinary
 * @param uri string - local image URI
 * @param setUploading optional - setter to show uploading state
 * @returns Promise<string | null> - the secure URL or null if failed
 */

export const uploadImageToCloudinary = async (
  uri: string,
  setUploading?: (val: boolean) => void
): Promise<string | null> => {
  // Toast.show({
  //   type: "info",
  //   text1: "Uploading image to Cloudinary...",
  // });
  if (setUploading) setUploading(true);

  const data = new FormData();

  // Create the file object with proper typing
  const file: FormDataFile = {
    uri,
    type: "image/jpeg", // or detect from uri if possible
    name: "note.jpg",
  };

  // Append file with proper typing (No need for Blob in React Native)
  data.append("file", {
    uri: file.uri,
    type: file.type,
    name: file.name,
  } as unknown as Blob);

  const uploadPreset = Constants.expoConfig?.extra?.CLOUDINARY_UPLOAD_PRESET;
  const cloudName = Constants.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME;

  // Check Cloudinary configuration
  if (!uploadPreset || !cloudName) {
    console.error("Cloudinary configuration missing");
    alert("⚠️ Cloudinary configuration is missing. Please check your setup.");
    if (setUploading) setUploading(false);
    return null;
  }

  data.append("upload_preset", uploadPreset);

  try {
    // Send request to Cloudinary
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );

    const result: CloudinaryResponse = await res.json();

    if (!res.ok || !result.secure_url) {
      console.log("Upload failed:", result.error);
      throw new Error(
        result?.error?.message || "Upload failed. No secure URL returned."
      );
    }

    console.log(" Image uploaded successfully:", result.secure_url);
    return result.secure_url;
  } catch (err) {
    console.log("Upload failed:", err);
    throw err;
  } finally {
    if (setUploading) setUploading(false);
  }
};
