// src/services/loadingService.tsx
import { navigationRef } from "./navigationService";
import RootSiblings from "react-native-root-siblings";
import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

let loadingSibling: RootSiblings | null = null;

const loadingStyles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
    elevation: 999999,
  },
});

const LoadingOverlay: React.FC = () => {
  return (
    <View style={loadingStyles.backdrop}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
};

export function showLoading() {
  if (loadingSibling) return; // Already showing
  
  loadingSibling = new RootSiblings(<LoadingOverlay />);
}

export function hideLoading() {
  if (loadingSibling) {
    loadingSibling.destroy();
    loadingSibling = null;
  }
}