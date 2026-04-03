import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { TYPOGRAPHY } from "../constants/typography";
import { FontAwesome5 } from "@expo/vector-icons";

export type BadgeType = "severe" | "healthy" | "warning" | "soil" | "critical" | "info";

interface BadgeProps {
  type: BadgeType;
  text: string;
}

export function Badge({ type, text }: BadgeProps) {
  const getStyles = () => {
    switch (type) {
      case "severe":
      case "warning":
        return { bg: COLORS.warningBg, text: COLORS.warningText, icon: "exclamation-triangle" };
      case "healthy":
        return { bg: COLORS.healthyBg, text: COLORS.healthyText, icon: "check-circle" };
      case "soil":
        return { bg: COLORS.soilBg, text: COLORS.soilText, icon: "seedling" };
      case "critical":
        return { bg: COLORS.criticalBg, text: COLORS.criticalText, icon: "exclamation-circle" };
      case "info":
      default:
        return { bg: COLORS.infoBg, text: COLORS.infoText, icon: "info-circle" };
    }
  };

  const styleConfig = getStyles();

  return (
    <View style={[styles.container, { backgroundColor: styleConfig.bg }]}>
      <FontAwesome5 name={styleConfig.icon} size={10} color={styleConfig.text} style={styles.icon} />
      <Text style={[styles.text, { color: styleConfig.text }]}>{text.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    alignSelf: "flex-start",
  },
  icon: {
    marginRight: 4,
  },
  text: {
    ...TYPOGRAPHY.tiny,
    fontWeight: "700",
  },
});
