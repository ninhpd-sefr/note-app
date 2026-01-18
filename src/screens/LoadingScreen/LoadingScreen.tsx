// src/screens/LoadingScreen/LoadingScreen.tsx
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { styles } from "./styles";
import { Portal } from "react-native-paper";
import { colors } from "../../constants/colors";

export default function LoadingScreen() {
  return (
    <Portal>
      <View style={styles.backdrop}>
        <ActivityIndicator size="large" color={colors.loading} />
      </View>
    </Portal>
  );
}
