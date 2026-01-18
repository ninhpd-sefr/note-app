// components/GroupItem.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { NoteGroup } from "../../types/type";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./styles";

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
