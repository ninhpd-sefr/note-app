import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import type { ChatMessage } from "../../types/type";
import {
  callGeminiCancelable,
  getApiKey,
  makeGeminiHistory,
  uid,
} from "../../services/gemini";
import { styles } from "./styles";
import MessageItem from "../../components/Chat/MessageItem/MessageItem";
import InputBar from "../../components/Chat/InputBar/InputBar";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../../context/language";
const ChatGeminiScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "system",
      text: t("chat.welcome.message"),
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const cancelRef = useRef<null | (() => void)>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isSending,
    [input, isSending]
  );
  const history = useMemo(() => makeGeminiHistory(messages), [messages]);

  const keyExtractor = useCallback((m: ChatMessage) => m.id, []);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() =>
      listRef.current?.scrollToEnd({ animated: true })
    );
  }, []);

  const onSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", text };
    const typingMsg: ChatMessage = {
      id: `typing-${Date.now()}`,
      role: "typing",
      text: "",
    };

    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setInput("");
    scrollToEnd();

    setIsSending(true);
    const { promise, cancel } = callGeminiCancelable({
      apiKey: getApiKey(),
      contents: [...history, { role: "user", parts: [{ text }] }],
    });
    cancelRef.current = cancel;

    try {
      const { text: reply, blocked } = await promise;
      const assistantText = blocked
        ? t("chat.content.blocked").replace("{reason}", blocked)
        : reply || t("chat.no.response");

      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingMsg.id
            ? {
                id: uid(),
                role: blocked ? "error" : "model",
                text: assistantText,
              }
            : m
        )
      );
      scrollToEnd();
    } catch (err: any) {
      // Nếu bị abort, chỉ xoá typing
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingMsg.id
            ? {
                id: uid(),
                role: "error",
                text: t("chat.error.occurred").replace(
                  "{error}",
                  err?.message ?? String(err)
                ),
              }
            : m
        )
      );
      scrollToEnd();
    } finally {
      setIsSending(false);
      cancelRef.current = null;
    }
  }, [history, input, isSending, scrollToEnd]);

  const onCancel = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    setIsSending(false);
    // Xoá bubble typing nếu còn
    setMessages((prev) => prev.filter((m) => m.role !== "typing"));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
          <Text style={styles.backText}>{t("chat.back")}</Text>
        </TouchableOpacity>
        {/* Group Title */}
        <Text style={styles.title}>{t("chat.title")}</Text>
        <KeyboardAvoidingView
          style={styles.containerContent}
          behavior={Platform.select({ ios: "padding", android: undefined })}
          keyboardVerticalOffset={Platform.OS === "android" ? 0 : 8}
        >
          <FlatList
            ref={listRef}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={messages}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => <MessageItem message={item} />}
            onContentSizeChange={scrollToEnd}
          />

          <InputBar
            value={input}
            onChangeText={setInput}
            onSend={onSend}
            onCancel={onCancel}
            isSending={isSending}
            canSend={canSend}
          />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default ChatGeminiScreen;
