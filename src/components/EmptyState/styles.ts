import { StyleSheet } from "react-native";
import { colors } from "../../constants/colors";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 40,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
  text: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
