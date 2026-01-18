// src/navigation/AppNavigator.tsx
import React, { useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import SignUpScreen from "../screens/SignUpScreen/SignUpScreen";
import GroupScreen from "../screens/GroupScreen/GroupScreen";
import NoteDetailScreen from "../screens/NoteDetailScreen/NoteDetailScreen";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import { Note } from "../types/type";
import { navigationRef } from "../services/navigationService";
import BootScreen from "../screens/BootScreen/BootScreen";
import LoadingScreen from "../screens/LoadingScreen/LoadingScreen";
import UserGuideScreen from "../screens/UserGuideScreen/UserGuideScreen";
import ManageSubscription from "../screens/ManageSubscription/ManageSubscription";

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Chat: undefined;
  Group: { groupId: string; groupName: string; userId: string };
  NoteDetail: { note: Note; groupId: string };
  Boot: undefined;
  Loading: undefined;
  UserGuide: undefined;
  ManageSubscription: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  // phase = 'boot' (đang splash) | 'ready' (đã xác định login)
  const [phase, setPhase] = useState<"boot" | "ready">("boot");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const checkLoginStatus = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      setIsLoggedIn(!!storedUser);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoggedIn(false);
    }
  }, []);

  const handleBootReady = useCallback(async () => {
    await checkLoginStatus();
    setPhase("ready");
  }, [checkLoginStatus]);

  if (phase === "boot") {
    return <BootScreen onReady={handleBootReady} minimumMs={2000} />;
  }

  // phase === "ready": render navigator như bình thường
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? "Home" : "Login"}
        screenOptions={{ freezeOnBlur: true, headerShown: false }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ detachPreviousScreen: true }}
        />
        <Stack.Screen name="Group" component={GroupScreen} />
        <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="UserGuide" component={UserGuideScreen} />
        <Stack.Screen
          name="ManageSubscription"
          component={ManageSubscription}
        />
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{
            headerShown: false,
            presentation: "transparentModal",
            animation: "fade",
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
