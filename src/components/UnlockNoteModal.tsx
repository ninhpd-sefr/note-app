import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Modal from "react-native-modal";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import Toast from "react-native-toast-message";
import { retryAxios } from "../utils"; // update import as needed
import { getAxiosWithAuth } from "../config/axiosConfig";
import { getFirestoreUrl } from "../utils/firebaseUrl";
import { AxiosError } from "axios";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title: string;
  subTitle: string;
  userId: string;
};

const CELL_COUNT = 6;

const UnlockNoteModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
  title,
  subTitle,
  userId,
}) => {
  const [value, setValue] = useState("");
  const [step, setStep] = useState<"checking" | "create" | "verify">(
    "checking"
  );
  const [error, setError] = useState("");

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  useEffect(() => {
    if (!visible) return;

    const checkIfHasPin = async () => {
      try {
        const axiosAuth = await getAxiosWithAuth();
        const url = `${getFirestoreUrl("locked")}/${userId}`;

        const res = await retryAxios(() => axiosAuth.get(url));
        setStep(res?.data?.fields?.pin ? "verify" : "create");
      } catch (err: unknown) {
        if (err instanceof AxiosError && err.response?.status === 404) {
          setStep("create");
        } else {
          setError("Error fetching PIN.");
        }
      }
    };

    setValue("");
    setError("");
    setStep("checking");
    checkIfHasPin();
  }, [visible]);

  const handleAction = async () => {
    if (value.length !== CELL_COUNT) return;

    try {
      const axiosAuth = await getAxiosWithAuth();
      const url = `${getFirestoreUrl("locked")}/${userId}`;

      if (step === "create") {
        const body = {
          fields: {
            pin: { stringValue: value },
          },
        };

        await retryAxios(() => axiosAuth.patch(url, body));
        setValue("");
        setError("");
        onSuccess();
      } else if (step === "verify") {
        const res = await retryAxios(() => axiosAuth.get(url));
        const serverPin = res?.data?.fields?.pin?.stringValue;

        if (!serverPin) {
          setError("PIN not found. Please set a new one.");
          setStep("create");
          return;
        }

        if (value === serverPin) {
          setValue("");
          setError("");
          onSuccess();
        } else {
          setError("Incorrect PIN. Please try again.");
          setValue("");
        }
      }
    } catch (err) {
      const error = err as AxiosError;

      const isNetworkError = !error.response && !!error.request;

      if (isNetworkError) {
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: "Please check your internet connection.",
        });
        setError("Network error. Please check your connection.");
      } else if (error.response?.status === 404) {
        setError("PIN not found. Please set a new one.");
        setStep("create");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <Modal
      isVisible={visible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={300}
      animationOutTiming={300}
      backdropOpacity={0.6}
      onBackButtonPress={onClose}
      style={styles.modal}
    >
      <View style={styles.modalContainer}>
        <Text style={styles.title}>
          {step === "create" ? "Create PIN" : title}
        </Text>
        <Text style={styles.subTitle}>
          {step === "create" ? "Set your 6-digit password" : subTitle}
        </Text>

        {error === "Error fetching PIN." ? (
          <Text style={styles.error}>{error} Please try again later.</Text>
        ) : step !== "checking" ? (
          <CodeField
            ref={ref}
            {...props}
            value={value}
            onChangeText={(text) => setValue(text.replace(/[^0-9]/g, ""))}
            cellCount={CELL_COUNT}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoFocus
            renderCell={({ index, symbol, isFocused }) => (
              <View
                key={index}
                style={[
                  styles.input,
                  { borderColor: isFocused ? "#000" : "#ccc" },
                ]}
                onLayout={getCellOnLayoutHandler(index)}
              >
                <Text style={{ fontSize: 22 }}>
                  {symbol ? "•" : isFocused ? <Cursor /> : null}
                </Text>
              </View>
            )}
          />
        ) : (
          <Text style={styles.subTitle}>Checking...</Text>
        )}

        {error && error !== "Error fetching PIN." ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <View style={styles.buttons}>
          <TouchableOpacity
            onPress={() => {
              setValue("");
              setError("");
              onClose();
            }}
            style={styles.button}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAction}
            disabled={value.length !== CELL_COUNT}
            style={[
              styles.button,
              value.length !== CELL_COUNT && { opacity: 0.4 },
            ]}
          >
            <Text style={styles.unlockText}>
              {step === "create" ? "Save" : "Verify"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </Modal>
  );
};

export default UnlockNoteModal;

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#444",
  },
  input: {
    width: 42,
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "bold",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    width: "100%",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "500",
  },
  unlockText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
