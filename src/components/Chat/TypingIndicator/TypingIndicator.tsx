import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { styles } from "./styles";

/**
 * Minimal re-render typing indicator using Animated values only.
 * No props change => React.memo prevents re-render.
 */
const TypingIndicator: React.FC = React.memo(() => {
  const dots = useMemo(
    () => [new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)],
    []
  );
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const makeAnim = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );

    const a0 = makeAnim(dots[0], 0);
    const a1 = makeAnim(dots[1], 150);
    const a2 = makeAnim(dots[2], 300);

    animRef.current = Animated.parallel([a0, a1, a2]);
    animRef.current.start();

    return () => {
      animRef.current?.stop();
    };
  }, [dots]);

  return (
    <View style={styles.row}>
      {dots.map((v, idx) => (
        <Animated.View key={idx} style={[styles.dot, { opacity: v }]} />
      ))}
    </View>
  );
});

export default TypingIndicator;
