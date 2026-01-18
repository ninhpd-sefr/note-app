import React, { useMemo, useState, useEffect } from "react";
import {
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import SimpleButton from "../../components/SimpleButton/SimpleButton";
import HeaderSection from "../../components/HeaderSection";
import SubscriptionTable from "../../components/SubscriptionTable";
import CreateSubscriptionModal from "../../components/CreateSubscriptionModal";
import UpdateSubscriptionModal from "../../components/UpdateSubscriptionModal";
import { Subscription } from "../../types/type";
import {
  getMySubscriptions,
  deleteSubscription,
} from "../../services/subscriptionService";
import { styles } from "./styles";
import { hideLoading, showLoading } from "../../services/loadingService";
import { useLanguage } from "../../context/language/LanguageContext";

// User interface for authentication
interface User {
  uid: string;
  email?: string;
  displayName?: string;
}

export default function ManageSubscription() {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"monthly" | "annual">("monthly");
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>(
    []
  );

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  const USD = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  // Load subscriptions function
  const loadSubscriptions = async () => {
    // Use user UID if available, otherwise use default
    const userId = user?.uid || "anonymous_user";

    console.log("Loading subscriptions for user:", userId);
    showLoading();
    setError(null);
    try {
      const result = await getMySubscriptions(userId);
      console.log("Load subscriptions result:", result);
      if (result.subscriptions) {
        setSubscriptions(result.subscriptions);
      } else {
        console.log("No subscriptions found or error:", result.error);
        setError(result.error || t("subscription.error.no.subscriptions"));
      }
    } catch (err) {
      console.error("Error loading subscriptions:", err);
      setError(t("subscription.error.load.failed"));
    } finally {
      hideLoading();
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUser();
  }, []);

  // Load subscriptions regardless of user authentication
  useEffect(() => {
    loadSubscriptions();
  }, [user?.uid]);

  const monthlySpend = subscriptions.reduce(
    (sum, sub) => sum + (sub.amount || 0),
    0
  );
  const annualProjection = monthlySpend * 12;
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === "active"
  ).length;
  const upcomingRenewals = subscriptions.filter((sub) => {
    if (!sub.next_date) return false;
    const nextDate =
      sub.next_date instanceof Date ? sub.next_date : sub.next_date.toDate();
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  // Handler functions
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedSubscriptions(subscriptions.map((sub) => sub.id));
    } else {
      setSelectedSubscriptions([]);
    }
  };

  const handleSubscriptionSelect = (
    subscriptionId: string,
    selected: boolean
  ) => {
    if (selected) {
      setSelectedSubscriptions((prev) => [...prev, subscriptionId]);
    } else {
      setSelectedSubscriptions((prev) =>
        prev.filter((id) => id !== subscriptionId)
      );
    }
  };

  const handleSubscriptionPress = (subscription: Subscription) => {
    console.log("Subscription pressed:", subscription.service_name);
    // Add navigation or modal logic here
  };

  const handleMoreInfoPress = (subscription: Subscription) => {
    console.log("More info pressed for:", subscription.service_name);
    // Add navigation to detail screen or show modal
  };

  const handleUpdateSubscription = (subscription: Subscription) => {
    console.log("Update subscription:", subscription.service_name);
    setSelectedSubscription(subscription);
    setUpdateModalVisible(true);
  };

  const handleDeleteSubscription = (subscription: Subscription) => {
    console.log("Delete subscription:", subscription.service_name);

    Alert.alert(
      t("subscription.action.delete.title"),
      t("subscription.action.delete.message").replace(
        "{name}",
        subscription.service_name
      ),
      [
        {
          text: t("subscription.action.delete.cancel"),
          style: "cancel",
        },
        {
          text: t("subscription.action.delete.confirm"),
          style: "destructive",
          onPress: () => confirmDeleteSubscription(subscription),
        },
      ]
    );
  };

  const confirmDeleteSubscription = async (subscription: Subscription) => {
    try {
      const result = await deleteSubscription(subscription.id);

      if (result.success) {
        loadSubscriptions(); // Reload the list
      } else {
        Alert.alert(
          t("login.error"),
          result.error || t("subscription.error.delete.failed")
        );
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
      Alert.alert(t("login.error"), t("subscription.error.delete.failed"));
    }
  };

  // Modal handlers
  const handleAddSubscription = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleModalSuccess = () => {
    loadSubscriptions(); // Reload the list
  };

  const handleUpdateModalClose = () => {
    setUpdateModalVisible(false);
    setSelectedSubscription(null);
  };

  const handleUpdateModalSuccess = () => {
    loadSubscriptions();
    handleUpdateModalClose();
  };

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <HeaderSection title={t("subscription.title")} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadSubscriptions}
          >
            <Text style={styles.retryButtonText}>
              {t("subscription.error.retry")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <HeaderSection title={t("subscription.title")} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>{t("subscription.subtitle")}</Text>

        {/* Segment: Monthly / Annual */}
        <View style={styles.segmentWrap}>
          <TouchableOpacity
            onPress={() => setPeriod("monthly")}
            style={[
              styles.segmentItem,
              period === "monthly" && styles.segmentItemActive,
            ]}
          >
            <Ionicons
              name="cash-outline"
              size={18}
              color={period === "monthly" ? colors.secondary : colors.text}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.segmentText,
                period === "monthly" && styles.segmentTextActive,
              ]}
            >
              {t("subscription.monthly")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPeriod("annual")}
            style={[
              styles.segmentItem,
              period === "annual" && styles.segmentItemActive,
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={period === "annual" ? colors.secondary : colors.text}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.segmentText,
                period === "annual" && styles.segmentTextActive,
              ]}
            >
              {t("subscription.annual")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Subscription CTA */}
        <SimpleButton
          title={t("subscription.add")}
          icon="plus"
          mode="contained"
          onPress={handleAddSubscription}
        />

        {/* Cards */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              {t("subscription.monthly.spend")}
            </Text>
            <Text style={styles.priceText}>{USD.format(monthlySpend)}</Text>
            <Text style={styles.cardCaption}>
              {t("subscription.no.change")}
            </Text>
          </View>
          <View style={styles.cardIcon}>
            <Ionicons
              name="pricetag-outline"
              size={22}
              color={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              {t("subscription.annual.projection")}
            </Text>
            <Text style={styles.priceText}>{USD.format(annualProjection)}</Text>
            <Text style={styles.cardCaption}>
              {t("subscription.based.on.current")}
            </Text>
          </View>
          <View style={styles.cardIcon}>
            <Ionicons
              name="calendar-outline"
              size={22}
              color={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              {t("subscription.active.count")}
            </Text>
            <Text style={styles.priceText}>{activeSubscriptions}</Text>
            <Text style={styles.cardCaption}>
              {activeSubscriptions} {t("subscription.total")}
            </Text>
          </View>
          <View style={styles.cardIcon}>
            <Ionicons
              name="card-outline"
              size={22}
              color={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              {t("subscription.upcoming.renewals")}
            </Text>
            <Text style={styles.priceText}>{upcomingRenewals}</Text>
            <Text style={styles.cardCaption}>
              {t("subscription.due.next.7.days")}
            </Text>
          </View>
          <View style={styles.cardIcon}>
            <Ionicons
              name="warning-outline"
              size={22}
              color={colors.textSecondary}
            />
          </View>
        </View>

        {/* Subscription Table */}
        <View style={styles.tableContainer}>
          <SubscriptionTable
            subscriptions={subscriptions}
            selectedSubscriptions={selectedSubscriptions}
            onSelectAll={handleSelectAll}
            onSubscriptionSelect={handleSubscriptionSelect}
            onSubscriptionPress={handleSubscriptionPress}
            onMoreInfoPress={handleMoreInfoPress}
            onUpdateSubscription={handleUpdateSubscription}
            onDeleteSubscription={handleDeleteSubscription}
          />
        </View>
      </ScrollView>

      {/* Add Subscription Modal */}
      <CreateSubscriptionModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        userId={user?.uid}
      />

      {/* Update Subscription Modal */}
      <UpdateSubscriptionModal
        visible={updateModalVisible}
        onClose={handleUpdateModalClose}
        onSuccess={handleUpdateModalSuccess}
        subscription={selectedSubscription}
      />
    </SafeAreaView>
  );
}
