// components/GroupItem.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";
import { NoteGroup } from "../../types/type";
import { Feather, Ionicons } from "@expo/vector-icons";

type GroupItemProps = {
  item: NoteGroup;
  onPress: (item: NoteGroup) => void;
  onLongPress: (item: NoteGroup, event: GestureResponderEvent) => void;
};

const GroupItem: React.FC<GroupItemProps> = ({
  item,
  onPress,
  onLongPress,
}) => {
  console.log(`Render Group: ${item.name}`); // Log to check re-render

  return (
    <TouchableOpacity
      style={styles.noteItem}
      activeOpacity={0.8}
      onPress={() => onPress(item)}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.noteText}>{item.name}</Text>
          <TouchableOpacity onPress={(e) => onLongPress(item, e)}>
            <Ionicons
              name="ellipsis-vertical-circle-outline"
              size={28}
              color="#888"
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default GroupItem;

const styles = StyleSheet.create({
  noteItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  textContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  noteText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  noteCount: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
});
