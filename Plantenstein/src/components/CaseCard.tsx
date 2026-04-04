import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, RADIUS } from "../constants/theme";
import { TYPOGRAPHY } from "../constants/typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface CaseCardProps {
  caseId: string;
  subject: string;
}

export function CaseCard({ caseId, subject }: CaseCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons name="clipboard-text-outline" size={24} color="#16552B" />
      </View>
      <View style={styles.content}>
        <Text style={styles.caseId}>CASE ID: {caseId}</Text>
        <Text style={styles.subject}>Subject: {subject}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F4F7EE",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: "#16552B",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6EEE1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  caseId: {
    ...TYPOGRAPHY.body,
    fontWeight: "800",
    color: "#16552B",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  subject: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: "#4A6148",
    marginTop: 2,
  },
});
