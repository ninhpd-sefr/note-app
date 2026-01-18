import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
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
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputBorder: {
    borderColor: colors.inputBorder,
    borderWidth: 1,
  },
  input: {
    backgroundColor: colors.inputBackground,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    height: 55,
    color: colors.inputText,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    paddingRight: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: colors.inputBorder,
    borderWidth: 1,
  },
  signUpButton: {
    backgroundColor: colors.buttonPrimary,
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
    color: colors.info,
    fontWeight: "bold",
  },
});
