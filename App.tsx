import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigator from "./src/app/navigation";
import Toast from "react-native-toast-message";
import { NoteProvider } from "./src/context/note/NoteContext";
import { SessionUnlockProvider } from "./src/context/session/SessionUnlockContext";
import { SnackbarProvider } from "./src/context/snack/SnackbarContext";
import { NetworkProvider } from "./src/context/network/NetworkContext";

export default function App() {
  return (
    <PaperProvider>
      <SnackbarProvider>
        <NetworkProvider>
          <NoteProvider>
            <SessionUnlockProvider>
              <AppNavigator />
              <Toast />
            </SessionUnlockProvider>
          </NoteProvider>
        </NetworkProvider>
      </SnackbarProvider>
    </PaperProvider>
  );
}
