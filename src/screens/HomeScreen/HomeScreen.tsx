// HomeScreen.tsx
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  BackHandler,
  GestureResponderEvent,
  SafeAreaView,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../app/navigation";
import { Ionicons } from "@expo/vector-icons";
import CreateGroupModal from "../../components/CreateGroupModal/CreateGroupModal";
import { ActivityIndicator, Menu } from "react-native-paper";
import { signOutUser } from "../../services/AuthService";
import EmptyState from "../../components/EmptyState/EmptyState";
import RenameGroupModal from "../../components/RenameGroupModal/RenameGroupModal";
import { useNote } from "../../context/note/NoteContext";
import { useSessionUnlock } from "../../context/session/SessionUnlockContext";
import { useFocusEffect } from "@react-navigation/native";
import MemoizedGroupItem from "../../components/GroupItem/MemoizedGroupItem";
import { NoteGroup } from "../../types/type";
import { checkNetworkConnection } from "../../utils";
import { useSnackbar } from "../../context/snack/SnackbarContext";
import { useDebouncedPress } from "../../hooks/useDebouncedPress";
import SimpleButton from "../../components/SimpleButton/SimpleButton";
import { styles } from "./styles";
import { showLoading, hideLoading } from "../../services/loadingService";
import { useLanguage } from "../../context/language";

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
  const { t } = useLanguage();

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
      showSnackbar(t("home.group.created"), "success");
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
      showSnackbar(t("home.group.renamed"), "success");
      setRenameModalVisible(false);
    }
  };

  const handleDelete = async (item: NoteGroup) => {
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
      return;
    }
    Alert.alert(
      t("home.delete.group.title"),
      t("home.delete.group.message").replace("{name}", item.name),
      [
        { text: t("home.cancel"), style: "cancel" },
        {
          text: t("home.delete"),
          style: "destructive",
          onPress: async () => {
            if (user?.uid) {
              showLoading();
              await deleteGroup(item.id, user.uid);
              hideLoading();
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      // Clear groups first to prevent any pending operations
      clearGroups();

      // Reset session
      resetSession();

      // Sign out from Firebase
      await signOutUser();

      // Remove user data from storage
      await AsyncStorage.removeItem("user");

      // Navigate to login
      navigation.replace("Login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, still navigate to login
      navigation.replace("Login");
    }
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
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{t("home.title")}</Text>
            <Text style={styles.userName}>
              {t("home.greeting").replace(
                "{name}",
                user?.email || user?.displayName || ""
              )}
            </Text>
          </View>

          <TouchableOpacity onPress={debouncedLogout}>
            <Text style={styles.logoutText}>{t("home.logout")}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <SimpleButton
            onPress={() => navigation.navigate("Chat")}
            title={t("home.chat.gemini")}
          />
          <SimpleButton
            onPress={() => navigation.navigate("UserGuide")}
            title={t("home.user.guide")}
            style={styles.userGuideButton}
          />
          <SimpleButton
            onPress={() => navigation.navigate("ManageSubscription")}
            title="Subscriptions"
            style={styles.userGuideButton}
          />
        </ScrollView>
        <Text style={styles.groupTitle}>{t("home.your.groups")}</Text>
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
              <EmptyState message={t("home.empty.message")} />
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
            title={t("home.rename")}
            titleStyle={styles.menuItemText}
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              selectedGroup && handleDelete(selectedGroup);
            }}
            title={t("home.delete")}
            titleStyle={[styles.menuItemText, styles.deleteText]}
          />
        </Menu>
      </View>
    </SafeAreaView>
  );
};

export default memo(HomeScreen);
