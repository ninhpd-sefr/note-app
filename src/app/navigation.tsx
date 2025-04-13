import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import SignUpScreen from "../screens/SignUpScreen";
import GroupScreen from "../screens/GroupScreen";
import NoteDetailScreen from "../screens/NoteDetailScreen";
import { Note } from "../types/type";
import TestScreen from "../screens/TestScreen";
import { navigationRef } from "../services/navigationService";

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Test: undefined;
  Group: { groupId: string; groupName: string; userId: string };
  NoteDetail: { note: Note; groupId: string };
};

//  Ensure Stack uses Correct Type Definition
const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        setIsLoggedIn(!!storedUser);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoggedIn(false);
      }
    };

    checkLoginStatus();
  }, []); //  Ensure proper dependencies in useEffect

  if (isLoggedIn === null) return null; //  Prevent flickering

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? "Home" : "Login"}
        screenOptions={{
          freezeOnBlur: true,
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false, detachPreviousScreen: true }}
        />
        <Stack.Screen
          name="Group"
          component={GroupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NoteDetail"
          component={NoteDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Test" component={TestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
