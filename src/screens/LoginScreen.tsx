import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Text, Button } from "react-native-paper";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../app/navigation";
import {
  signInWithEmail,
  signInWithGoogle,
  signInWithFacebook,
} from "../services/AuthService";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/FontAwesome";
import Constants from "expo-constants";
import { useDebouncedPress } from "../hooks/useDebouncedPress";

WebBrowser.maybeCompleteAuthSession();

type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Login">;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("dangninh1@gmail.com");
  const [password, setPassword] = useState<string>("ninhdangpham");
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const handleLoginSuccess = () => {
    // setTimeout(() => {
    //   navigation.replace("Home");
    // }, 2000);
    navigation.navigate("Home");
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
    setLoading(true);
    const { user, error } = await signInWithEmail(email, password);
    if (error) {
      Toast.show({
        type: "error",
        text1: "Sign In Failed",
        text2: error,
      });
    } else if (user) {
      handleLoginSuccess();
    }

    setLoading(false);
  };

  // Handle Facebook Login
  const handleFacebookLogin = async () => {
    try {
      const { user, error } = await signInWithFacebook();

      if (error) {
        Toast.show({
          type: "error",
          text1: "Facebook Login Failed",
          text2: error,
        });
      } else if (user) {
        // Navigate to Home after successful login
        handleLoginSuccess();
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to login with Facebook",
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

      <Text style={styles.title}>Welcome back! Glad to see you again!</Text>
      {/* Input Fields */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Enter your email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Enter your password"
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
      {/* <TouchableOpacity
        onPress={() =>
          Toast.show({
            type: "info",
            text1: "Forgot Password",
            text2: "Feature coming soon!",
          })
        }
      >
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity> */}

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
        Login
      </Button>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>Or Login with</Text>
        <View style={styles.divider} />
      </View>

      {/* Google Login Button */}
      <TouchableOpacity
        style={styles.socialButton}
        onPress={() => promptAsync()}
      >
        <Icon name="google" size={24} color="#DB4437" />
        <Text style={styles.buttonText}>Sign in with Google</Text>
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
        <Text style={styles.buttonText}>Sign in with Facebook</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text>Don’t have an account?</Text>
        <TouchableOpacity onPress={debouncedNavigateToSignUp}>
          <Text style={styles.registerText}>Register Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#F7F8F9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    height: 55,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8F9",
    paddingRight: 15,
    borderRadius: 10,
  },
  forgotText: {
    textAlign: "right",
    color: "gray",
    fontSize: 14,
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 20,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "gray",
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DB4437",
    justifyContent: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: "#DB4437",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    color: "#00AEEF",
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default LoginScreen;
