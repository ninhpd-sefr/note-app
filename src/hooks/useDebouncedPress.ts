// hooks/useDebouncedPress.ts
import { useCallback, useRef } from "react";

export const useDebouncedPress = (callback: () => void, delay = 1000) => {
  const lastPressed = useRef(0);

  return useCallback(() => {
    const now = Date.now();
    if (now - lastPressed.current > delay) {
      lastPressed.current = now;
      callback();
    }
  }, [callback, delay]);
};
