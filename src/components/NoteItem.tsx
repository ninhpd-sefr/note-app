import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Note } from "../types/type";
import { useSessionUnlock } from "../context/session/SessionUnlockContext";

type NoteItemProps = {
  note: Note;
  onPress: (note: Note) => void;
  onLongPress: (note: Note, event: GestureResponderEvent) => void;
};

const NoteItem: React.FC<NoteItemProps> = ({ note, onPress, onLongPress }) => {
  const { unlockedSession } = useSessionUnlock();

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
          {unlockedSession ? "Unlocked" : "Locked"}
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
          Updated:{" "}
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

const styles = StyleSheet.create({
  noteCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F3F3",
    marginBottom: 10,
    flex: 1,
    marginRight: 8,
  },
  topIcons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 4,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  noteContent: {
    fontSize: 16,
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  noteImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginTop: 10,
    resizeMode: "cover",
  },
});
