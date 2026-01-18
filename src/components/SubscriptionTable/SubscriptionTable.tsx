import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { styles } from "./styles";
import { Subscription } from "../../types/type";
import SubscriptionItem from "../SubscriptionItem";
import { useLanguage } from "../../context/language/LanguageContext";

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onSubscriptionPress?: (subscription: Subscription) => void;
  onMoreInfoPress?: (subscription: Subscription) => void;
  onSelectAll?: (selected: boolean) => void;
  onSubscriptionSelect?: (subscriptionId: string, selected: boolean) => void;
  selectedSubscriptions?: string[];
  onUpdateSubscription?: (subscription: Subscription) => void;
  onDeleteSubscription?: (subscription: Subscription) => void;
}

export default function SubscriptionTable({
  subscriptions,
  onSubscriptionPress,
  onMoreInfoPress,
  onSelectAll,
  onSubscriptionSelect,
  selectedSubscriptions = [],
  onUpdateSubscription,
  onDeleteSubscription,
}: SubscriptionTableProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false
  );

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    onSelectAll?.(newSelectAll);
  };

  const handleSubscriptionSelect = (subscriptionId: string) => {
    const isSelected = selectedSubscriptions.includes(subscriptionId);
    onSubscriptionSelect?.(subscriptionId, !isSelected);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t("subscription.search.placeholder")}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Select All Row */}
      <View style={styles.selectAllRow}>
        <TouchableOpacity
          style={styles.selectAllButton}
          onPress={handleSelectAll}
        >
          <View style={[styles.checkbox, selectAll && styles.checkboxSelected]}>
            {selectAll && (
              <Ionicons name="checkmark" size={16} color={colors.secondary} />
            )}
          </View>
          <Text style={styles.selectAllText}>
            {t("subscription.select.all")}
          </Text>
        </TouchableOpacity>
        <Text style={styles.itemCount}>
          {filteredSubscriptions.length} {t("subscription.items")}
        </Text>
      </View>

      {/* Subscription List */}
      <ScrollView
        style={styles.subscriptionList}
        showsVerticalScrollIndicator={false}
      >
        {filteredSubscriptions.map((subscription) => {
          const isSelected = selectedSubscriptions.includes(subscription.id);

          return (
            <SubscriptionItem
              key={subscription.id}
              subscription={subscription}
              isSelected={isSelected}
              onPress={() => onSubscriptionPress?.(subscription)}
              onSelect={() => handleSubscriptionSelect(subscription.id)}
              onMoreInfoPress={() => onMoreInfoPress?.(subscription)}
              onUpdate={onUpdateSubscription}
              onDelete={onDeleteSubscription}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
