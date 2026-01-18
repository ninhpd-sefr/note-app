import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  modalWrapper: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.overlay,
  },
  modalContent: {
    width: "85%",
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    height: 45,
    color: colors.inputText,
    backgroundColor: colors.inputBackground,
  },
  textArea: {
    height: 150,
    textAlignVertical: "top",
  },
  imageButton: {
    backgroundColor: colors.backgroundDark,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  imageButtonText: {
    color: colors.text,
    fontSize: 14,
    textAlign: "center",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    marginBottom: 10,
  },
  imagePreview: {
    width: "100%",
    height: 150,
    borderRadius: 5,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: colors.error,
    borderRadius: 5,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: colors.secondary,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    padding: 10,
  },
  saveButton: {
    backgroundColor: colors.buttonPrimary,
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: colors.secondary,
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: colors.buttonDisabled,
  },
  disabledText: {
    color: colors.textDisabled,
  },
});
