import React, { useState } from "react";
import { View, TouchableOpacity, TextInput, Image } from "react-native";
import { Text, Button } from "react-native-paper";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../app/navigation";
import Icon from "react-native-vector-icons/FontAwesome";
import Toast from "react-native-toast-message";
import { signUpWithEmail } from "../../services/AuthService";
import { useDebouncedPress } from "../../hooks/useDebouncedPress";
import { styles } from "./styles";
import { useLanguage } from "../../context/language";

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "SignUp">;
};

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] =
    useState<boolean>(false);
  const { t } = useLanguage();

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Toast.show({
        type: "error",
        text1: t("signup.failed"),
        text2: t("signup.all.fields.required"),
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: t("signup.weak.password"),
        text2: t("signup.password.length"),
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: t("signup.passwords.not.match"),
        text2: t("signup.passwords.identical"),
      });
      return;
    }

    setLoading(true);
    const { user, error } = await signUpWithEmail(email, password); // Use structured response

    if (error) {
      Toast.show({
        type: "error",
        text1: t("signup.failed"),
        text2: error,
      });
    } else if (user) {
      Toast.show({
        type: "success",
        text1: t("signup.account.created"),
        text2: t("signup.welcome").replace("{email}", user.email || ""),
      });

      setTimeout(() => {
        navigation.replace("Home");
      }, 500);
    }

    setLoading(false);
  };

  const debouncedGoToLogin = useDebouncedPress(() => {
    navigation.replace("Login");
  });

  return (
    <View style={styles.container}>
      <Toast />

      {/* Image Above Title */}
      <Image source={require("../../assets/note.png")} style={styles.image} />

      {/* Welcome Text */}
      <Text style={styles.title}>{t("signup.title")}</Text>

      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={t("signup.email.placeholder")}
          style={[styles.input, styles.inputBorder]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder={t("signup.password.placeholder")}
            style={[styles.input, { flex: 1 }]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Icon
              name={passwordVisible ? "eye-slash" : "eye"}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder={t("signup.confirm.password.placeholder")}
            style={[styles.input, { flex: 1 }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!confirmPasswordVisible}
          />
          <TouchableOpacity
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            <Icon
              name={confirmPasswordVisible ? "eye-slash" : "eye"}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Up Button */}
      <Button
        mode="contained"
        style={[
          styles.signUpButton,
          (!email.trim() || !password.trim() || !confirmPassword.trim()) && {
            opacity: 0.4,
          },
        ]}
        onPress={handleSignUp}
        loading={loading}
        labelStyle={{ color: "white" }}
        disabled={
          !email.trim() ||
          !password.trim() ||
          !confirmPassword.trim() ||
          loading
        }
      >
        {t("signup.button")}
      </Button>

      {/* Sign In Link */}
      <View style={styles.signInContainer}>
        <Text>{t("signup.already.have.account")}</Text>
        <TouchableOpacity onPress={debouncedGoToLogin}>
          <Text style={styles.loginText}> {t("signup.login")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUpScreen;
