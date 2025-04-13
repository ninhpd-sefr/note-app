import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../app/navigation";
import Icon from "react-native-vector-icons/FontAwesome";
import Toast from "react-native-toast-message";
import { signUpWithEmail } from "../services/AuthService";
import { useDebouncedPress } from "../hooks/useDebouncedPress";

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

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "Sign Up Failed",
        text2: "All fields are required!",
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
        text2: "Password should be at least 6 characters long",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords Do Not Match",
        text2: "Please make sure both passwords are identical",
      });
      return;
    }

    setLoading(true);
    const { user, error } = await signUpWithEmail(email, password); // Use structured response

    if (error) {
      Toast.show({
        type: "error",
        text1: "Sign Up Failed",
        text2: error,
      });
    } else if (user) {
      Toast.show({
        type: "success",
        text1: "Account Created!",
        text2: `Welcome, ${user.email}`,
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
      <Image source={require("../assets/note.png")} style={styles.image} />

      {/* Welcome Text */}
      <Text style={styles.title}>Create Your Account</Text>

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
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Confirm your password"
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
        Sign Up
      </Button>

      {/* Sign In Link */}
      <View style={styles.signInContainer}>
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={debouncedGoToLogin}>
          <Text style={styles.loginText}> Login</Text>
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
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
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
    marginBottom: 10,
  },
  signUpButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#00AEEF",
    fontWeight: "bold",
  },
});

export default SignUpScreen;
