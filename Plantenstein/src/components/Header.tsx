import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { COLORS, SPACING, RADIUS } from "../constants/theme";
import { TYPOGRAPHY } from "../constants/typography";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

interface HeaderProps {
  title?: string;
  showLanguageToggle?: boolean;
  showBackButton?: boolean;
  showProfile?: boolean;
  avatarUrl?: string;
}

export function Header({ 
  title = "Dr. Planteinstein", 
  showLanguageToggle = true,
  showBackButton = false,
  showProfile = false,
  avatarUrl = "https://i.pravatar.cc/100?u=drp"
}: HeaderProps) {
  const { i18n } = useTranslation();
  const router = useRouter();

  const toggleLanguage = async () => {
    const nextLang = i18n.language === "en" ? "hi" : "en";
    await i18n.changeLanguage(nextLang);
    await SecureStore.setItemAsync("user-language", nextLang);
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <FontAwesome5 name="leaf" size={18} color={COLORS.primary} style={styles.icon} />
        )}
        <Text style={[styles.title, showBackButton && styles.titleChat]}>{title}</Text>
      </View>

      <View style={styles.rightSection}>
        {showLanguageToggle && (
          <TouchableOpacity onPress={toggleLanguage} style={styles.langBadge} activeOpacity={0.7}>
            <Text style={styles.langText}>
              {i18n.language.toUpperCase()} | {i18n.language === "en" ? "HI" : "EN"}
            </Text>
          </TouchableOpacity>
        )}
        
        {showProfile && (
          <TouchableOpacity style={styles.profileWrapper}>
            <Image 
              source={{ uri: avatarUrl }} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: 50,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    marginRight: SPACING.md,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontWeight: "bold",
  },
  titleChat: {
    fontSize: 20,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  langBadge: {
    backgroundColor: "#F0F4E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    marginRight: SPACING.sm,
  },
  langText: {
    ...TYPOGRAPHY.tiny,
    fontWeight: "700",
    color: "#4A5D48",
  },
  profileWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
});
