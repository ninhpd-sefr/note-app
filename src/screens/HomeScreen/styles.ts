import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
  scrollView: {
    maxHeight: 70,
    minHeight: 60,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    alignItems: "center",
    paddingVertical: 8,
    flexDirection: "row",
  },
  headerTitle: { fontSize: 30, fontWeight: "bold", color: colors.text },
  groupTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 20,
    marginBottom: 10,
    color: colors.textDark,
  },
  userName: { fontSize: 16, color: colors.textLight, marginTop: 2 },
  logoutText: { color: colors.info, fontSize: 18, fontWeight: "600" },
  noteItem: {
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: colors.backgroundDark,
  },
  noteText: { fontSize: 18, fontWeight: "500", color: colors.text },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  menu: { borderRadius: 10, elevation: 4 },
  menuContent: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: 4,
  },
  menuItemText: { fontSize: 16, color: colors.textDark },
  deleteText: { color: colors.error, fontWeight: "600" },
  userGuideButton: {
    marginLeft: 10,
  },
});
