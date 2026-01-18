import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

const ACCENT = colors.primary;
const cardBG = colors.background;
const border = colors.borderLight;

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  subtitle: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 14,
  },

  segmentWrap: {
    marginVertical: 16,
    backgroundColor: colors.backgroundDark,
    borderRadius: 14,
    padding: 6,
    flexDirection: "row",
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  segmentItemActive: {
    backgroundColor: ACCENT,
    shadowColor: colors.text,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentText: { fontSize: 14, color: colors.text, fontWeight: "600" },
  segmentTextActive: { color: colors.secondary },

  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  pillButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  pillText: { color: colors.text, fontWeight: "600" },

  addBtn: {
    marginTop: 12,
    borderRadius: 14,
  },
  addBtnText: { color: colors.secondary, fontSize: 16, fontWeight: "700" },

  card: {
    backgroundColor: cardBG,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: border,
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, color: colors.text, marginBottom: 6 },
  priceText: { fontSize: 28, fontWeight: "800", color: colors.text },
  cardCaption: { color: colors.textSecondary, marginTop: 4 },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.backgroundDark,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  tableContainer: {
    marginTop: 24,
    flex: 1,
    minHeight: 400,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  cardContent: {
    flex: 1,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.error,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: "600",
  },
});
