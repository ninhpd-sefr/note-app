import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import EmptyState from "../EmptyState/EmptyState";
import { useNote } from "../../context/note/NoteContext";
import Toast from "react-native-toast-message";
import { styles } from "./styles";
import { useLanguage } from "../../context/language/LanguageContext";

type Props = {
  visible: boolean;
  onClose: () => void;
  onMove: (groupId: string) => void;
  currentGroupId: string;
};

const MoveNoteModal: React.FC<Props> = ({
  visible,
  onClose,
  onMove,
  currentGroupId,
}) => {
  const { noteGroups } = useNote();
  const { t } = useLanguage();

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
        <Text style={styles.title}>{t("move.note.title")}</Text>

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
          <EmptyState message={t("move.note.no.groups")} />
        )}

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>{t("move.note.cancel")}</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </Modal>
  );
};

export default MoveNoteModal;
