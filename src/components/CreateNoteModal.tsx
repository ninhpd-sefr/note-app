import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToCloudinary } from "../services/cloudinaryService";
import EditImageModal from "./EditImageModal";
import ImagePreviewModal from "./ImagePreviewModal";
import { ActivityIndicator } from "react-native-paper";
import Modal from "react-native-modal";
import useUploadWithRetry from "../hooks/useUploadWithRetry";
import Toast from "react-native-toast-message";
import { useDebouncedPress } from "../hooks/useDebouncedPress";

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
  const isDisabled = !noteTitle.trim() || !noteContent.trim();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission required to access media library");
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
          <Text style={styles.modalTitle}>New Note</Text>

          <TextInput
            style={[
              styles.input,
              uploading && {
                backgroundColor: "#f0f0f0",
                color: "#999",
              },
            ]}
            placeholder="Note Title"
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
            placeholder="Note Description"
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
                {imageUri ? "Change Image" : "Pick Image"}
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
              <Text style={[styles.buttonText, { color: "#000" }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={isDisabled || uploading}
              style={[
                styles.saveButton,
                (isDisabled || uploading) && styles.disabledButton,
              ]}
            >
              {uploading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <Toast />
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

const styles = StyleSheet.create({
  modalWrapper: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    height: 45,
  },
  textArea: {
    height: 150,
    textAlignVertical: "top",
  },
  imageButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  imageButtonText: {
    color: "#000",
    fontSize: 14,
    textAlign: "center",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    marginBottom: 10,
  },
  imagePreview: {
    width: "100%",
    height: 150,
    borderRadius: 5,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    borderRadius: 5,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    padding: 10,
  },
  saveButton: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledText: {
    color: "#666",
  },
});

export default CreateNoteModal;
