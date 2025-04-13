import React from "react";
import {
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  View,
  Text,
} from "react-native";

type Props = {
  visible: boolean;
  imageUri: string | null;
  onClose: (event?: GestureResponderEvent) => void;
};

const ImagePreviewModal: React.FC<Props> = ({ visible, imageUri, onClose }) => {
  return (
    <Modal visible={visible} animationType="fade">
      <View style={styles.modalContainer}>
        {/* Close icon */}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>

        {/* Full image */}
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );
};

export default ImagePreviewModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  fullImage: {
    width: "90%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 2,
    padding: 10,
  },
  closeText: {
    fontSize: 40,
    color: "#fff",
  },
});
