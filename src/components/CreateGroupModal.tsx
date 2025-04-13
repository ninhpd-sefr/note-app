import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreate: () => void;
  newGroupName: string;
  setNewGroupName: (text: string) => void;
  loading: boolean;
};

const CreateGroupModal: React.FC<Props> = ({
  visible,
  onClose,
  onCreate,
  newGroupName,
  setNewGroupName,
  loading,
}) => {
  const isDisabled = !newGroupName.trim();

  return (
    <Modal
      isVisible={visible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={300}
      animationOutTiming={300}
      useNativeDriver={true}
      onBackButtonPress={onClose}
      style={styles.modal}
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Create Group Note</Text>
        <TextInput
          style={[
            styles.input,
            loading && {
              backgroundColor: "#f0f0f0",
              color: "#999",
            },
          ]}
          placeholder="Group Title"
          value={newGroupName}
          onChangeText={setNewGroupName}
          editable={!loading}
        />
        <View style={styles.modalActions}>
          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onCreate}
            disabled={isDisabled || loading}
            style={{ opacity: isDisabled || loading ? 0.5 : 1 }}
          >
            <Text style={styles.createText}>
              {loading ? "Creating..." : "Create"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 15,
    color: "#000",
    height: 45,
  },
  modalActions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  cancelText: {
    fontSize: 16,
    color: "#888",
  },
  createText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  disabledText: {
    color: "#ccc",
  },
});

export default CreateGroupModal;
