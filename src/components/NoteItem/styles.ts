import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  noteCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.backgroundDark,
    marginBottom: 10,
    flex: 1,
    marginRight: 8,
  },
  topIcons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 4,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 16,
    color: colors.textDark,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  noteImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginTop: 10,
    resizeMode: "cover",
  },
});
