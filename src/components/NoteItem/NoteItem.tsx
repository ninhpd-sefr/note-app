import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  GestureResponderEvent,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Note } from "../../types/type";
import { useSessionUnlock } from "../../context/session/SessionUnlockContext";
import { useLanguage } from "../../context/language/LanguageContext";
import { styles } from "./styles";

type NoteItemProps = {
  note: Note;
  onPress: (note: Note) => void;
  onLongPress: (note: Note, event: GestureResponderEvent) => void;
};

const NoteItem: React.FC<NoteItemProps> = ({ note, onPress, onLongPress }) => {
  const { unlockedSession } = useSessionUnlock();
  const { t } = useLanguage();

  console.log(`Render NoteItem: ${note.name}`);

  return (
    <TouchableOpacity
      style={[styles.noteCard]}
      onPress={() => onPress(note)}
      onLongPress={(event) => onLongPress(note, event)}
    >
      {/* Icon Pinned/Locked */}
      {(note.pinned || note.locked) && (
        <View style={styles.topIcons}>
          {note.pinned && (
            <MaterialCommunityIcons
              name="pin"
              size={16}
              color="gray"
              style={{ marginRight: 6 }}
            />
          )}
          {note.locked && (
            <Ionicons
              name={unlockedSession ? "lock-open-outline" : "lock-closed"}
              size={16}
              color="gray"
            />
          )}
        </View>
      )}

      {/* Note Title */}
      <Text style={styles.noteTitle}>{note.name}</Text>

      {/* Note Content or Locked Indicator */}
      {note.locked ? (
        <Text style={[styles.noteContent, { color: "#777" }]}>
          {unlockedSession ? t("note.item.unlocked") : t("note.item.locked")}
        </Text>
      ) : (
        <>
          <Text
            style={styles.noteContent}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {note.content}
          </Text>
          {note.imageUrl && (
            <Image source={{ uri: note.imageUrl }} style={styles.noteImage} />
          )}
        </>
      )}

      {/* Updated Timestamp */}
      {note.updateAt && (
        <Text style={styles.timestamp}>
          {t("note.item.updated")}{" "}
          {(note.updateAt instanceof Date
            ? note.updateAt
            : note.updateAt.toDate()
          ).toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// Use memo to prevent re-rendering when props do not change
export default memo(NoteItem, (prevProps, nextProps) => {
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.name === nextProps.note.name &&
    prevProps.note.content === nextProps.note.content &&
    prevProps.note.imageUrl === nextProps.note.imageUrl &&
    prevProps.note.updateAt === nextProps.note.updateAt
  );
});
