// src/navigation/NavigationService.ts
import {
  createNavigationContainerRef,
  StackActions,
} from "@react-navigation/native";
import { RootStackParamList } from "../app/navigation";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  ...[params]: RootStackParamList[RouteName] extends undefined
    ? [] // if no params, then don't require second arg
    : [params: RootStackParamList[RouteName]] // else, require params
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function resetToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  }
}
