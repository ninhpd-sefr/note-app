import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import Toast from "react-native-toast-message";
import { retryAxios } from "../../utils"; // update import as needed
import { getAxiosWithAuth } from "../../config/axiosConfig";
import { getFirestoreUrl } from "../../utils/firebaseUrl";
import { AxiosError } from "axios";
import { styles } from "./styles";
import { useLanguage } from "../../context/language/LanguageContext";

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
  const { t } = useLanguage();
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
          setError(t("unlock.error.fetching"));
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
          setError(t("unlock.pin.not.found"));
          setStep("create");
          return;
        }

        if (value === serverPin) {
          setValue("");
          setError("");
          onSuccess();
        } else {
          setError(t("unlock.incorrect.pin"));
          setValue("");
        }
      }
    } catch (err) {
      const error = err as AxiosError;

      const isNetworkError = !error.response && !!error.request;

      if (isNetworkError) {
        Toast.show({
          type: "error",
          text1: t("unlock.network.error.title"),
          text2: t("unlock.network.error.message"),
        });
        setError(t("unlock.network.error"));
      } else if (error.response?.status === 404) {
        setError(t("unlock.pin.not.found"));
        setStep("create");
      } else {
        setError(t("unlock.something.wrong"));
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
          {step === "create" ? t("unlock.create.pin.title") : title}
        </Text>
        <Text style={styles.subTitle}>
          {step === "create" ? t("unlock.create.pin.subtitle") : subTitle}
        </Text>

        {error === t("unlock.error.fetching") ? (
          <Text style={styles.error}>{t("unlock.error.fetching")}</Text>
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
          <Text style={styles.subTitle}>{t("unlock.checking")}</Text>
        )}

        {error && error !== t("unlock.error.fetching") ? (
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
            <Text style={styles.cancelText}>{t("unlock.cancel")}</Text>
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
              {step === "create" ? t("unlock.save") : t("unlock.verify")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </Modal>
  );
};

export default UnlockNoteModal;
