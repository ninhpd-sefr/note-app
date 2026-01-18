import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../app/navigation";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { useNote } from "../../context/note/NoteContext";
import { uploadImageToCloudinary } from "../../services/cloudinaryService";
import ImagePreviewModal from "../../components/ImagePreviewModal/ImagePreviewModal";
import EditImageModal from "../../components/EditImageModal/EditImageModal";
import useUploadWithRetry from "../../hooks/useUploadWithRetry";
import { useDebouncedPress } from "../../hooks/useDebouncedPress";
import { styles } from "./styles";
import { hideLoading, showLoading } from "../../services/loadingService";
import { useLanguage } from "../../context/language/LanguageContext";

type Props = {
  route: RouteProp<RootStackParamList, "NoteDetail">;
};

const NoteDetailScreen: React.FC<Props> = ({ route }) => {
  const { note, groupId } = route.params;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { uploadWithRetry } = useUploadWithRetry();
  const { updateNote } = useNote();
  const { t } = useLanguage();

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
      alert(t("note.detail.permission.required"));
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
      showLoading();

      const success = await updateNote(note.id, groupId, {
        name: trimmedTitle,
        content: trimmedContent,
        imageUrl,
      });

      setUpdating(false);
      hideLoading();

      if (success) {
        setEditMode(false);
      }
    };
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      Toast.show({
        type: "error",
        text1: t("note.detail.missing.fields.title"),
        text2: t("note.detail.missing.fields.message"),
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
      saveNote(imageUrlToSave || undefined);
    }
  };

  const debouncedPickImage = useDebouncedPress(pickImage);

  return (
    <SafeAreaView style={styles.safeArea}>
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
              {imageUri
                ? t("note.detail.change.image")
                : t("note.detail.add.image")}
            </Text>
          </TouchableOpacity>
        )}

        {/* Timestamp */}
        {!editMode && note.updateAt && (
          <Text style={styles.timestamp}>
            {t("note.detail.last.updated")}{" "}
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
            placeholder={t("note.detail.title.placeholder")}
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
            placeholder={t("note.detail.content.placeholder")}
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
            <Text style={styles.saveText}>{t("note.detail.save.changes")}</Text>
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
    </SafeAreaView>
  );
};

export default NoteDetailScreen;
