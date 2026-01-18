import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  PanResponder,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Portal, Appbar, Button } from "react-native-paper";
import { Canvas, Path } from "@shopify/react-native-skia";
import { captureRef } from "react-native-view-shot";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styles } from "./style";
import { useLanguage } from "../../context/language/LanguageContext";

interface EditImageModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  onSaveSuccess?: (savedUri: string) => void;
}

type DrawPath = {
  path: string;
  color: string;
};

const EditImageModal: React.FC<EditImageModalProps> = ({
  visible,
  imageUri,
  onClose,
  onSaveSuccess,
}) => {
  const { t } = useLanguage();
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [imageRenderLayout, setImageRenderLayout] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pathSegments, setPathSegments] = useState<DrawPath[]>([]);
  const [pathHistory, setPathHistory] = useState<DrawPath[][]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLayout, setImageLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const canvasContainerRef = useRef<View>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const controlPointRef = useRef<{ x: number; y: number } | null>(null);
  // console.log("imageUri", imageUri);

  useEffect(() => {
    if (imageUri) {
      Image.getSize(
        imageUri,
        (width, height) => {
          setImageSize({ width, height });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting image size:", error);
          setLoading(false);
        }
      );
    }
  }, [imageUri]);

  const isPointInsideImage = (x: number, y: number) => {
    if (!imageLayout) return false;
    return (
      x >= imageLayout.x &&
      x <= imageLayout.x + imageLayout.width &&
      y >= imageLayout.y &&
      y <= imageLayout.y + imageLayout.height
    );
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isDrawing,
    onPanResponderGrant: (evt) => {
      if (isDrawing) {
        const { locationX, locationY } = evt.nativeEvent;
        if (!isPointInsideImage(locationX, locationY)) return;
        setCurrentPath(`M${locationX} ${locationY}`);
        lastPointRef.current = { x: locationX, y: locationY };
        controlPointRef.current = null;
      }
    },
    onPanResponderMove: (evt) => {
      if (!isDrawing || !lastPointRef.current) return;
      const { locationX, locationY } = evt.nativeEvent;
      if (!isPointInsideImage(locationX, locationY)) return;
      const lastX = lastPointRef.current.x;
      const lastY = lastPointRef.current.y;
      const midX = (lastX + locationX) / 2;
      const midY = (lastY + locationY) / 2;
      const distance = Math.hypot(locationX - lastX, locationY - lastY);
      if (distance > 150) return;
      if (!controlPointRef.current) {
        setCurrentPath((prev) => `${prev} L${locationX} ${locationY}`);
      } else {
        const ctrlX = controlPointRef.current.x;
        const ctrlY = controlPointRef.current.y;
        setCurrentPath((prev) => `${prev} Q${ctrlX} ${ctrlY} ${midX} ${midY}`);
      }
      lastPointRef.current = { x: locationX, y: locationY };
      controlPointRef.current = { x: midX, y: midY };
    },
    onPanResponderRelease: () => {
      if (isDrawing && currentPath) {
        const newPath: DrawPath = { path: currentPath, color: "red" };
        const newPathSegments = [...pathSegments, newPath];
        setPathSegments(newPathSegments);
        setPathHistory([...pathHistory, newPathSegments]);
        setCurrentPath("");
        lastPointRef.current = null;
        controlPointRef.current = null;
      }
    },
  });

  const toggleDrawing = () => setIsDrawing(!isDrawing);

  const handleUndo = () => {
    if (pathHistory.length > 1) {
      const newHistory = pathHistory.slice(0, -1);
      setPathHistory(newHistory);
      setPathSegments(newHistory[newHistory.length - 1]);
    } else if (pathHistory.length === 1) {
      setPathHistory([]);
      setPathSegments([]);
    }
  };

  const handleSave = async () => {
    if (canvasContainerRef.current) {
      try {
        const uri = await captureRef(canvasContainerRef, {
          format: "png",
          quality: 1,
        });
        setPathSegments([]);
        setPathHistory([]);
        setCurrentPath("");
        setIsDrawing(false);
        console.log("Saved at:", uri);
        onSaveSuccess?.(uri);
      } catch (err) {
        console.error("Capture error:", err);
        Alert.alert(
          t("edit.image.save.error.title"),
          t("edit.image.save.error.message")
        );
      }
    }
  };

  const handleClear = () => {
    if (pathSegments.length === 0) return;
    Alert.alert(
      t("edit.image.delete.all.title"),
      t("edit.image.delete.all.message"),
      [
        { text: t("edit.image.delete.all.cancel"), style: "cancel" },
        {
          text: t("edit.image.delete.all.delete"),
          style: "destructive",
          onPress: () => {
            setPathSegments([]);
            setPathHistory([]);
            setCurrentPath("");
          },
        },
      ]
    );
  };

  const handleClose = () => {
    if (pathSegments.length >= 1) {
      Alert.alert(
        t("edit.image.discard.changes.title"),
        t("edit.image.discard.changes.message"),
        [
          { text: t("edit.image.discard.changes.cancel"), style: "cancel" },
          {
            text: t("edit.image.discard.changes.discard"),
            style: "destructive",
            onPress: () => {
              setPathSegments([]);
              setPathHistory([]);
              setCurrentPath("");
              setIsDrawing(false);
              onClose();
            },
          },
        ]
      );
    } else {
      setIsDrawing(false);
      onClose();
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} transparent>
        <View style={styles.fullscreenContainer}>
          <Appbar style={styles.appbar}>
            <TouchableOpacity
              style={styles.actionButtonWithBg}
              onPress={handleClose}
            >
              <MaterialCommunityIcons name="close" size={25} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButtonWithBg}
              onPress={toggleDrawing}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={25}
                color={isDrawing ? "#FF0000" : "#fff"}
              />
            </TouchableOpacity>
            {pathHistory.length > 0 && (
              <>
                <TouchableOpacity
                  style={styles.actionButtonWithBg}
                  onPress={handleClear}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={25}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButtonWithBg}
                  onPress={handleUndo}
                >
                  <MaterialCommunityIcons name="undo" size={25} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </Appbar>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          ) : (
            <View style={styles.centeredWrapper}>
              <View
                ref={canvasContainerRef}
                collapsable={false}
                style={{
                  width: imageRenderLayout?.width ?? "100%",
                  height: imageRenderLayout?.height ?? undefined,
                  alignSelf: "center",
                  position: "relative",
                }}
                {...panResponder.panHandlers}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={{
                    width: "100%",
                    aspectRatio:
                      imageSize?.width && imageSize?.height
                        ? imageSize.width / imageSize.height
                        : 1,
                  }}
                  resizeMode="contain"
                  onLayout={(e) => {
                    const { width, height } = e.nativeEvent.layout;
                    setImageRenderLayout({ width, height });
                    setImageLayout({ ...e.nativeEvent.layout });
                  }}
                />
                <Canvas style={StyleSheet.absoluteFill}>
                  {pathSegments.map((segment, index) => (
                    <Path
                      key={index}
                      path={segment.path}
                      color={segment.color}
                      style="stroke"
                      strokeWidth={4}
                      strokeCap="round"
                      strokeJoin="round"
                    />
                  ))}
                  {currentPath && (
                    <Path
                      path={currentPath}
                      color="red"
                      style="stroke"
                      strokeWidth={4}
                      strokeCap="round"
                      strokeJoin="round"
                    />
                  )}
                </Canvas>
              </View>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            labelStyle={styles.saveButtonLabel}
            icon="arrow-left"
          >
            {t("edit.image.save")}
            {/* {imageUri && <Text> Image exist</Text>} */}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default EditImageModal;
