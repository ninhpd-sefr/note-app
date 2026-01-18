import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.text,
  },
  content: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 22,
  },
  timestamp: {
    marginTop: 20,
    fontSize: 12,
    color: colors.textSecondary,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    height: 50,
    color: colors.inputText,
  },
  contentInput: {
    fontSize: 16,
    color: colors.inputText,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: 10,
    minHeight: 150,
    textAlignVertical: "top",
    backgroundColor: colors.inputBackground,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  saveText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: "600",
  },
  iconButton: {
    padding: 10,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  imageButton: {
    backgroundColor: colors.backgroundDark,
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 12,
  },
  imageButtonText: {
    color: colors.textDark,
    fontSize: 14,
  },
  imageContainer: {
    position: "relative", // Allows positioning the remove button
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    position: "absolute", // Position it absolutely within the container
    top: 10, // Position it 10 units from the top
    right: 10, // Position it 10 units from the right
    backgroundColor: colors.error,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  removeImageText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: "500",
  },
});
