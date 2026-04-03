import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../src/constants/theme";
import { TYPOGRAPHY } from "../../src/constants/typography";

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Farmer Profile</Text>
      <Text style={styles.subtitle}>Manage your settings and account.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
  },
});
