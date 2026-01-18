import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    color: colors.inputText,
    height: 45,
    backgroundColor: colors.inputBackground,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  renameText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "bold",
  },
  disabledText: {
    color: colors.textDisabled,
  },
});
