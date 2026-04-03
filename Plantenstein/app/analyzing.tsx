import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { COLORS, RADIUS, SPACING } from "../src/constants/theme";
import { TYPOGRAPHY } from "../src/constants/typography";
import { Card } from "../src/components/Card";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Header } from "../src/components/Header";

export default function AnalyzingScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri?: string }>();

  // Simulate analysis delay then redirect
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace({
        pathname: "/results",
        params: { uri } // pass it along to results
      });
    }, 3000); 

    return () => clearTimeout(timer);
  }, [router, uri]);

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        {/* Mock Image Analysis Window */}
        <View style={styles.analysisWindowWrapper}>
          <View style={styles.analysisWindow}>
            {uri ? (
              <Image source={{ uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
            ) : null}
            
            {/* Corner brackets */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {/* Scan Lines Mockup */}
            <View style={styles.scanLabel}>
              <FontAwesome5 name="asterisk" size={10} color={COLORS.primary} style={styles.labelIcon}/>
              <Text style={styles.labelText}>STRUCTURE_SCAN</Text>
            </View>
            <View style={[styles.scanLabel, { top: "60%", right: "10%" }]}>
              <FontAwesome5 name="bullseye" size={10} color={COLORS.primary} style={styles.labelIcon}/>
              <Text style={styles.labelText}>CELL_DENSITY</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Analyzing your crop...</Text>
        <Text style={styles.subtitle}>
          Dr. Planteinstein is cross-referencing leaf patterns with 50,000+ botanical samples.
        </Text>

        <View style={styles.loaderRow}>
          <FontAwesome5 name="circle-notch" size={12} color={COLORS.primary} />
          <FontAwesome5 name="circle-notch" size={12} color={COLORS.primary} />
          <FontAwesome5 name="circle-notch" size={12} color={COLORS.primary} />
          <Text style={styles.loaderText}>PROCESSING MATRIX</Text>
        </View>

        <Card style={styles.infoCard}>
          <View style={styles.infoIconWrapper}>
            <FontAwesome5 name="info-circle" size={16} color={COLORS.primary} />
          </View>
          <View style={styles.infoTextWrapper}>
            <Text style={styles.infoTitle}>This may take a few seconds</Text>
            <Text style={styles.infoDesc}>
              High-resolution AI analysis ensures a 98% accuracy rate for disease detection.
            </Text>
          </View>
        </Card>
      </View>
      
      {/* Dummy Tab Bar for visual consistency */}
      <View style={styles.dummyTabBar}>
        <FontAwesome5 name="home" size={20} color={COLORS.inactive} />
        <FontAwesome5 name="users" size={20} color={COLORS.inactive} />
        <View style={styles.dummyScanActive}>
          <FontAwesome5 name="expand" size={20} color={COLORS.white} />
        </View>
        <FontAwesome5 name="history" size={20} color={COLORS.inactive} />
        <FontAwesome5 name="user" size={20} color={COLORS.inactive} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  analysisWindowWrapper: {
    width: 280,
    height: 280,
    backgroundColor: COLORS.cardBackground,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: SPACING.xl,
  },
  analysisWindow: {
    flex: 1,
    backgroundColor: "#2A3A2C", // Dark green placeholder for leaf
    borderRadius: RADIUS.md,
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "rgba(100, 200, 100, 0.8)",
  },
  topLeft: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: RADIUS.sm },
  topRight: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: RADIUS.sm },
  bottomLeft: { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: RADIUS.sm },
  bottomRight: { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: RADIUS.sm },
  scanLabel: {
    position: "absolute",
    top: "30%",
    left: "15%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  labelIcon: {
    marginRight: 4,
  },
  labelText: {
    ...TYPOGRAPHY.tiny,
    fontWeight: "700",
    color: COLORS.primary,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    textAlign: "center",
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  loaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xl,
    gap: 4,
  },
  loaderText: {
    ...TYPOGRAPHY.small,
    fontWeight: "700",
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    letterSpacing: 1,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.brandLight,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
  },
  infoIconWrapper: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoTitle: {
    ...TYPOGRAPHY.bodySemibold,
    marginBottom: 4,
  },
  infoDesc: {
    ...TYPOGRAPHY.tiny,
  },
  dummyTabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 70,
    backgroundColor: COLORS.background,
    paddingBottom: SPACING.md,
  },
  dummyScanActive: {
    backgroundColor: COLORS.textPrimary,
    width: 60,
    height: 60,
    borderRadius: RADIUS.pill,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
});
