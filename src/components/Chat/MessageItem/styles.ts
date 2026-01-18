import { StyleSheet } from "react-native";
import { colors } from "../../../constants/colors";

export const styles = StyleSheet.create({
  bubbleRow: {
    flexDirection: "row",
    marginVertical: 4,
  },
  rowStart: {
    justifyContent: "flex-start",
  },
  rowEnd: {
    justifyContent: "flex-end",
  },
  bubble: {
    maxWidth: "85%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.primary,
  },
  botBubble: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorBubble: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: colors.error,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
    margin: 0,
    padding: 0,
  },
  userText: {
    color: colors.secondary,
  },
  botText: {
    color: colors.text,
  },
});
