import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { styles } from "./styles";
import { colors } from "../../constants/colors";
import { useLanguage } from "../../context/language/LanguageContext";

interface LoadingModalProps {
  visible: boolean;
  text?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ visible, text = "" }) => {
  const { t } = useLanguage();
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color={colors.loading} />
      <Text style={styles.loadingText}>{text || t("loading.text")}</Text>
    </View>
  );
};

export default LoadingModal;
