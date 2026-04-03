import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../constants/theme";
import { TYPOGRAPHY } from "../constants/typography";
import { FontAwesome5 } from "@expo/vector-icons";

interface HeaderProps {
  title?: string;
  showLanguageToggle?: boolean;
}

export function Header({ title = "Dr. Planteinstein", showLanguageToggle = true }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <FontAwesome5 name="leaf" size={18} color={COLORS.primary} style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {showLanguageToggle && (
        <Text style={styles.languageToggle}>HI/EN</Text>
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
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background, // Match background so it blends
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
