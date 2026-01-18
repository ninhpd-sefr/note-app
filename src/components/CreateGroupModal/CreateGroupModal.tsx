import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import { styles } from "./styles";
import LoadingModal from "../LoadingModal/LoadingModal";
import { useLanguage } from "../../context/language";

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
  const { t } = useLanguage();
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
        <Text style={styles.modalTitle}>{t("group.create.title")}</Text>
        <TextInput
          style={[
            styles.input,
            loading && {
              backgroundColor: "#f0f0f0",
              color: "#999",
            },
          ]}
          placeholder={t("group.title.placeholder")}
          value={newGroupName}
          onChangeText={setNewGroupName}
          editable={!loading}
        />
        <View style={styles.modalActions}>
          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Text style={styles.cancelText}>{t("note.cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onCreate}
            disabled={isDisabled || loading}
            style={{ opacity: isDisabled || loading ? 0.5 : 1 }}
          >
            <Text style={styles.createText}>{t("group.create.button")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <LoadingModal visible={loading} />
      <Toast />
    </Modal>
  );
};

export default CreateGroupModal;
