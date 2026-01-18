import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  modalContainer: {
    width: "85%",
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    color: colors.text,
  },
  subTitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: colors.textLight,
  },
  input: {
    width: 42,
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    borderColor: colors.border,
  },
  error: {
    color: colors.error,
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
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "500",
  },
  unlockText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "bold",
  },
});
