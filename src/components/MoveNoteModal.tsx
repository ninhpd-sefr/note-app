import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Modal from "react-native-modal"; // ✅ Changed import
import { Ionicons } from "@expo/vector-icons";
import EmptyState from "./EmptyState";
import { useNote } from "../context/note/NoteContext";
import Toast from "react-native-toast-message";

type Props = {
  visible: boolean;
  onClose: () => void;
  onMove: (groupId: string) => void;
  currentGroupId: string;
  userId: string;
};

const MoveNoteModal: React.FC<Props> = ({
  visible,
  onClose,
  onMove,
  currentGroupId,
}) => {
  const { noteGroups } = useNote();

  const filteredGroups = noteGroups.filter(
    (group) => group.id !== currentGroupId
  );

  return (
    <Modal
      isVisible={visible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={300}
      animationOutTiming={300}
      backdropOpacity={0.5}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        <Text style={styles.title}>Select a group:</Text>

        {filteredGroups.length > 0 ? (
          <FlatList
            style={{ maxHeight: "90%" }}
            data={filteredGroups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.groupItem}
                onPress={() => onMove(item.id)}
              >
                <Ionicons
                  name="folder"
                  size={24}
                  color="#555"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.groupText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <EmptyState message="No other group found" />
        )}

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Cancel</Text>
        </TouchableOpacity>
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
  modalContent: {
    width: 300,
    maxHeight: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#000",
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
    borderRadius: 8,
  },
  groupText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  closeButton: {
    marginTop: 10,
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  closeText: {
    fontSize: 16,
    color: "#000",
  },
});

export default MoveNoteModal;
