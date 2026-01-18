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
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 15,
    color: colors.inputText,
    height: 45,
    backgroundColor: colors.inputBackground,
  },
  modalActions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cancelText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  createText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "bold",
  },
  disabledText: {
    color: colors.textDisabled,
  },
});
