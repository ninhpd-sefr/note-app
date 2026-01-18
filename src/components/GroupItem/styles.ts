import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  noteItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  textContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  noteText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textDark,
  },
  noteCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
