import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../app/navigation";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { useNote } from "../context/note/NoteContext";
import { uploadImageToCloudinary } from "../services/cloudinaryService";
import { checkNetworkConnection } from "../utils";
import ImagePreviewModal from "../components/ImagePreviewModal";
import EditImageModal from "../components/EditImageModal";
import useUploadWithRetry from "../hooks/useUploadWithRetry";
import { useDebouncedPress } from "../hooks/useDebouncedPress";

type Props = {
  route: RouteProp<RootStackParamList, "NoteDetail">;
};

const NoteDetailScreen: React.FC<Props> = ({ route }) => {
  const { note, groupId } = route.params;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { uploadWithRetry } = useUploadWithRetry();
  const { updateNote } = useNote();

  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(note.name);
  const [content, setContent] = useState(note.content);
  const [imageUri, setImageUri] = useState<string | null>(
    note.imageUrl || null
  );
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false); //  For drawing
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false); //  For previewing

  // check for change
  const isModified =
    title.trim() === "" ||
    title.trim() !== note.name ||
    content.trim() !== note.content ||
    (note.imageUrl ? imageUri !== note.imageUrl : false) ||
    (imageUri ? imageUri !== note.imageUrl : false);

  // prevent empty value
  const isValid = title.trim() !== "" && content.trim() !== "";

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

  const handleSave = async () => {
    const saveNote = async (imageUrl?: string) => {
      setUpdating(true);

      const success = await updateNote(note.id, groupId, {
        name: trimmedTitle,
        content: trimmedContent,
        imageUrl,
      });

      setUpdating(false);

      if (success) {
        setEditMode(false);
      }
    };
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in both title and content.",
      });
      return;
    }

    let imageUrlToSave = imageUri;

    if (
      imageUri &&
      imageUri !== note.imageUrl &&
      !imageUri.startsWith("http")
    ) {
      setUpdating(true); // show spinner early

      await uploadWithRetry(
        imageUri,
        uploadImageToCloudinary,
        (url) => {
          imageUrlToSave = url;
          saveNote(url);
        },
        () => {
          setUpdating(false); // user canceled retry
        }
      );
    } else {
      saveNote(imageUrlToSave ? imageUrlToSave : undefined);
    }
  };

  const debouncedPickImage = useDebouncedPress(pickImage);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setEditMode((prev) => !prev)}
          style={[
            styles.iconButton,
            { backgroundColor: editMode ? "#000" : "#ccc" },
          ]}
        >
          <Ionicons
            name={editMode ? "checkmark" : "pencil"}
            size={26}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {editMode && imageUri && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
          {updating || uploading ? null : (
            <TouchableOpacity
              onPress={() => setImageUri(null)}
              style={styles.removeImageButton}
            >
              <Text style={styles.removeImageText}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Image */}
      {!editMode && imageUri && (
        <TouchableOpacity onPress={() => setImagePreviewVisible(true)}>
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      {/* Pick image button */}
      {editMode && !updating && !uploading && (
        <TouchableOpacity
          onPress={debouncedPickImage}
          style={styles.imageButton}
        >
          <Text style={styles.imageButtonText}>
            {imageUri ? "Change Image" : "Add Image"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Timestamp */}
      {!editMode && note.updateAt && (
        <Text style={styles.timestamp}>
          Last updated:{" "}
          {note.updateAt instanceof Date
            ? note.updateAt.toLocaleString()
            : new Date(note.updateAt.seconds * 1000).toLocaleString()}
        </Text>
      )}

      {/* Title */}
      {editMode ? (
        <TextInput
          editable={!updating && !uploading}
          style={[
            styles.titleInput,
            { opacity: updating || uploading ? 0.6 : 1 },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
        />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}

      {/* Content */}
      {editMode ? (
        <TextInput
          editable={!updating && !uploading}
          style={[
            styles.contentInput,
            { opacity: updating || uploading ? 0.6 : 1 },
          ]}
          multiline
          value={content}
          onChangeText={setContent}
          placeholder="Content"
        />
      ) : (
        <Text style={styles.content}>{content}</Text>
      )}

      {/* Save Button */}
      {editMode && (
        <TouchableOpacity
          style={[
            styles.saveButton,
            { opacity: updating || !isModified || !isValid ? 0.6 : 1 },
          ]}
          onPress={handleSave}
          disabled={updating || !isModified || !isValid}
        >
          {updating || uploading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      )}
      {/* 🔽 Editor modal after picking image */}
      {imageUri && (
        <EditImageModal
          visible={editorVisible}
          imageUri={imageUri}
          onClose={() => {
            //  Reset imageUri to original
            if (note.imageUrl) {
              setImageUri(note.imageUrl);
            } else {
              setImageUri(null);
            }
            setEditorVisible(false);
          }}
          onSaveSuccess={(editedUri) => {
            setImageUri(editedUri); //  Replace original image
            setEditorVisible(false);
          }}
        />
      )}
      <ImagePreviewModal
        visible={imagePreviewVisible}
        imageUri={imageUri}
        onClose={() => setImagePreviewVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  timestamp: {
    marginTop: 20,
    fontSize: 12,
    color: "#777",
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    height: 50,
  },
  contentInput: {
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    minHeight: 150,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  saveText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  iconButton: {
    padding: 10,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  imageButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 12,
  },
  imageButtonText: {
    color: "#333",
    fontSize: 14,
  },
  imageContainer: {
    position: "relative", // Allows positioning the remove button
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    position: "absolute", // Position it absolutely within the container
    top: 10, // Position it 10 units from the top
    right: 10, // Position it 10 units from the right
    backgroundColor: "#ff4d4d",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  removeImageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default NoteDetailScreen;
