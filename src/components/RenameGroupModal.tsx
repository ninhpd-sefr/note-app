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
  onRename: () => void;
  groupName: string;
  setGroupName: (text: string) => void;
  originalGroupName: string;
  loading?: boolean;
};

const RenameGroupModal: React.FC<Props> = ({
  visible,
  onClose,
  onRename,
  groupName,
  setGroupName,
  originalGroupName,
  loading,
}) => {
  const isDisabled =
    groupName.trim() === "" || groupName.trim() === originalGroupName.trim();

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
        <Text style={styles.modalTitle}>Rename Group</Text>
        <TextInput
          style={[
            styles.input,
            loading && {
              backgroundColor: "#f0f0f0",
              color: "#999",
            },
          ]}
          placeholder="Enter new name"
          value={groupName}
          onChangeText={setGroupName}
          editable={!loading}
        />
        <View style={styles.modalActions}>
          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onRename} disabled={isDisabled || loading}>
            <Text
              style={[
                styles.renameText,
                isDisabled || loading ? styles.disabledText : null,
              ]}
            >
              {loading ? "Renaming..." : "Rename"}
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
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    color: "#000",
    height: 45,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelText: {
    fontSize: 16,
    color: "#888",
  },
  renameText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
  disabledText: {
    color: "#ccc",
  },
});

export default RenameGroupModal;
