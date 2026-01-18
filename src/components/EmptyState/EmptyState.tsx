import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

type EmptyStateProps = {
  message: string;
};

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/note.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
    color: "#aaa",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});

export default EmptyState;
