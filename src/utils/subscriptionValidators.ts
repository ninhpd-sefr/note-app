import { Currency, BillingCycle, SubscriptionStatus } from "../types/type";

// Validation functions for subscription data
export const validateCurrency = (currency: string): currency is Currency => {
  const validCurrencies: Currency[] = [
    "VND",
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "KRW",
    "CNY",
  ];
  return validCurrencies.includes(currency as Currency);
};

export const validateBillingCycle = (cycle: string): cycle is BillingCycle => {
  const validCycles: BillingCycle[] = [
    "daily",
    "weekly",
    "monthly",
    "yearly",
    "custom",
  ];
  return validCycles.includes(cycle as BillingCycle);
};

export const validateSubscriptionStatus = (
  status: string
): status is SubscriptionStatus => {
  const validStatuses: SubscriptionStatus[] = [
    "active",
    "trial",
    "paused",
    "canceled",
  ];
  return validStatuses.includes(status as SubscriptionStatus);
};

export const validateAmount = (amount: number): boolean => {
  return typeof amount === "number" && amount >= 0 && !isNaN(amount);
};

export const validateUrl = (url: string): boolean => {
  // URL can be empty, but if provided, must be valid
  if (!url || url.trim() === "") {
    return true;
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
};

export const validateServiceName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
};

export const validateDescription = (description: string): boolean => {
  const trimmed = description.trim();
  // Description can be empty, but if provided, must be within 500 characters
  return trimmed.length === 0 || (trimmed.length > 0 && trimmed.length <= 500);
};

// Main validation function for subscription input
export const validateSubscriptionInput = (input: {
  service_name: string;
  description: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  status: string;
  logo: string;
  web_link: string;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!validateServiceName(input.service_name)) {
    errors.push("Service name must be between 1-100 characters");
  }

  if (!validateDescription(input.description)) {
    errors.push("Description must be between 0-500 characters");
  }

  if (!validateAmount(input.amount)) {
    errors.push("Amount must be a non-negative number");
  }

  if (!validateCurrency(input.currency)) {
    errors.push(
      "Invalid currency. Must be one of: VND, USD, EUR, GBP, JPY, KRW, CNY"
    );
  }

  if (!validateBillingCycle(input.billing_cycle)) {
    errors.push(
      "Invalid billing cycle. Must be one of: daily, weekly, monthly, yearly, custom"
    );
  }

  if (!validateSubscriptionStatus(input.status)) {
    errors.push(
      "Invalid status. Must be one of: active, trial, paused, canceled"
    );
  }

  if (!validateUrl(input.logo)) {
    errors.push("Logo must be a valid HTTP/HTTPS URL (can be empty)");
  }

  if (!validateUrl(input.web_link)) {
    errors.push("Web link must be a valid HTTP/HTTPS URL (can be empty)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to calculate next billing date
export const calculateNextBillingDate = (
  billingCycle: BillingCycle,
  startDate: Date = new Date()
): Date => {
  const nextDate = new Date(startDate);

  switch (billingCycle) {
    case "daily":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case "custom":
    default:
      // Default to monthly for custom
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  return nextDate;
};
