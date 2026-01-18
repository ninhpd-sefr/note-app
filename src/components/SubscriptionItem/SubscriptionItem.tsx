import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Menu, useTheme } from "react-native-paper";
import { colors } from "../../constants/colors";
import { Subscription } from "../../types/type";
import { styles } from "./styles";
import { useLanguage } from "../../context/language/LanguageContext";

interface SubscriptionItemProps {
  subscription: Subscription;
  isSelected: boolean;
  onPress: () => void;
  onSelect: () => void;
  onMoreInfoPress: () => void;
  onUpdate?: (subscription: Subscription) => void;
  onDelete?: (subscription: Subscription) => void;
}

export default function SubscriptionItem({
  subscription,
  isSelected,
  onPress,
  onSelect,
  onMoreInfoPress,
  onUpdate,
  onDelete,
}: SubscriptionItemProps) {
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  const theme = useTheme();
  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return colors.statusActive;
      case "paused":
        return colors.statusPaused;
      case "canceled":
        return colors.statusCancelled;
      case "trial":
        return colors.statusActive; // Treat trial as active for now
      default:
        return colors.statusDefault;
    }
  };

  const statusColors = getStatusColor(subscription.status || "unknown");

  const handleMenuPress = () => {
    setShowMenu(true);
  };

  const handleUpdate = () => {
    setShowMenu(false);
    onUpdate?.(subscription);
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete?.(subscription);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  return (
    <TouchableOpacity style={styles.subscriptionItem} onPress={onPress}>
      {/* Checkbox */}
      <TouchableOpacity style={styles.checkboxContainer} onPress={onSelect}>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color={colors.secondary} />
          )}
        </View>
      </TouchableOpacity>

      {/* Subscription Icon */}
      <View style={styles.subscriptionIcon}>
        <Ionicons
          name="briefcase-outline"
          size={24}
          color={colors.textSecondary}
        />
      </View>

      {/* Subscription Details */}
      <View style={styles.subscriptionDetails}>
        <Text style={styles.subscriptionName}>
          {subscription.service_name || t("subscription.unknown.service")}
        </Text>

        {/* Description */}
        {subscription.description && subscription.description.trim() && (
          <Text style={styles.subscriptionDescription} numberOfLines={2}>
            {subscription.description}
          </Text>
        )}

        {/* Tags */}
        <View style={styles.tagsContainer}>
          <View style={[styles.tag, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.tagText, { color: statusColors.text }]}>
              {subscription.status
                ? t(`subscription.status.${subscription.status}`)
                : t("subscription.unknown")}
            </Text>
          </View>
          <View
            style={[styles.tag, { backgroundColor: colors.categoryDefault.bg }]}
          >
            <Text
              style={[styles.tagText, { color: colors.categoryDefault.text }]}
            >
              {subscription.billing_cycle
                ? t(`subscription.billing.${subscription.billing_cycle}`)
                : t("subscription.unknown")}
            </Text>
          </View>
        </View>

        {/* Price and Billing */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {formatPrice(
              subscription.amount || 0,
              subscription.currency || "USD"
            )}
          </Text>
          <Text style={styles.billingPeriod}>
            {subscription.billing_cycle
              ? t(`subscription.billing.${subscription.billing_cycle}`)
              : t("subscription.unknown")}
          </Text>
        </View>

        {/* Next Billing Info */}
        <View style={styles.billingInfo}>
          <Text style={styles.nextBillingText}>
            {t("subscription.next.billing")}{" "}
            {subscription.next_date
              ? subscription.next_date instanceof Date
                ? subscription.next_date.toLocaleDateString()
                : subscription.next_date.toDate().toLocaleDateString()
              : t("subscription.not.set")}
          </Text>
        </View>

        {/* More Info */}
        <TouchableOpacity
          style={styles.moreInfoButton}
          onPress={onMoreInfoPress}
        >
          <Text style={styles.moreInfoText}>{t("subscription.more.info")}</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      <Menu
        visible={showMenu}
        onDismiss={handleCloseMenu}
        anchor={
          <TouchableOpacity
            style={styles.moreOptions}
            onPress={handleMenuPress}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        }
        contentStyle={styles.menuContent}
        theme={{
          ...theme,
          colors: {
            ...theme.colors,
            surface: colors.background,
            onSurface: colors.text,
            outline: colors.borderLight,
          },
        }}
      >
        <Menu.Item
          onPress={handleUpdate}
          title={t("subscription.action.update")}
          leadingIcon="pencil"
          titleStyle={styles.menuItemTitle}
          style={styles.menuItem}
        />
        <Menu.Item
          onPress={handleDelete}
          title={t("subscription.action.delete")}
          leadingIcon="delete"
          titleStyle={styles.menuItemTitleError}
          style={styles.menuItem}
        />
      </Menu>
    </TouchableOpacity>
  );
}
