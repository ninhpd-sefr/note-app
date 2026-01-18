import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "flex-start",
  },
  centeredWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appbar: {
    backgroundColor: colors.primary,
    justifyContent: "space-between",
    flexDirection: "row",
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    margin: 16,
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  actionButtonWithBg: {
    backgroundColor: colors.primaryLight,
    borderRadius: 30,
    marginHorizontal: 4,
    padding: 8,
  },
});
