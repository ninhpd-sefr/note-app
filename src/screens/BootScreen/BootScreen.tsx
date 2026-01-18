// src/screens/BootScreen/BootScreen.tsx
import React, { useEffect } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import { styles } from "./styles";

type Props = { onReady: () => void; minimumMs?: number };

const BootScreen: React.FC<Props> = ({ onReady, minimumMs = 300 }) => {
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const start = Date.now();
      try {
        // TODO: Đặt các bước khởi tạo thật của bạn tại đây:
        // await preloadFonts();
        // await hydrateRedux();
        // await preconnectAPIs();
      } finally {
        const elapsed = Date.now() - start;
        const remain = Math.max(0, minimumMs - elapsed);
        setTimeout(() => mounted && onReady(), remain);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [onReady, minimumMs]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/splash_logo.png")}
        style={styles.logo}
      />
      <ActivityIndicator color="black" />
    </View>
  );
};

export default BootScreen;
