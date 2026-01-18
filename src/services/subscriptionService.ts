import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  startAfter,
  limit,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../config/firebaseConfig";
import Toast from "react-native-toast-message";
import {
  Subscription,
  SubscriptionGroup,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  Currency,
  BillingCycle,
  SubscriptionStatus,
} from "../types/type";
import { checkNetworkStability } from "../utils";
import {
  validateSubscriptionInput,
  calculateNextBillingDate,
} from "../utils/subscriptionValidators";

// TODO: All Toast messages in this service should be localized in the future
// Consider creating a localized toast utility or passing language context

// Helper function to get current user ID (optional for subscriptions)
const getCurrentUserId = (): string => {
  // Return a default user ID if not authenticated
  return auth.currentUser?.uid || "anonymous_user";
};

// Create a new subscription
export const createSubscription = async (
  input: CreateSubscriptionInput
): Promise<{
  success: boolean;
  subscription?: Subscription;
  error?: string;
}> => {
  // Authentication is optional for subscriptions

  // Validate input
  const validation = validateSubscriptionInput(input);
  if (!validation.isValid) {
    // TODO: Localize these messages in the future
    Toast.show({
      type: "error",
      text1: "Validation Error",
      text2: validation.errors.join(", "),
    });
    return { success: false, error: validation.errors.join(", ") };
  }

  const isStable = await checkNetworkStability();
  if (!isStable) {
    Toast.show({ type: "error", text1: "No stable internet connection" });
    return { success: false, error: "No stable internet connection" };
  }

  try {
    const userId = getCurrentUserId();

    // Calculate dates
    const startDate = input.start_date
      ? input.start_date instanceof Date
        ? input.start_date
        : input.start_date.toDate()
      : new Date();
    const nextDate = input.next_date
      ? input.next_date instanceof Date
        ? input.next_date
        : input.next_date.toDate()
      : calculateNextBillingDate(input.billing_cycle, startDate);

    // Create subscription using Firebase SDK
    const subscriptionData = {
      service_name: input.service_name.trim(),
      description: input.description.trim(),
      amount: input.amount,
      currency: input.currency,
      billing_cycle: input.billing_cycle,
      status: input.status,
      start_date: startDate,
      next_date: nextDate,
      logo: input.logo,
      web_link: input.web_link,
      user_id: userId,
    };

    console.log("Creating subscription with data:", subscriptionData);
    const docRef = await addDoc(
      collection(db, "subscriptions"),
      subscriptionData
    );
    console.log("Subscription created with ID:", docRef.id);

    const subscription: Subscription = {
      id: docRef.id,
      service_name: input.service_name.trim(),
      description: input.description.trim(),
      amount: input.amount,
      currency: input.currency,
      billing_cycle: input.billing_cycle,
      status: input.status,
      start_date: startDate,
      next_date: nextDate,
      logo: input.logo,
      web_link: input.web_link,
      user_id: userId,
    };

    Toast.show({ type: "success", text1: "Subscription created successfully" });
    return { success: true, subscription };
  } catch (err) {
    console.error("Error creating subscription:", err);
    Toast.show({ type: "error", text1: "Failed to create subscription" });
    return { success: false, error: "Failed to create subscription" };
  }
};

// Update an existing subscription
export const updateSubscription = async (
  subscriptionId: string,
  input: UpdateSubscriptionInput
): Promise<{
  success: boolean;
  subscription?: Subscription;
  error?: string;
}> => {
  // Authentication is optional for subscriptions

  const isStable = await checkNetworkStability();
  if (!isStable) {
    Toast.show({ type: "error", text1: "No stable internet connection" });
    return { success: false, error: "No stable internet connection" };
  }

  try {
    // Validate input if provided
    if (Object.keys(input).length > 0) {
      const validation = validateSubscriptionInput({
        service_name: input.service_name || "",
        description: input.description || "",
        amount: input.amount || 0,
        currency: input.currency || "VND",
        billing_cycle: input.billing_cycle || "monthly",
        status: input.status || "active",
        logo: input.logo || "",
        web_link: input.web_link || "",
      });
      if (!validation.isValid) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: validation.errors.join(", "),
        });
        return { success: false, error: validation.errors.join(", ") };
      }
    }

    // Build update data
    const updateData: Record<string, any> = {};

    if (input.service_name !== undefined) {
      updateData.service_name = input.service_name.trim();
    }
    if (input.description !== undefined) {
      updateData.description = input.description.trim();
    }
    if (input.amount !== undefined) {
      updateData.amount = input.amount;
    }
    if (input.currency !== undefined) {
      updateData.currency = input.currency;
    }
    if (input.billing_cycle !== undefined) {
      updateData.billing_cycle = input.billing_cycle;
    }
    if (input.status !== undefined) {
      updateData.status = input.status;
    }
    if (input.start_date !== undefined) {
      const startDate =
        input.start_date instanceof Date
          ? input.start_date
          : input.start_date.toDate();
      updateData.start_date = startDate;
    }
    if (input.next_date !== undefined) {
      const nextDate =
        input.next_date instanceof Date
          ? input.next_date
          : input.next_date.toDate();
      updateData.next_date = nextDate;
    }
    if (input.logo !== undefined) {
      updateData.logo = input.logo;
    }
    if (input.web_link !== undefined) {
      updateData.web_link = input.web_link;
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: "No fields to update" };
    }

    // Update subscription using Firebase SDK
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    await updateDoc(subscriptionRef, updateData);

    // Fetch updated subscription
    const subscription = await getSubscriptionById(subscriptionId);
    if (!subscription) {
      return { success: false, error: "Failed to fetch updated subscription" };
    }

    Toast.show({ type: "success", text1: "Subscription updated successfully" });
    return { success: true, subscription };
  } catch (err) {
    console.error("Error updating subscription:", err);
    Toast.show({ type: "error", text1: "Failed to update subscription" });
    return { success: false, error: "Failed to update subscription" };
  }
};

// Delete a subscription
export const deleteSubscription = async (
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> => {
  // Authentication is optional for subscriptions

  const isStable = await checkNetworkStability();
  if (!isStable) {
    Toast.show({ type: "error", text1: "No stable internet connection" });
    return { success: false, error: "No stable internet connection" };
  }

  try {
    // Delete subscription using Firebase SDK
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    await deleteDoc(subscriptionRef);

    Toast.show({ type: "success", text1: "Subscription deleted successfully" });
    return { success: true };
  } catch (err) {
    console.error("Error deleting subscription:", err);
    Toast.show({ type: "error", text1: "Failed to delete subscription" });
    return { success: false, error: "Failed to delete subscription" };
  }
};

// Get subscription by ID
export const getSubscriptionById = async (
  subscriptionId: string
): Promise<Subscription | null> => {
  // Authentication is optional for subscriptions

  try {
    const subscriptionRef = doc(db, "subscriptions", subscriptionId);
    const subscriptionSnap = await getDoc(subscriptionRef);

    if (!subscriptionSnap.exists()) {
      return null;
    }

    const data = subscriptionSnap.data();
    return {
      id: subscriptionSnap.id,
      service_name: data.service_name,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      billing_cycle: data.billing_cycle,
      status: data.status,
      start_date: data.start_date?.toDate() || new Date(),
      next_date: data.next_date?.toDate() || new Date(),
      logo: data.logo,
      web_link: data.web_link,
      user_id: data.user_id,
    };
  } catch (err) {
    console.error("Error fetching subscription:", err);
    return null;
  }
};

// Get user's subscriptions with pagination
export const getMySubscriptions = async (
  userId: string,
  status?: SubscriptionStatus,
  reset = true,
  lastDoc?: any
): Promise<{
  subscriptions: Subscription[];
  lastDoc?: any;
  canLoadMore: boolean;
  error?: string;
}> => {
  // Authentication is optional for subscriptions

  const isStable = await checkNetworkStability();
  if (!isStable) {
    Toast.show({ type: "error", text1: "No stable internet connection" });
    return {
      subscriptions: [],
      canLoadMore: false,
      error: "No stable internet connection",
    };
  }

  try {
    console.log("Building query for userId:", userId, "status:", status);

    let q;
    if (status) {
      q = query(
        collection(db, "subscriptions"),
        where("user_id", "==", userId),
        where("status", "==", status),
        orderBy("next_date", "asc"),
        limit(20)
      );
    } else if (lastDoc) {
      q = query(
        collection(db, "subscriptions"),
        where("user_id", "==", userId),
        orderBy("next_date", "asc"),
        startAfter(lastDoc),
        limit(20)
      );
    } else {
      q = query(
        collection(db, "subscriptions"),
        where("user_id", "==", userId),
        orderBy("next_date", "asc"),
        limit(20)
      );
    }

    console.log("Executing query...");
    const snapshot = await getDocs(q);
    console.log("Query result:", snapshot.docs.length, "documents found");
    const subscriptions: Subscription[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        service_name: data.service_name,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        billing_cycle: data.billing_cycle,
        status: data.status,
        start_date: data.start_date?.toDate() || new Date(),
        next_date: data.next_date?.toDate() || new Date(),
        logo: data.logo,
        web_link: data.web_link,
        user_id: data.user_id,
      };
    });

    const newLastDoc = snapshot.docs[snapshot.docs.length - 1];
    const canLoadMore = snapshot.docs.length === 20;

    return {
      subscriptions,
      lastDoc: newLastDoc,
      canLoadMore,
    };
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
    console.error("Error details:", JSON.stringify(err, null, 2));
    Toast.show({ type: "error", text1: "Failed to fetch subscriptions" });
    return {
      subscriptions: [],
      canLoadMore: false,
      error: "Failed to fetch subscriptions",
    };
  }
};

// Create subscription group
export const createSubscriptionGroup = async (
  subscriptionId: string,
  userId: string
): Promise<{ success: boolean; group?: SubscriptionGroup; error?: string }> => {
  // Authentication is optional for subscriptions

  const isStable = await checkNetworkStability();
  if (!isStable) {
    Toast.show({ type: "error", text1: "No stable internet connection" });
    return { success: false, error: "No stable internet connection" };
  }

  try {
    // Create subscription group using Firebase SDK
    const groupData = {
      user_id: userId,
      subscription_id: subscriptionId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, "subscription_groups"),
      groupData
    );

    const group: SubscriptionGroup = {
      id: docRef.id,
      user_id: userId,
      subscription_id: subscriptionId,
      created_at: new Date(),
      updated_at: new Date(),
    };

    Toast.show({
      type: "success",
      text1: "Subscription group created successfully",
    });
    return { success: true, group };
  } catch (err) {
    console.error("Error creating subscription group:", err);
    Toast.show({ type: "error", text1: "Failed to create subscription group" });
    return { success: false, error: "Failed to create subscription group" };
  }
};

// Touch subscription group (update updated_at)
export const touchSubscriptionGroup = async (
  groupId: string
): Promise<{ success: boolean; error?: string }> => {
  // Authentication is optional for subscriptions

  const isStable = await checkNetworkStability();
  if (!isStable) {
    Toast.show({ type: "error", text1: "No stable internet connection" });
    return { success: false, error: "No stable internet connection" };
  }

  try {
    // Update updated_at field using Firebase SDK
    const groupRef = doc(db, "subscription_groups", groupId);
    await updateDoc(groupRef, {
      updated_at: serverTimestamp(),
    });

    return { success: true };
  } catch (err) {
    console.error("Error touching subscription group:", err);
    Toast.show({ type: "error", text1: "Failed to touch subscription group" });
    return { success: false, error: "Failed to touch subscription group" };
  }
};

// Get user's subscription groups
export const getMySubscriptionGroups = async (
  userId: string
): Promise<{ groups: SubscriptionGroup[]; error?: string }> => {
  // Authentication is optional for subscriptions

  const isStable = await checkNetworkStability();
  if (!isStable) {
    Toast.show({ type: "error", text1: "No stable internet connection" });
    return { groups: [], error: "No stable internet connection" };
  }

  try {
    const q = query(
      collection(db, "subscription_groups"),
      where("user_id", "==", userId),
      orderBy("created_at", "desc")
    );

    const snapshot = await getDocs(q);
    const groups: SubscriptionGroup[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        user_id: data.user_id,
        subscription_id: data.subscription_id,
        created_at: data.created_at?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date(),
      };
    });

    return { groups };
  } catch (err) {
    console.error("Error fetching subscription groups:", err);
    Toast.show({ type: "error", text1: "Failed to fetch subscription groups" });
    return { groups: [], error: "Failed to fetch subscription groups" };
  }
};
