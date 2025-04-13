import { useRef } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { checkNetworkStability } from "../utils";

const useUploadWithRetry = () => {
  const retryCountRef = useRef(0);
  const maxRetry = 3;
  const retryDelays = [3000, 6000, 9000]; // increasing delays by retry

  const waitForReconnectAndRetry = async (
    retryFn: () => void,
    onCancel?: () => void
  ) => {
    const attemptRetry = async () => {
      const connected = await checkNetworkStability();

      if (connected) {
        retryCountRef.current = 0;
        Toast.show({
          type: "info",
          text1: "Network restored",
          text2: "Retrying upload...",
        });
        retryFn();
        return;
      }

      retryCountRef.current += 1;

      if (retryCountRef.current <= maxRetry) {
        const currentDelay =
          retryDelays[retryCountRef.current - 1] ||
          retryDelays[retryDelays.length - 1];

        Toast.show({
          type: "info",
          text1: "Network error",
          text2: `Reconnection attempt ${
            retryCountRef.current
          }/${maxRetry} in ${currentDelay / 1000}s`,
        });

        setTimeout(attemptRetry, currentDelay);
      } else {
        Alert.alert(
          "Upload Failed",
          "Network is still unstable. Do you want to retry?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                retryCountRef.current = 0;
                onCancel && onCancel();
              },
            },
            {
              text: "Retry",
              onPress: () => {
                retryCountRef.current = 0;
                attemptRetry();
              },
            },
          ]
        );
      }
    };

    attemptRetry(); // Start retry logic
  };

  const uploadWithRetry = async (
    uri: string,
    uploadFn: (uri: string) => Promise<string | null>,
    onSuccess: (url: string) => void,
    onCancel?: () => void
  ) => {
    const connected = await checkNetworkStability();

    if (!connected) {
      Toast.show({
        type: "error",
        text1: "Network error",
        text2: "Waiting for reconnection...",
      });
      await waitForReconnectAndRetry(
        () => uploadWithRetry(uri, uploadFn, onSuccess, onCancel),
        onCancel
      );
      return;
    }

    try {
      const result = await uploadFn(uri);
      if (result) {
        onSuccess(result);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("❌ Upload error:", err.message);
      } else {
        console.error("❌ Upload error:", JSON.stringify(err));
      }
      Toast.show({
        type: "error",
        text1: "Network error",
        text2: "Waiting for reconnection...",
      });
      await waitForReconnectAndRetry(
        () => uploadWithRetry(uri, uploadFn, onSuccess, onCancel),
        onCancel
      );
    }
  };

  return {
    uploadWithRetry,
  };
};

export default useUploadWithRetry;
