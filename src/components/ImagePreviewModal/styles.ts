import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.overlayDark,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  fullImage: {
    width: "90%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 2,
    padding: 10,
  },
  closeText: {
    fontSize: 40,
    color: colors.secondary,
  },
});
