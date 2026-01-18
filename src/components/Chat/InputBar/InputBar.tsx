import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLanguage } from "../../../context/language/LanguageContext";
import { styles } from "./styles";

export interface InputBarHandles {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

export interface InputBarProps {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  onCancel: () => void;
  isSending: boolean;
  canSend: boolean;
  autoFocus?: boolean;
}

const InputBar = React.memo(
  forwardRef<InputBarHandles, InputBarProps>(
    (
      { value, onChangeText, onSend, onCancel, isSending, canSend, autoFocus },
      ref
    ) => {
      const { t } = useLanguage();
      const inputRef = useRef<TextInput>(null);
      const contentHeightRef = useRef(40);

      useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        clear: () => inputRef.current?.clear(),
      }));

      const RightButton = useMemo(() => {
        if (isSending) {
          return (
            <TouchableOpacity
              style={[styles.btn, styles.btnGray]}
              onPress={onCancel}
              accessibilityLabel={t("chat.cancel.accessibility")}
            >
              <Text style={styles.btnTextLight}>{t("chat.cancel")}</Text>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity
            style={[styles.btn, canSend ? styles.btnDark : styles.btnDisabled]}
            onPress={onSend}
            disabled={!canSend}
            accessibilityLabel={t("chat.send.accessibility")}
          >
            <Text style={styles.btnTextLight}>{t("chat.send")}</Text>
          </TouchableOpacity>
        );
      }, [isSending, canSend, onSend, onCancel]);

      return (
        <View style={styles.wrap}>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              { height: Math.min(Math.max(contentHeightRef.current, 40), 120) },
            ]}
            placeholder={t("chat.input.placeholder")}
            placeholderTextColor="#777"
            value={value}
            onChangeText={onChangeText}
            multiline
            autoCorrect
            autoFocus={autoFocus}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={() => {
              if (canSend && !isSending) onSend();
            }}
            onContentSizeChange={(e) => {
              const h = Math.ceil(e.nativeEvent.contentSize.height);
              contentHeightRef.current = h;
            }}
            textAlignVertical="top"
            accessibilityLabel={t("chat.input.accessibility")}
          />
          {RightButton}
        </View>
      );
    }
  ),
  // Comparator chỉ so sánh primitive để tránh "kẹt" prop function mới
  (prev, next) =>
    prev.value === next.value &&
    prev.isSending === next.isSending &&
    prev.canSend === next.canSend &&
    prev.autoFocus === next.autoFocus
);

export default InputBar;
