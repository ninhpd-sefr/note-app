import { Timestamp } from "firebase/firestore";

export interface Note {
  id: string;
  name: string;
  content: string;
  imageUrl?: string;
  createAt: Timestamp | Date;
  updateAt: Timestamp | Date;
  pinned?: boolean;
  locked?: boolean;
}

export type NoteGroup = {
  id: string;
  name: string;
  updateAt?: Date;
};

// types/firestore.ts

export type FirestoreQueryResult = {
  document?: {
    name: string;
    fields: Record<string, unknown>;
    createTime?: string;
    updateTime?: string;
  };
  readTime?: string;
};

export type ChatRole = "user" | "model" | "system" | "error" | "typing";
export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
}

// Tour Guide types
export interface TourStep {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  icon?: string;
}

// Subscription types
export type Currency = "VND" | "USD" | "EUR" | "GBP" | "JPY" | "KRW" | "CNY";

export type BillingCycle = "daily" | "weekly" | "monthly" | "yearly" | "custom";

export type SubscriptionStatus = "active" | "trial" | "paused" | "canceled";

export interface Subscription {
  id: string;
  service_name: string;
  description: string;
  amount: number;
  currency: Currency;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  start_date: Timestamp | Date;
  next_date: Timestamp | Date;
  logo: string;
  web_link: string;
  user_id: string;
}

export interface SubscriptionGroup {
  id: string;
  user_id: string;
  subscription_id: string;
  created_at: Timestamp | Date;
  updated_at: Timestamp | Date;
}

// Input types for creating subscriptions
export interface CreateSubscriptionInput {
  service_name: string;
  description: string;
  amount: number;
  currency: Currency;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  start_date?: Timestamp | Date;
  next_date?: Timestamp | Date;
  logo: string;
  web_link: string;
}

export interface UpdateSubscriptionInput {
  service_name?: string;
  description?: string;
  amount?: number;
  currency?: Currency;
  billing_cycle?: BillingCycle;
  status?: SubscriptionStatus;
  start_date?: Timestamp | Date;
  next_date?: Timestamp | Date;
  logo?: string;
  web_link?: string;
}
