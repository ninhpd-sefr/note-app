import React, { useState } from "react";
import { View, Button, Text } from "react-native";
import { checkNetworkStability } from "../utils";

const TestScreen = () => {
  const [status, setStatus] = useState<string>("");

  const handleCheck = async () => {
    setStatus("Checking...");
    const stable = await checkNetworkStability();
    setStatus(
      stable
        ? "✅ Network is stable!"
        : "❌ Network is unstable or intermittent!"
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Check Network Stability" onPress={handleCheck} />
      <Text style={{ marginTop: 20, fontSize: 16 }}>{status}</Text>
    </View>
  );
};

export default TestScreen;
