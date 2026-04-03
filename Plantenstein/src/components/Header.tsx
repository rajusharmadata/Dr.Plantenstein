import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SPACING } from "../constants/theme";
import { TYPOGRAPHY } from "../constants/typography";
import { FontAwesome5 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as SecureStore from "expo-secure-store";

interface HeaderProps {
  title?: string;
  showLanguageToggle?: boolean;
}

export function Header({ title = "Dr. Planteinstein", showLanguageToggle = true }: HeaderProps) {
  const { i18n } = useTranslation();

  const toggleLanguage = async () => {
    const nextLang = i18n.language === "en" ? "hi" : "en";
    await i18n.changeLanguage(nextLang);
    await SecureStore.setItemAsync("user-language", nextLang);
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <FontAwesome5 name="leaf" size={18} color={COLORS.primary} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {showLanguageToggle && (
        <TouchableOpacity onPress={toggleLanguage} activeOpacity={0.7}>
          <Text style={styles.languageToggle}>
            {i18n.language === "en" ? "HI" : "EN"} / {i18n.language === "en" ? "EN" : "HI"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: 44, // Added padding to push the header down
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
  },
  languageToggle: {
    ...TYPOGRAPHY.small,
    fontWeight: "700",
    color: COLORS.primary,
  },
});
