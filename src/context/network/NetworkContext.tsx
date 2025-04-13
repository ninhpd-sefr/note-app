// contexts/NetworkContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import NetInfo from "@react-native-community/netinfo";
import { Snackbar } from "react-native-paper";

type NetworkContextType = {
  isConnected: boolean;
};

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
});

export const NetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const prevStatusRef = useRef<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const currentStatus = state.isConnected ?? false;
      setIsConnected(currentStatus);

      if (
        prevStatusRef.current !== null &&
        prevStatusRef.current !== currentStatus
      ) {
        if (!currentStatus) {
          setSnackMessage("🚫 Lose connection. Some features may not work.");
        } else {
          setSnackMessage("✅ Reconnected. You are online.");
        }
        setSnackVisible(true);
      }

      prevStatusRef.current = currentStatus;
    });

    NetInfo.fetch().then((state) => {
      const currentStatus = state.isConnected ?? false;
      setIsConnected(currentStatus);
      prevStatusRef.current = currentStatus;
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      <>
        {children}
        <Snackbar
          visible={snackVisible}
          onDismiss={() => setSnackVisible(false)}
          duration={8000}
        >
          {snackMessage}
        </Snackbar>
      </>
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
