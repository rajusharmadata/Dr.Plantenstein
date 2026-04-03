import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { TYPOGRAPHY } from "../constants/typography";
import { FontAwesome5 } from "@expo/vector-icons";

interface MenuCardProps {
  icon: string;
  label: string;
  onPress: () => void;
  iconBgColor?: string;
}

export function MenuCard({ icon, label, onPress, iconBgColor = COLORS.cardBackground }: MenuCardProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.7} 
      onPress={onPress}
    >
      <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
        <FontAwesome5 name={icon} size={18} color={COLORS.primary} />
      </View>

      <Text style={styles.label}>{label}</Text>

      <FontAwesome5 name="chevron-right" size={14} color={COLORS.inactive} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: "center",
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
});
