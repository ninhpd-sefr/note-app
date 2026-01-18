import React, { useState, useEffect } from "react";
import {
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import {
  Subscription,
  Currency,
  BillingCycle,
  SubscriptionStatus,
} from "../../types/type";
import { updateSubscription } from "../../services/subscriptionService";
import { validateSubscriptionInput } from "../../utils/subscriptionValidators";
import LoadingModal from "../LoadingModal/LoadingModal";
import { styles } from "./styles";
import { useLanguage } from "../../context/language/LanguageContext";

interface UpdateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription: Subscription | null;
}

const currencies: Currency[] = [
  "VND",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "KRW",
  "CNY",
];
const billingCycles: BillingCycle[] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "custom",
];
const statuses: SubscriptionStatus[] = [
  "active",
  "trial",
  "paused",
  "canceled",
];

export default function UpdateSubscriptionModal({
  visible,
  onClose,
  onSuccess,
  subscription,
}: UpdateSubscriptionModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    service_name: "",
    description: "",
    amount: 0,
    currency: "VND" as Currency,
    billing_cycle: "monthly" as BillingCycle,
    status: "active" as SubscriptionStatus,
    logo: "",
    web_link: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  // Populate form when subscription changes
  useEffect(() => {
    if (subscription) {
      setFormData({
        service_name: subscription.service_name || "",
        description: subscription.description || "",
        amount: subscription.amount || 0,
        currency: subscription.currency || "VND",
        billing_cycle: subscription.billing_cycle || "monthly",
        status: subscription.status || "active",
        logo: subscription.logo || "",
        web_link: subscription.web_link || "",
      });
    }
  }, [subscription]);

  const resetForm = () => {
    setFormData({
      service_name: "",
      description: "",
      amount: 0,
      currency: "VND",
      billing_cycle: "monthly",
      status: "active",
      logo: "",
      web_link: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleUpdateSubscription = async () => {
    if (!subscription?.id) {
      Alert.alert(t("login.error"), t("subscription.error.no.subscription"));
      return;
    }

    const validation = validateSubscriptionInput(formData);
    if (!validation.isValid) {
      Alert.alert(
        t("subscription.error.validation"),
        validation.errors.join("\n")
      );
      return;
    }

    setFormLoading(true);
    try {
      const result = await updateSubscription(subscription.id, formData);

      if (result.success) {
        onSuccess();
        handleClose();
      } else {
        Alert.alert(
          t("login.error"),
          result.error || t("subscription.error.update.failed")
        );
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      Alert.alert(t("login.error"), t("subscription.error.update.failed"));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {t("subscription.modal.update.title")}
          </Text>
          <TouchableOpacity
            onPress={handleUpdateSubscription}
            disabled={formLoading}
          >
            <Text
              style={[
                styles.saveButton,
                formLoading && styles.saveButtonDisabled,
              ]}
            >
              {formLoading
                ? t("subscription.modal.updating")
                : t("subscription.modal.update")}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Service Name */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              {t("subscription.form.service.name")} *
            </Text>
            <TextInput
              style={styles.formInput}
              value={formData.service_name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, service_name: text }))
              }
              placeholder={t("subscription.form.service.name.placeholder")}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              {t("subscription.form.description")}
            </Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              placeholder={t("subscription.form.description.placeholder")}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Amount */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              {t("subscription.form.amount")} *
            </Text>
            <TextInput
              style={styles.formInput}
              value={formData.amount.toString()}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  amount: parseFloat(text) || 0,
                }))
              }
              placeholder={t("subscription.form.amount.placeholder")}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          {/* Currency */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              {t("subscription.form.currency")} *
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pickerContainer}
            >
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency}
                  style={[
                    styles.pickerItem,
                    formData.currency === currency && styles.pickerItemSelected,
                  ]}
                  onPress={() => setFormData((prev) => ({ ...prev, currency }))}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      formData.currency === currency &&
                        styles.pickerTextSelected,
                    ]}
                  >
                    {currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Billing Cycle */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              {t("subscription.form.billing.cycle")} *
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pickerContainer}
            >
              {billingCycles.map((cycle) => (
                <TouchableOpacity
                  key={cycle}
                  style={[
                    styles.pickerItem,
                    formData.billing_cycle === cycle &&
                      styles.pickerItemSelected,
                  ]}
                  onPress={() =>
                    setFormData((prev) => ({ ...prev, billing_cycle: cycle }))
                  }
                >
                  <Text
                    style={[
                      styles.pickerText,
                      formData.billing_cycle === cycle &&
                        styles.pickerTextSelected,
                    ]}
                  >
                    {cycle}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Status */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              {t("subscription.form.status")} *
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.pickerContainer}
            >
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.pickerItem,
                    formData.status === status && styles.pickerItemSelected,
                  ]}
                  onPress={() => setFormData((prev) => ({ ...prev, status }))}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      formData.status === status && styles.pickerTextSelected,
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Logo URL */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              {t("subscription.form.logo.url")}
            </Text>
            <TextInput
              style={styles.formInput}
              value={formData.logo}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, logo: text }))
              }
              placeholder={t("subscription.form.logo.url.placeholder")}
              placeholderTextColor={colors.textSecondary}
              keyboardType="url"
            />
          </View>

          {/* Web Link */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              {t("subscription.form.web.link")}
            </Text>
            <TextInput
              style={styles.formInput}
              value={formData.web_link}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, web_link: text }))
              }
              placeholder={t("subscription.form.web.link.placeholder")}
              placeholderTextColor={colors.textSecondary}
              keyboardType="url"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
      <LoadingModal
        visible={formLoading}
        text={t("subscription.modal.updating")}
      />
    </Modal>
  );
}
