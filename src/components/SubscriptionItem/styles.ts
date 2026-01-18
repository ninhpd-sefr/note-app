import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  // Subscription Item
  subscriptionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.background,
  },

  // Checkbox
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.borderLight,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  // Subscription Icon
  subscriptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundDark,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  // Subscription Details
  subscriptionDetails: {
    flex: 1,
    gap: 8,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },

  // Tags
  tagsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Price and Billing
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  billingPeriod: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: "capitalize",
  },

  // Billing Info
  billingInfo: {
    marginBottom: 8,
  },
  nextBillingText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // More Info Button
  moreInfoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  moreInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // More Options
  moreOptions: {
    padding: 8,
    marginTop: 4,
  },

  // Menu Styles
  menuContent: {
    backgroundColor: colors.background,
    borderRadius: 12,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  menuItemTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "500",
  },
  menuItemTitleError: {
    color: colors.error,
    fontSize: 15,
    fontWeight: "500",
  },
});
