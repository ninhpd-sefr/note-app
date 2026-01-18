import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { MD3Theme } from "react-native-paper";
import { colors } from "../../constants/colors";

export const buttonTheme: Partial<MD3Theme> = {
  colors: {
    primary: colors.primary,
    onPrimary: colors.secondary,
  } as any,
};

export const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    minWidth: 120,
    marginHorizontal: 4,
    marginVertical: 2,
  } as ViewStyle,
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.secondary,
  } as TextStyle,
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  } as ViewStyle,
});
