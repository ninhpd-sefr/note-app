import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../../context/language/LanguageContext";
import { colors } from "../../constants/colors";
import { styles } from "./styles";

interface HeaderSectionProps {
  title: string;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackPress?: () => void;
}

export default function HeaderSection({
  title,
  showBackButton = true,
  backButtonText,
  onBackPress,
}: HeaderSectionProps) {
  const navigation = useNavigation();
  const { t } = useLanguage();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.headerRow}>
      {showBackButton && (
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
          <Text style={styles.backText}>
            {backButtonText || t("chat.back")}
          </Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}
