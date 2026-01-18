// src/services/loadingService.ts
import { navigationRef } from "./navigationService";

export function showLoading() {
  if (!navigationRef.isReady()) return;

  const route = navigationRef.getCurrentRoute();
  if (route?.name !== "Loading") {
    navigationRef.navigate("Loading");
  }
}

export function hideLoading() {
  if (!navigationRef.isReady()) return;

  const route = navigationRef.getCurrentRoute();
  if (route?.name === "Loading") {
    navigationRef.goBack();
  }
}
