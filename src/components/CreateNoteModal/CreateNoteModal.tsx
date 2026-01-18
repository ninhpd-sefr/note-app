import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToCloudinary } from "../../services/cloudinaryService";
import EditImageModal from "../EditImageModal/EditImageModal";
import ImagePreviewModal from "../ImagePreviewModal/ImagePreviewModal";
import LoadingModal from "../LoadingModal/LoadingModal";
import Modal from "react-native-modal";
import useUploadWithRetry from "../../hooks/useUploadWithRetry";
import Toast from "react-native-toast-message";
import { useDebouncedPress } from "../..//hooks/useDebouncedPress";
import { styles } from "./styles";
import { useLanguage } from "../../context/language";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    content: string,
    imageUrl?: string
  ) => boolean | Promise<boolean>;
};

const CreateNoteModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false); //  For drawing
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false); //  For previewing

  const { uploadWithRetry } = useUploadWithRetry();
  const { t } = useLanguage();
  const isDisabled = !noteTitle.trim() || !noteContent.trim();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert(t("note.permission.required"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setEditorVisible(true); //  Open editor right after selecting image
    }
  };

  const deleteImage = () => {
    setImageUri(null);
  };

  const handleSave = async () => {
    setUploading(true);

    const saveNote = async (imageUrl?: string) => {
      const success = await onSave(
        noteTitle.trim(),
        noteContent.trim(),
        imageUrl
      );

      if (success) {
        setNoteTitle("");
        setNoteContent("");
        setImageUri(null);
        onClose();
      }

      setUploading(false);
    };

    // If no image, save note directly
    if (!imageUri) {
      await saveNote();
      return;
    }

    // Upload with retry if image exists
    await uploadWithRetry(
      imageUri,
      uploadImageToCloudinary,
      async (url) => {
        await saveNote(url); // pass uploaded URL
      },
      () => {
        // User canceled retry
        setUploading(false);
      }
    );
  };

  const handleOnClose = () => {
    setNoteTitle("");
    setNoteContent("");
    setImageUri(null);
    onClose();
  };

  const debouncedPickImage = useDebouncedPress(pickImage);

  return (
    <>
      <Modal
        isVisible={visible}
        animationIn="zoomIn"
        animationOut="zoomOut"
        animationInTiming={300}
        animationOutTiming={300}
        onBackButtonPress={handleOnClose}
        useNativeDriver
        style={styles.modalWrapper}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{t("note.new.title")}</Text>

          <TextInput
            style={[
              styles.input,
              uploading && {
                backgroundColor: "#f0f0f0",
                color: "#999",
              },
            ]}
            placeholder={t("note.title.placeholder")}
            value={noteTitle}
            onChangeText={setNoteTitle}
            editable={!uploading}
          />
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              uploading && {
                backgroundColor: "#f0f0f0",
                color: "#999",
              },
            ]}
            placeholder={t("note.description.placeholder")}
            value={noteContent}
            onChangeText={setNoteContent}
            multiline
            editable={!uploading}
          />

          {!uploading && (
            <TouchableOpacity
              onPress={debouncedPickImage}
              style={styles.imageButton}
            >
              <Text style={styles.imageButtonText}>
                {imageUri ? t("note.change.image") : t("note.pick.image")}
              </Text>
            </TouchableOpacity>
          )}

          {imageUri && (
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={() => setImagePreviewVisible(true)}
            >
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              {!uploading && (
                <TouchableOpacity
                  onPress={deleteImage}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>X</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={handleOnClose}
              style={styles.cancelButton}
              disabled={uploading}
            >
              <Text style={[styles.buttonText, { color: "#000" }]}>
                {t("note.cancel")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={isDisabled || uploading}
              style={[
                styles.saveButton,
                (isDisabled || uploading) && styles.disabledButton,
              ]}
            >
              <Text style={styles.buttonText}>{t("note.save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Toast />
        <LoadingModal visible={uploading} text="" />
      </Modal>

      {/* 🔽 Editor modal after picking image */}
      {imageUri && (
        <EditImageModal
          visible={editorVisible}
          imageUri={imageUri}
          onClose={() => {
            setImageUri(null); //  Reset imageUri to null
            setEditorVisible(false);
          }}
          onSaveSuccess={(editedUri) => {
            setImageUri(editedUri); // Replace original image
            setEditorVisible(false);
          }}
        />
      )}

      <ImagePreviewModal
        visible={imagePreviewVisible}
        imageUri={imageUri}
        onClose={() => setImagePreviewVisible(false)}
      />
    </>
  );
};

export default CreateNoteModal;
