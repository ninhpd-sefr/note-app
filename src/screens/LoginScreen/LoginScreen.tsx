import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Text, Button } from "react-native-paper";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../app/navigation";
import {
  signInWithEmail,
  signInWithGoogle,
  signInWithFacebook,
} from "../../services/AuthService";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/FontAwesome";
import Constants from "expo-constants";
import { useDebouncedPress } from "../../hooks/useDebouncedPress";
import { styles } from "./styles";
import { hideLoading, showLoading } from "../../services/loadingService";
import { LanguageDropdown } from "../../components/LanguageDropdown";
import { useLanguage } from "../../context/language";

WebBrowser.maybeCompleteAuthSession();

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Login">;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("dangninh1@gmail.com");
  const [password, setPassword] = useState<string>("ninhdangpham");
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const { language, setLanguage, t } = useLanguage();

  const handleLoginSuccess = () => {
    navigation.replace("Home");
  };

  // Google Login Hook
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: Constants.expoConfig?.extra?.GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: Constants.expoConfig?.extra?.GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      signInWithGoogle(id_token).then(({ user }) => {
        if (user) handleLoginSuccess();
      });
    }
  }, [response]);

  // Handle Email/Password Login
  const handleLogin = async () => {
    showLoading();
    const { user, error } = await signInWithEmail(email, password);
    if (error) {
      Toast.show({
        type: "error",
        text1: t("login.signin.failed"),
        text2: error,
      });
      hideLoading();
    } else if (user) {
      hideLoading();
      handleLoginSuccess();
    }
  };

  // Handle Facebook Login
  const handleFacebookLogin = async () => {
    try {
      const { user, error } = await signInWithFacebook();

      if (error) {
        Toast.show({
          type: "error",
          text1: t("login.facebook.failed"),
          text2: error,
        });
      } else if (user) {
        // Navigate to Home after successful login
        handleLoginSuccess();
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: t("login.error"),
        text2: t("login.facebook.error"),
      });
    }
  };
  const debouncedLogin = useDebouncedPress(handleLogin);
  const debouncedNavigateToSignUp = useDebouncedPress(() => {
    navigation.replace("SignUp");
  });

  return (
    <View style={styles.container}>
      <Toast />

      {/* Language Dropdown */}
      <View style={styles.languageContainer}>
        <LanguageDropdown
          selectedLanguage={language}
          onLanguageChange={setLanguage}
        />
      </View>

      <Text style={styles.title}>{t("welcome.title")}</Text>
      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={t("login.email.placeholder")}
          style={[styles.input, styles.inputBorder]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder={t("login.password.placeholder")}
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
      </View>
      {/* Forgot Password */}
      <TouchableOpacity
        onPress={() =>
          Toast.show({
            type: "info",
            text1: t("login.forgot.title"),
            text2: t("login.feature.coming"),
          })
        }
      >
        <Text style={styles.forgotText}>{t("login.forgot.password")}</Text>
      </TouchableOpacity>
      {/* Sign In Button */}
      <Button
        mode="contained"
        style={[
          styles.signInButton,
          (!email.trim() || !password.trim()) && {
            opacity: 0.4,
          },
        ]}
        onPress={debouncedLogin}
        loading={loading}
        disabled={!email.trim() || !password.trim() || loading}
        labelStyle={{ color: "white" }}
      >
        {t("login.button")}
      </Button>
      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>{t("login.or")}</Text>
        <View style={styles.divider} />
      </View>
      {/* Google Login Button */}
      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => promptAsync()}
      >
        <Icon name="google" size={24} color="#DB4437" />
        <Text style={styles.buttonText}>{t("login.google")}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.socialButton}
        onPress={() =>
          handleFacebookLogin().then(() =>
            console.log("Signed in with Facebook!")
          )
        }
      >
        <Icon name="facebook" size={24} color="#DB4437" />
        <Text style={styles.buttonText}>{t("login.facebook")}</Text>
      </TouchableOpacity>
      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text>{t("login.no.account")}</Text>
        <TouchableOpacity onPress={debouncedNavigateToSignUp}>
          <Text style={styles.registerText}>{t("login.register")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
