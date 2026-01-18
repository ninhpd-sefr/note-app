import React, { useState } from "react";
import { Button } from "react-native-paper";
import { ViewStyle, TextStyle } from "react-native";
import { useLanguage } from "../../context/language/LanguageContext";
import { styles } from "./styles";

interface SimpleButtonProps {
  title?: string;
  onPress?: () => void;
  mode?: "text" | "outlined" | "contained" | "elevated" | "contained-tonal";
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  contentStyle?: ViewStyle;
  loading?: boolean;
  compact?: boolean;
  uppercase?: boolean;
  testID?: string;
}

const SimpleButton: React.FC<SimpleButtonProps> = ({
  title,
  onPress,
  mode = "contained",
  disabled = false,
  icon,
  style,
  labelStyle,
  contentStyle,
  loading = false,
  compact = false,
  uppercase = false,
  testID,
  ...props
}) => {
  const { t } = useLanguage();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Button
      mode={mode}
      onPress={onPress}
      disabled={disabled}
      icon={icon}
      loading={loading}
      compact={compact}
      uppercase={uppercase}
      testID={testID}
      style={[styles.button, style, isPressed && styles.buttonPressed]}
      labelStyle={[styles.label, labelStyle]}
      contentStyle={[contentStyle]}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      {...props}
    >
      {title || t("button.default")}
    </Button>
  );
};

export default SimpleButton;
