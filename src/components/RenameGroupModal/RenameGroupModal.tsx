import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import { styles } from "./styles";
import LoadingModal from "../LoadingModal/LoadingModal";
import { useLanguage } from "../../context/language/LanguageContext";

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
  const { t } = useLanguage();
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
        <Text style={styles.modalTitle}>{t("rename.group.title")}</Text>
        <TextInput
          style={[
            styles.input,
            loading && {
              backgroundColor: "#f0f0f0",
              color: "#999",
            },
          ]}
          placeholder={t("rename.group.placeholder")}
          value={groupName}
          onChangeText={setGroupName}
          editable={!loading}
        />
        <View style={styles.modalActions}>
          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Text style={styles.cancelText}>{t("rename.group.cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onRename}
            disabled={isDisabled || loading}
            style={{ opacity: isDisabled || loading ? 0.5 : 1 }}
          >
            <Text
              style={[
                styles.renameText,
                isDisabled || loading ? styles.disabledText : null,
              ]}
            >
              {loading ? t("rename.group.renaming") : t("rename.group.rename")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <LoadingModal visible={loading || false} />
      <Toast />
    </Modal>
  );
};

export default RenameGroupModal;
