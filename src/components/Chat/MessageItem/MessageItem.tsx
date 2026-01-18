import React from "react";
import { View } from "react-native";
import Markdown from "react-native-markdown-display";
import TypingIndicator from "../TypingIndicator/TypingIndicator";
import { ChatMessage } from "../../../types/type";
import { styles } from "./styles";

export type MessageItemProps = { message: ChatMessage };

const MessageItem = React.memo<MessageItemProps>(({ message }) => {
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const isTyping = message.role === "typing";

  return (
    <View style={[styles.bubbleRow, isUser ? styles.rowEnd : styles.rowStart]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? styles.userBubble
            : isError
            ? styles.errorBubble
            : styles.botBubble,
        ]}
      >
        {isTyping ? (
          <TypingIndicator />
        ) : (
          <Markdown
            style={{
              body: {
                ...styles.bubbleText,
                ...(isUser ? styles.userText : styles.botText),
              },
              paragraph: {
                marginTop: 0,
                marginBottom: 0,
              },
              code_inline: {
                backgroundColor: isUser
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.1)",
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 4,
                fontSize: 14,
              },
              code_block: {
                backgroundColor: isUser
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.1)",
                padding: 8,
                borderRadius: 8,
                marginVertical: 4,
              },
              fence: {
                backgroundColor: isUser
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(0,0,0,0.1)",
                padding: 8,
                borderRadius: 8,
                marginVertical: 4,
              },
            }}
          >
            {message.text}
          </Markdown>
        )}
      </View>
    </View>
  );
}, areEqualMessageItem);

function areEqualMessageItem(prev: MessageItemProps, next: MessageItemProps) {
  return (
    prev.message.id === next.message.id &&
    prev.message.text === next.message.text &&
    prev.message.role === next.message.role
  );
}

export default MessageItem;
