import React from "react";
import {
  Modal,
  Image,
  TouchableOpacity,
  GestureResponderEvent,
  View,
  Text,
} from "react-native";
import { styles } from "./styles";

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
