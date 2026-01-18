import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  modalContent: {
    width: 300,
    maxHeight: "80%",
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.text,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.backgroundDark,
    marginBottom: 10,
    borderRadius: 8,
  },
  groupText: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: "500",
  },
  closeButton: {
    marginTop: 10,
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  closeText: {
    fontSize: 16,
    color: colors.text,
  },
});
