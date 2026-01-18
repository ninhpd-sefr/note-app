import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";

const { width: screenWidth } = Dimensions.get("window");

export type Language = "en" | "vi";

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

interface LanguageDropdownProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const languageOptions: LanguageOption[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
];

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = languageOptions.find(
    (option) => option.code === selectedLanguage
  );

  const handleLanguageSelect = (language: Language) => {
    onLanguageChange(language);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <View style={styles.selectedOption}>
          <Text style={styles.flag}>{selectedOption?.flag}</Text>
          <Text style={styles.languageName}>{selectedOption?.name}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.textLight} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdownContainer}>
            {languageOptions.map((option) => (
              <TouchableOpacity
                key={option.code}
                style={[
                  styles.optionItem,
                  selectedLanguage === option.code && styles.selectedOptionItem,
                ]}
                onPress={() => handleLanguageSelect(option.code)}
              >
                <Text style={styles.optionFlag}>{option.flag}</Text>
                <Text
                  style={[
                    styles.optionText,
                    selectedLanguage === option.code &&
                      styles.selectedOptionText,
                  ]}
                >
                  {option.name}
                </Text>
                {selectedLanguage === option.code && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 120,
  },
  selectedOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    fontSize: 18,
    marginRight: 8,
  },
  languageName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 160,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedOptionItem: {
    backgroundColor: colors.backgroundLight,
  },
  optionFlag: {
    fontSize: 18,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: "600",
  },
});
