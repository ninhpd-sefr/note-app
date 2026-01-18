import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";
import { TourStep } from "../../types/type";
import { styles } from "./styles";
import { useLanguage, TranslationKey } from "../../context/language";

// Tour guide data template
const getTourSteps = (t: (key: TranslationKey) => string): TourStep[] => [
  {
    id: "1",
    title: t("tour.welcome.title"),
    description: t("tour.welcome.description"),
    icon: "book-outline",
  },
  {
    id: "2",
    title: t("tour.create.title"),
    description: t("tour.create.description"),
    icon: "add-circle-outline",
  },
  {
    id: "3",
    title: t("tour.organize.title"),
    description: t("tour.organize.description"),
    icon: "folder-outline",
  },
  {
    id: "4",
    title: t("tour.search.title"),
    description: t("tour.search.description"),
    icon: "search-outline",
  },
  {
    id: "5",
    title: t("tour.secure.title"),
    description: t("tour.secure.description"),
    icon: "lock-closed-outline",
  },
  {
    id: "6",
    title: t("tour.ai.title"),
    description: t("tour.ai.description"),
    icon: "chatbubble-outline",
  },
];

export default function UserGuideScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);
  const { t } = useLanguage();

  const tourSteps = getTourSteps(t);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={styles.backText}>{t("tour.back")}</Text>
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentStep + 1} / {tourSteps.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentStep + 1) / tourSteps.length) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Tour Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepContainer}>
            {/* Icon/Image */}
            <View style={styles.iconContainer}>
              <Ionicons
                name={currentTourStep.icon as any}
                size={80}
                color={colors.primary}
              />
            </View>

            {/* Title */}
            <Text style={styles.stepTitle}>{currentTourStep.title}</Text>

            {/* Description */}
            <Text style={styles.stepDescription}>
              {currentTourStep.description}
            </Text>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>{t("tour.skip")}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextText}>
              {currentStep === tourSteps.length - 1
                ? t("tour.complete")
                : t("tour.next")}
            </Text>
            <Ionicons
              name={
                currentStep === tourSteps.length - 1
                  ? "checkmark"
                  : "arrow-forward"
              }
              size={20}
              color={colors.secondary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
