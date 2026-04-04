import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { COLORS, SPACING, RADIUS } from "../constants/theme";
import { TYPOGRAPHY } from "../constants/typography";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface StatusCapsuleProps {
  type: "diagnosis" | "hydration";
  title: string;
  subtitle: string;
}

export function StatusCapsule({ type, title, subtitle }: StatusCapsuleProps) {
  const isDiagnosis = type === "diagnosis";
  
  return (
    <View style={[styles.container, isDiagnosis ? styles.diagnosisBg : styles.hydrationBg]}>
      <View style={styles.iconWrapper}>
        {isDiagnosis ? (
          <Ionicons name="leaf" size={20} color="#16552B" />
        ) : (
          <Ionicons name="water" size={20} color="#FFF" />
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, !isDiagnosis && styles.whiteText]}>{title}</Text>
        <Text style={[styles.subtitle, !isDiagnosis && styles.lightText]}>{subtitle}</Text>
      </View>
      
      <View style={styles.watermark}>
        {isDiagnosis ? (
          <MaterialCommunityIcons name="flask-outline" size={80} color="rgba(0,0,0,0.05)" />
        ) : (
          <MaterialCommunityIcons name="leaf" size={80} color="rgba(0,0,0,0.1)" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: RADIUS.lg,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    overflow: "hidden",
    position: "relative",
  },
  diagnosisBg: {
    backgroundColor: "#C5E6C2",
  },
  hydrationBg: {
    backgroundColor: "#8C6A5E",
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  title: {
    ...TYPOGRAPHY.body,
    fontWeight: "bold",
    fontSize: 16,
    color: "#16552B",
    marginBottom: 2,
  },
  whiteText: {
    color: "#FFF",
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    lineHeight: 18,
    color: "#4A6148",
  },
  lightText: {
    color: "#E8EFE5",
  },
  watermark: {
    position: "absolute",
    right: -10,
    bottom: -10,
    opacity: 0.8,
  },
});
