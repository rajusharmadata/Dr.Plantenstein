import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from "react-native";
import { COLORS, RADIUS, SPACING } from "../src/constants/theme";
import { TYPOGRAPHY } from "../src/constants/typography";
import { Badge } from "../src/components/Badge";
import { Card } from "../src/components/Card";
import { Button } from "../src/components/Button";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Header } from "../src/components/Header";
import { getRecordById, AnalysisResult } from "../src/services/api";
import type { BadgeType } from "../src/components/Badge";

export default function ResultsScreen() {
  const router = useRouter();
  const { id, uri } = useLocalSearchParams<{ id?: string; uri?: string }>();

  const [record, setRecord] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("No analysis result ID provided.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await getRecordById(id);
        setRecord(data);
      } catch (err: any) {
        setError(err.message || "Failed to load result.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  if (error || !record) {
    return (
      <View style={styles.centered}>
        <FontAwesome5 name="exclamation-circle" size={40} color={COLORS.warningText} />
        <Text style={styles.errorText}>{error ?? "Something went wrong."}</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" style={{ marginTop: SPACING.md }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Main Image Card */}
        <View style={styles.imageCard}>
          <Image
            source={{ uri: uri ?? record.imageUrl }}
            style={styles.leafImage}
            resizeMode="cover"
          />
          <View style={styles.badgeTopLeft}>
            <Badge type={record.status as BadgeType} text={record.status} />
          </View>
          <View style={styles.confidenceOverlay}>
            <Text style={styles.confidenceLabel}>CONFIDENCE</Text>
            <Text style={styles.confidenceValue}>{record.confidence}%</Text>
          </View>
        </View>

        {/* Title and Description */}
        <Text style={styles.title}>{record.title}</Text>
        <Text style={styles.cropLabel}>{record.cropName} · {record.cropScientific}</Text>
        <Text style={styles.description}>{record.analysis.description}</Text>

        {/* Location (if available) */}
        {record.location?.latitude && (
          <Card style={styles.locationCard}>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="map-marker-alt" size={14} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
              <Text style={styles.cardTitle}>Location</Text>
            </View>
            <Text style={styles.cardDesc}>
              {record.location.address || `${record.location.latitude.toFixed(4)}, ${record.location.longitude.toFixed(4)}`}
            </Text>
          </Card>
        )}

        {/* Organic Remedies */}
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="medkit" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Organic Remedies</Text>
          </View>
          <Text style={styles.cardDesc}>{record.analysis.remedies}</Text>
        </Card>

        {/* Prevention */}
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainerPrevention}>
              <FontAwesome5 name="shield-alt" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Prevention</Text>
          </View>
          <View style={styles.bulletList}>
            {record.analysis.prevention.map((tip, i) => (
              <View key={i} style={styles.bulletRow}>
                <FontAwesome5 name="check-circle" size={12} color={COLORS.primary} />
                <Text style={styles.bulletText}>{tip}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Soil Health */}
        <Card style={styles.soilCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainerSoil}>
              <FontAwesome5 name="seedling" size={16} color={COLORS.warningText} />
            </View>
            <Text style={styles.cardTitle}>Soil Health</Text>
          </View>
          <Text style={styles.cardDesc}>{record.analysis.soilHealth}</Text>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Scan Another"
            icon="expand-arrows-alt"
            onPress={() => router.push("/(tabs)/scan")}
            style={{ marginBottom: SPACING.md }}
          />
          <View style={styles.secondaryActions}>
            <Button title="Save Report" variant="secondary" icon="save" style={styles.flexButton} onPress={() => {}} />
            <Button title="Share" variant="secondary" icon="share-alt" style={styles.flexButton} onPress={() => {}} />
          </View>
        </View>
      </ScrollView>

      {/* Dummy Tab Bar */}
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
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: SPACING.lg, backgroundColor: COLORS.background },
  loadingText: { ...TYPOGRAPHY.body, marginTop: SPACING.md, color: COLORS.textSecondary },
  errorText: { ...TYPOGRAPHY.body, textAlign: "center", marginTop: SPACING.md, color: COLORS.warningText },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl },
  imageCard: { width: "100%", aspectRatio: 4 / 3, marginBottom: SPACING.lg, borderRadius: RADIUS.lg, overflow: "hidden" },
  leafImage: { flex: 1 },
  badgeTopLeft: { position: "absolute", top: SPACING.sm, left: SPACING.sm },
  confidenceOverlay: {
    position: "absolute", bottom: SPACING.sm, right: SPACING.sm,
    backgroundColor: "rgba(255,255,255,0.88)", paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm, borderRadius: RADIUS.md, alignItems: "center",
  },
  confidenceLabel: { ...TYPOGRAPHY.tiny, color: COLORS.primary, fontWeight: "800" },
  confidenceValue: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary },
  title: { ...TYPOGRAPHY.h1, marginBottom: 2 },
  cropLabel: { ...TYPOGRAPHY.small, color: COLORS.primary, fontWeight: "600", marginBottom: SPACING.xs },
  description: { ...TYPOGRAPHY.body, marginBottom: SPACING.lg },
  locationCard: { marginBottom: SPACING.md, backgroundColor: COLORS.infoBg },
  infoCard: { marginBottom: SPACING.md },
  soilCard: { marginBottom: SPACING.xl, backgroundColor: COLORS.soilBg },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm },
  iconContainer: { backgroundColor: COLORS.healthyBg, padding: 6, borderRadius: RADIUS.sm, marginRight: 8 },
  iconContainerPrevention: { backgroundColor: COLORS.brandLight, padding: 6, borderRadius: RADIUS.sm, marginRight: 8 },
  iconContainerSoil: { backgroundColor: "rgba(255,255,255,0.5)", padding: 6, borderRadius: RADIUS.sm, marginRight: 8 },
  cardTitle: { ...TYPOGRAPHY.bodySemibold },
  cardDesc: { ...TYPOGRAPHY.small },
  bulletList: { marginLeft: 4, gap: 8 },
  bulletRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  bulletText: { ...TYPOGRAPHY.small },
  actionsContainer: { marginTop: SPACING.md },
  secondaryActions: { flexDirection: "row", gap: SPACING.md },
  flexButton: { flex: 1 },
  dummyTabBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", height: 70, backgroundColor: COLORS.background, paddingBottom: SPACING.md },
  dummyScanActive: { backgroundColor: COLORS.primary, width: 60, height: 60, borderRadius: RADIUS.pill, justifyContent: "center", alignItems: "center", marginBottom: 20 },
});
