// context/SessionUnlockContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

type SessionUnlockContextType = {
  unlockedSession: boolean;
  unlockSession: () => void;
  resetSession: () => void;
};

const SessionUnlockContext = createContext<
  SessionUnlockContextType | undefined
>(undefined);

export const SessionUnlockProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unlockedSession, setUnlockedSession] = useState(false);
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );
  let backgroundTimeout: NodeJS.Timeout | null = null;

  // Call this when the user enters the correct PIN
  const unlockSession = () => {
    setUnlockedSession(true);
  };

  // Reset session manually or after timeout
  const resetSession = () => {
    console.log("reset session");
    setUnlockedSession(false);
  };

  // Handle AppState changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        // App is leaving foreground — wait 10s, then reset if still not active
        backgroundTimeout = setTimeout(() => {
          resetSession();
        }, 10000); // 10 seconds
      }

      if (nextAppState === "active") {
        // User came back — cancel pending reset
        if (backgroundTimeout) {
          clearTimeout(backgroundTimeout);
          backgroundTimeout = null;
        }
      }

      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
      if (backgroundTimeout) clearTimeout(backgroundTimeout);
    };
  }, []);

  return (
    <SessionUnlockContext.Provider
      value={{ unlockedSession, unlockSession, resetSession }}
    >
      {children}
    </SessionUnlockContext.Provider>
  );
};

export const useSessionUnlock = () => {
  const context = useContext(SessionUnlockContext);
  if (!context) {
    throw new Error(
      "useSessionUnlock must be used within a SessionUnlockProvider"
    );
  }
  return context;
};
