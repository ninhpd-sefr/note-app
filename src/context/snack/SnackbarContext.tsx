import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar } from "react-native-paper";

type SnackbarContextType = {
  showSnackbar: (message: string, type?: "success" | "error" | "info") => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [color, setColor] = useState<string>("gray");

  const showSnackbar = useCallback(
    (msg: string, type: "success" | "error" | "info" = "info") => {
      setMessage(msg);
      const colorMap = {
        success: "green",
        error: "red",
        info: "gray",
      };
      setColor(colorMap[type] || "gray");
      setVisible(true);
    },
    []
  );

  const onDismiss = () => setVisible(false);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={onDismiss}
        duration={1000}
        style={{ backgroundColor: color }}
        wrapperStyle={{ pointerEvents: "box-none" }}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
