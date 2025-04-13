import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  GestureResponderEvent,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../app/navigation";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import EmptyState from "../components/EmptyState";
import CreateNoteModal from "../components/CreateNoteModal";
import { Divider, Menu } from "react-native-paper";
import { Note } from "../types/type";
import MoveNoteModal from "../components/MoveNoteModal";
import { useNote } from "../context/note/NoteContext";
import { useSessionUnlock } from "../context/session/SessionUnlockContext";
import {
  checkNetworkConnection,
  checkNetworkStability,
  normalizeText,
  removeDuplicates,
} from "../utils";
import UnlockNoteModal from "../components/UnlockNoteModal";
import { StackNavigationProp } from "@react-navigation/stack";
import NoteItem from "../components/NoteItem";
import { useSnackbar } from "../context/snack/SnackbarContext";
import Toast from "react-native-toast-message";

type Props = {
  route: RouteProp<RootStackParamList, "Group">;
};

type NoteOrPlaceholder = Note | { id: string; isPlaceholder: true };

type NavigationProp = StackNavigationProp<RootStackParamList, "Group">;

const GroupScreen: React.FC<Props> = ({ route }) => {
  const { groupId, groupName, userId } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [isGridView, setIsGridView] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unlockViewModalVisible, setUnlockViewModalVisible] = useState(false);
  const [noteToUnlock, setNoteToUnlock] = useState<Note | null>(null);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [lockModalVisible, setLockModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    notesByGroup,
    fetchNotes,
    addNote,
    deleteNote,
    moveNote,
    loadingNote,
    canLoadMoreNotes,
    loadMoreNotes,
    togglePinNote,
    toggleLockNote,
  } = useNote();
  const { unlockedSession, unlockSession } = useSessionUnlock();
  const { showSnackbar } = useSnackbar();

  const notes = notesByGroup[groupId] || [];

  useEffect(() => {
    fetchNotes(groupId);
  }, [groupId]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) =>
      normalizeText(note.name).includes(normalizeText(searchQuery))
    );
  }, [notes, searchQuery]);

  // sort notes by pinned again
  const sortedNotes = useMemo(() => {
    return [
      ...filteredNotes.filter((note) => note.pinned),
      ...filteredNotes.filter((note) => !note.pinned),
    ];
  }, [filteredNotes]);

  // if isGridView or sort note don't change , don't handle
  // const formattedNotes: NoteOrPlaceholder[] = useMemo(() => {
  //   return isGridView && sortedNotes.length % 2 !== 0
  //     ? [...sortedNotes, { id: "placeholder", isPlaceholder: true }]
  //     : sortedNotes;
  // }, [isGridView, sortedNotes]);

  // Add Note (from context)
  const handleAddNote = useCallback(
    async (title: string, content: string, imageUrl?: string) => {
      const success = await addNote(groupId, title, content, imageUrl);
      if (success) {
        showSnackbar("Note added successfully", "success");
        setModalVisible(false);
      }
      return success;
    },
    [addNote, groupId]
  );

  // Delete Note (from context)
  const handleDeleteNote = useCallback(async () => {
    setMenuVisible(false);
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      return;
    }
    if (!selectedNote) return;

    Alert.alert("Delete Note", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const success = await deleteNote(selectedNote.id, groupId);
          if (success) {
            setSelectedNote(null);
          }
        },
      },
    ]);
  }, [selectedNote, deleteNote, groupId]);

  // Move Note (from context)
  const handleMoveNote = useCallback(
    async (newGroupId: string) => {
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        return;
      }
      if (!selectedNote) return;

      const success = await moveNote(selectedNote.id, groupId, newGroupId);
      if (success) {
        showSnackbar("Note moved successfully", "success");
        setMoveModalVisible(false);
        setMenuVisible(false);
        setSelectedNote(null);
      }
    },
    [selectedNote, moveNote, groupId]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotes(groupId);
    setRefreshing(false);
  }, [fetchNotes, groupId]);

  const handlePressNote = useCallback(
    (note: Note) => {
      if (note.locked) {
        if (unlockedSession) {
          navigation.navigate("NoteDetail", { note, groupId });
        } else {
          setNoteToUnlock(note);
          setUnlockViewModalVisible(true);
        }
      } else {
        navigation.navigate("NoteDetail", { note, groupId });
      }
    },
    [
      unlockedSession,
      navigation,
      groupId,
      setNoteToUnlock,
      setUnlockViewModalVisible,
    ]
  );

  const handleLongPressNote = useCallback(
    (note: Note, event: GestureResponderEvent) => {
      setSelectedNote(note);
      setMenuPosition({
        x: event.nativeEvent.pageX,
        y: event.nativeEvent.pageY,
      });
      setMenuVisible(true);
    },
    [setSelectedNote, setMenuPosition, setMenuVisible]
  );

  const renderItem = useCallback(
    ({ item }: { item: NoteOrPlaceholder }) => {
      return (
        <NoteItem
          note={item as Note}
          onPress={handlePressNote}
          onLongPress={handleLongPressNote}
        />
      );
    },
    [handlePressNote, handleLongPressNote]
  );
  const keyExtractor = useCallback((item: NoteOrPlaceholder) => item.id, []);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      {/* Group Title */}
      <Text style={styles.title}>{groupName}</Text>
      <TouchableOpacity
        style={{ alignSelf: "flex-end", marginBottom: 10 }}
        onPress={() => {
          setIsGridView(!isGridView);
        }}
      >
        <Ionicons name={isGridView ? "list" : "grid"} size={35} color="black" />
      </TouchableOpacity>
      <TextInput
        style={styles.searchInput}
        placeholder="Search notes..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
        }}
      />
      {loadingNote ? (
        <ActivityIndicator
          size="large"
          color="#000"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          key={isGridView ? "grid" : "list"}
          numColumns={isGridView ? 2 : 1}
          columnWrapperStyle={
            isGridView ? { justifyContent: "space-between" } : undefined
          }
          data={removeDuplicates(sortedNotes)}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListFooterComponent={
            canLoadMoreNotes[groupId] && !searchQuery.trim() ? (
              <ActivityIndicator
                size="small"
                color="#888"
                style={{ marginVertical: 15 }}
              />
            ) : null
          }
          onEndReached={() => {
            if (canLoadMoreNotes[groupId] === true && !loadingNote) {
              loadMoreNotes(groupId);
            }
          }}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={<EmptyState message="No notes yet !!!" />}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={35} color="#FFF" />
      </TouchableOpacity>
      {/* Add Note Modal */}
      <CreateNoteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddNote}
      />
      <MoveNoteModal
        visible={moveModalVisible}
        onClose={() => setMoveModalVisible(false)}
        onMove={handleMoveNote}
        currentGroupId={groupId}
        userId={userId}
      />
      {/* unlock to view notes */}
      <UnlockNoteModal
        title="View Note"
        subTitle="To view locked notes, enter the password."
        visible={unlockViewModalVisible}
        userId={userId}
        onClose={() => {
          setUnlockViewModalVisible(false);
          setNoteToUnlock(null);
        }}
        onSuccess={() => {
          unlockSession();
          setUnlockViewModalVisible(false);
          if (noteToUnlock) {
            navigation.navigate("NoteDetail", { note: noteToUnlock, groupId });
          }
          setNoteToUnlock(null);
        }}
      />
      {/* unlock to clear lock pin */}
      <UnlockNoteModal
        title="Remove Lock"
        subTitle="Enter your password to remove the lock from this note."
        visible={unlockModalVisible}
        userId={userId}
        onClose={() => {
          setUnlockModalVisible(false);
          setMenuVisible(false);
          setSelectedNote(null);
        }}
        onSuccess={async () => {
          unlockSession();
          if (selectedNote) {
            await toggleLockNote(
              selectedNote.id,
              groupId,
              selectedNote.locked ?? false
            );
            setMenuVisible(false);
            setSelectedNote(null);
          }
          setUnlockModalVisible(false);
        }}
      />
      {/* unlock to lock note  as iphone */}
      <UnlockNoteModal
        title="Lock note"
        subTitle="Enter your password to lock this note."
        visible={lockModalVisible}
        userId={userId}
        onClose={() => {
          setLockModalVisible(false);
          setMenuVisible(false);
          setSelectedNote(null);
        }}
        onSuccess={async () => {
          unlockSession();
          if (selectedNote) {
            await toggleLockNote(
              selectedNote.id,
              groupId,
              selectedNote.locked ?? false
            );
            setMenuVisible(false);
            setSelectedNote(null);
          }
          setLockModalVisible(false);
        }}
      />
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: menuPosition.x, y: menuPosition.y }}
        contentStyle={styles.menuContent}
        style={styles.menu}
      >
        <Menu.Item
          title={selectedNote?.pinned ? "Unpin Note" : "Pin Note"}
          leadingIcon={({ size }) => (
            <MaterialCommunityIcons
              name={selectedNote?.pinned ? "pin-off" : "pin"}
              size={size}
              color="gray"
            />
          )}
          titleStyle={styles.menuItemText}
          onPress={async () => {
            setMenuVisible(false);
            const isConnected = await checkNetworkConnection();
            if (!isConnected) {
              return;
            }
            if (selectedNote) {
              await togglePinNote(
                selectedNote.id,
                groupId,
                selectedNote.pinned ?? false
              );
              setSelectedNote(null);
            }
          }}
        />
        <Divider />

        <Menu.Item
          title="Move to another group"
          leadingIcon={({ size }) => (
            <Ionicons name="folder" size={size} color="gray" />
          )}
          titleStyle={styles.menuItemText}
          onPress={async () => {
            setMenuVisible(false);
            const isConnected = await checkNetworkConnection();
            if (!isConnected) {
              return;
            }
            setMoveModalVisible(true);
          }}
        />
        <Divider />

        <Menu.Item
          title={selectedNote?.locked ? "Unlock Note" : "Lock Note"}
          leadingIcon={({ size }) => (
            <Ionicons
              name={selectedNote?.locked ? "lock-open" : "lock-closed"}
              size={size}
              color="gray"
            />
          )}
          titleStyle={styles.menuItemText}
          onPress={async () => {
            setMenuVisible(false);
            const isConnected = await checkNetworkConnection();
            if (!isConnected) {
              return;
            }
            if (selectedNote && selectedNote?.locked) {
              // unlock the note
              if (unlockedSession) {
                if (selectedNote) {
                  await toggleLockNote(
                    selectedNote.id,
                    groupId,
                    selectedNote.locked ?? false
                  );
                  setMenuVisible(false);
                  setSelectedNote(null);
                }
              } else {
                setUnlockModalVisible(true);
              }
            } else {
              // lock the note
              if (unlockedSession) {
                if (selectedNote) {
                  await toggleLockNote(
                    selectedNote.id,
                    groupId,
                    selectedNote.locked ?? false
                  );
                  setMenuVisible(false);
                  setSelectedNote(null);
                }
              } else {
                setLockModalVisible(true);
              }
            }
          }}
        />
        <Divider />

        <Menu.Item
          title="Delete Note"
          leadingIcon={({ size }) => (
            <Ionicons name="trash" size={size} color="red" />
          )}
          onPress={handleDeleteNote}
          titleStyle={[styles.menuItemText, { color: "red" }]}
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFF" },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    color: "#000",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 0 },
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
  noteContent: { fontSize: 16, color: "#333" },
  timestamp: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#000",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
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
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
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
  menu: {
    borderRadius: 10,
    elevation: 4,
  },
  menuContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 4,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  deleteText: {
    color: "#E53935",
    fontWeight: "600",
  },
  noteImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginTop: 10,
    resizeMode: "cover",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    height: 45,
  },
});

export default GroupScreen;
