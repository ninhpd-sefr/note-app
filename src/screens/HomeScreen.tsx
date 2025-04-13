// HomeScreen.tsx
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  BackHandler,
  GestureResponderEvent,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../app/navigation";
import { Ionicons } from "@expo/vector-icons";
import CreateGroupModal from "../components/CreateGroupModal";
import { ActivityIndicator, Menu } from "react-native-paper";
import { signOutUser } from "../services/AuthService";
import EmptyState from "../components/EmptyState";
import RenameGroupModal from "../components/RenameGroupModal";
import { useNote } from "../context/note/NoteContext";
import { useSessionUnlock } from "../context/session/SessionUnlockContext";
import { useFocusEffect } from "@react-navigation/native";
import MemoizedGroupItem from "../components/GroupItem/MemoizedGroupItem";
import { NoteGroup } from "../types/type";
import { checkNetworkConnection } from "../utils";
import Toast from "react-native-toast-message";
import { useSnackbar } from "../context/snack/SnackbarContext";
import { useDebouncedPress } from "../hooks/useDebouncedPress";

interface Props {
  navigation: StackNavigationProp<RootStackParamList, "Home">;
}

interface User {
  uid: string;
  email?: string;
  displayName?: string;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const {
    noteGroups,
    loading,
    fetchGroups,
    addGroup,
    renameGroup,
    deleteGroup,
    loadMoreGroups,
    canLoadMoreGroups,
    clearGroups,
  } = useNote();

  const [user, setUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<NoteGroup | null>(null);
  const [anchorPos, setAnchorPos] = useState({ x: 0, y: 0 });
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [groupToRename, setGroupToRename] = useState<NoteGroup | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const { resetSession } = useSessionUnlock();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchUser = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        await fetchGroups(parsed.uid);
      }
    };
    fetchUser();
  }, []);

  const handleAddGroup = async () => {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      return;
    }

    if (!user?.uid || !newGroupName.trim()) return;
    setLoadingModal(true);
    const success = await addGroup(user.uid, newGroupName);
    setLoadingModal(false);
    if (success) {
      showSnackbar("Group created successfully", "success");
      setNewGroupName("");
      setModalVisible(false);
    }
  };

  const handleRename = async () => {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      return;
    }
    if (!groupToRename || !renameValue.trim() || !user?.uid) return;
    setLoadingModal(true);
    const success = await renameGroup(
      groupToRename.id,
      renameValue.trim(),
      user.uid
    );
    setLoadingModal(false);
    if (success) {
      showSnackbar("Group renamed successfully", "success");
      setRenameModalVisible(false);
    }
  };

  const handleDelete = async (item: NoteGroup) => {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      return;
    }
    Alert.alert("Delete Group", `Delete \"${item.name}\" and notes?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (user?.uid) {
            await deleteGroup(item.id, user.uid);
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    resetSession();
    await signOutUser();
    await AsyncStorage.removeItem("user");
    clearGroups();
    navigation.replace("Login");
  };

  //Prevent back button from behavior
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return true; // Block back button behavior
      };
      // Add back button listener
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      // Cleanup when unmounting
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [])
  );

  const handleRefresh = async () => {
    if (!user?.uid) return;
    setRefreshing(true);
    await fetchGroups(user.uid);
    setRefreshing(false);
  };

  const handleGroupPress = useCallback(
    (item: NoteGroup) => {
      navigation.navigate("Group", {
        groupId: item.id,
        groupName: item.name,
        userId: user?.uid || "",
      });
    },
    [navigation, user?.uid]
  );

  const handleGroupLongPress = useCallback(
    (item: NoteGroup, e: GestureResponderEvent) => {
      setSelectedGroup(item);
      setAnchorPos({
        x: e.nativeEvent.pageX,
        y: e.nativeEvent.pageY,
      });
      setMenuVisible(true);
    },
    [setSelectedGroup, setAnchorPos, setMenuVisible]
  );

  const memoizedNoteGroups = useMemo(() => noteGroups, [noteGroups]);

  const handleEndReached = async () => {
    if (!user?.uid || !canLoadMoreGroups || loadingMore) return;
    setLoadingMore(true);
    await loadMoreGroups(user.uid);
    setLoadingMore(false);
  };

  const uniqueGroups = useMemo(() => {
    return Array.from(
      new Map(memoizedNoteGroups.map((g) => [g.id, g])).values()
    );
  }, [memoizedNoteGroups]);
  const debouncedLogout = useDebouncedPress(handleLogout);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notes App</Text>
          <Text style={styles.userName}>
            Hi, {user?.email || user?.displayName}
          </Text>
        </View>
        {/* <TouchableOpacity onPress={() => navigation.navigate("Test")}>
          <Text>Test</Text>
        </TouchableOpacity> */}

        <TouchableOpacity onPress={debouncedLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.groupTitle}>Your Groups</Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#000"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={uniqueGroups}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <MemoizedGroupItem
              item={item}
              onPress={handleGroupPress}
              onLongPress={handleGroupLongPress}
            />
          )}
          contentContainerStyle={{
            paddingBottom: 50,
            flexGrow: 1,
            justifyContent: noteGroups.length === 0 ? "center" : "flex-start",
          }}
          ListFooterComponent={
            canLoadMoreGroups ? (
              <ActivityIndicator
                size="small"
                color="#888"
                style={{ marginVertical: 15 }}
              />
            ) : null
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.2}
          ListEmptyComponent={
            <EmptyState message='No note groups yet. Tap "+" to create one!' />
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={35} color="#FFF" />
      </TouchableOpacity>

      <CreateGroupModal
        visible={modalVisible}
        onClose={() => {
          setNewGroupName("");
          setModalVisible(false);
        }}
        onCreate={handleAddGroup}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        loading={loadingModal}
      />

      <RenameGroupModal
        visible={renameModalVisible}
        onClose={() => setRenameModalVisible(false)}
        onRename={handleRename}
        groupName={renameValue}
        setGroupName={setRenameValue}
        originalGroupName={groupToRename?.name || ""}
        loading={loadingModal}
      />

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: anchorPos.x, y: anchorPos.y }}
        contentStyle={styles.menuContent}
        style={styles.menu}
      >
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            if (selectedGroup) {
              setRenameValue(selectedGroup.name);
              setGroupToRename(selectedGroup);
              setRenameModalVisible(true);
            }
          }}
          title="Rename"
          titleStyle={styles.menuItemText}
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            selectedGroup && handleDelete(selectedGroup);
          }}
          title="Delete"
          titleStyle={[styles.menuItemText, styles.deleteText]}
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: { fontSize: 30, fontWeight: "bold", color: "#000000" },
  groupTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 20,
    marginBottom: 10,
    color: "#333",
  },
  userName: { fontSize: 16, color: "#555", marginTop: 2 },
  logoutText: { color: "#00AEEF", fontSize: 18, fontWeight: "600" },
  noteItem: {
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: "#F7F8F9",
  },
  noteText: { fontSize: 18, fontWeight: "500", color: "#000" },
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
  menu: { borderRadius: 10, elevation: 4 },
  menuContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 4,
  },
  menuItemText: { fontSize: 16, color: "#333" },
  deleteText: { color: "#E53935", fontWeight: "600" },
});

export default memo(HomeScreen);
