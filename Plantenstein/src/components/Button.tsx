import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { TYPOGRAPHY } from "../constants/typography";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  style,
  textStyle,
  disabled
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          container: { backgroundColor: COLORS.primary },
          text: { color: COLORS.white },
          iconColor: COLORS.white,
        };
      case "secondary":
        return {
          container: { backgroundColor: COLORS.brandLight },
          text: { color: COLORS.textPrimary },
          iconColor: COLORS.textPrimary,
        };
      case "outline":
      default:
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: COLORS.primary,
          },
          text: { color: COLORS.primary },
          iconColor: COLORS.primary,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.baseContainer,
        vStyles.container,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && (
        <FontAwesome5
          name={icon}
          size={16}
          color={vStyles.iconColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.baseText, vStyles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  baseText: {
    ...TYPOGRAPHY.bodySemibold,
    textAlign: "center",
  },
  icon: {
    marginRight: SPACING.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
