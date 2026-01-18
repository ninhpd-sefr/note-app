import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 20,
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 15,
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
  inputBorder: {
    borderColor: colors.inputBorder,
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.inputBackground,
    paddingRight: 15,
    borderRadius: 10,
    borderColor: colors.inputBorder,
    borderWidth: 1,
  },
  forgotText: {
    textAlign: "right",
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: colors.buttonPrimary,
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
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: colors.textSecondary,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.error,
    justifyContent: "center",
    marginVertical: 10,
  },
  buttonText: {
    color: colors.error,
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
    color: colors.info,
    fontWeight: "bold",
    marginLeft: 5,
  },
  languageContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
  },
});
