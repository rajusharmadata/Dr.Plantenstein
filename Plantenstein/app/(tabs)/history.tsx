import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl
} from "react-native";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { TYPOGRAPHY } from "../../src/constants/typography";
import { Badge, BadgeType } from "../../src/components/Badge";
import { Card } from "../../src/components/Card";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getRecords, AnalysisResult } from "../../src/services/api";

const STATUS_TABS = [
  { label: "All Records", value: undefined },
  { label: "Diseased", value: "warning" },
  { label: "Critical", value: "critical" },
  { label: "Healthy", value: "healthy" },
];

export default function History() {
  const [records, setRecords] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchRecords = useCallback(async (status?: string) => {
    try {
      setError(null);
      const response = await getRecords(status);
      setRecords(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load records.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchRecords(activeStatus);
      setLoading(false);
    })();
  }, [activeStatus, fetchRecords]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecords(activeStatus);
    setRefreshing(false);
  };

  const handleTabChange = (value?: string) => {
    setActiveStatus(value);
  };

  const handleRecordPress = (record: AnalysisResult) => {
    router.push({ pathname: "/results", params: { id: record._id, uri: record.imageUrl } });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      + " • " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      <Text style={styles.headerTitle}>Field Records</Text>
      <Text style={styles.headerSubtitle}>
        Chronological history of your crop diagnostics and health scans.
      </Text>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabContainer}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={[styles.tab, activeStatus === tab.value && styles.activeTab]}
            onPress={() => handleTabChange(tab.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeStatus === tab.value && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading State */}
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching records...</Text>
        </View>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card style={styles.errorCard}>
          <FontAwesome5 name="wifi" size={24} color={COLORS.warningText} style={{ marginBottom: SPACING.sm }} />
          <Text style={styles.errorTitle}>Cannot reach the server</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <Text style={styles.errorHint}>Make sure the server is running on port 3000.</Text>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && records.length === 0 && (
        <Card style={styles.emptyCard}>
          <FontAwesome5 name="seedling" size={36} color={COLORS.primary} style={{ marginBottom: SPACING.sm }} />
          <Text style={styles.emptyTitle}>No records yet</Text>
          <Text style={styles.emptySubtitle}>Scan your first leaf to get started!</Text>
        </Card>
      )}

      {/* Records List */}
      {!loading && !error && records.length > 0 && (
        <View style={styles.listContainer}>
          {records.map((record) => (
            <TouchableOpacity key={record._id} activeOpacity={0.8} onPress={() => handleRecordPress(record)}>
              <Card style={styles.recordCard}>
                <View style={styles.recordContent}>
                  {/* Image */}
                  <View style={[styles.imagePlaceholder, { backgroundColor: COLORS.brandLight }]}>
                    <View style={styles.badgeWrapper}>
                      <Badge type={record.status as BadgeType} text={record.status} />
                    </View>
                  </View>

                  {/* Details */}
                  <View style={styles.recordDetails}>
                    <Text style={styles.recordTitle} numberOfLines={1}>{record.title}</Text>
                    <Text style={styles.recordCrop}>{record.cropName} · {record.cropScientific}</Text>
                    <View style={styles.dateRow}>
                      <FontAwesome5 name="calendar-alt" size={10} color={COLORS.textSecondary} />
                      <Text style={styles.recordDate}>{formatDate(record.scannedAt)}</Text>
                    </View>
                    {record.location?.latitude && (
                      <View style={styles.dateRow}>
                        <FontAwesome5 name="map-marker-alt" size={10} color={COLORS.primary} />
                        <Text style={[styles.recordDate, { color: COLORS.primary }]}>
                          {record.location.latitude.toFixed(3)}, {record.location.longitude.toFixed(3)}
                        </Text>
                      </View>
                    )}
                  </View>

                  <FontAwesome5 name="chevron-right" size={14} color={COLORS.inactive} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bottom Info */}
      <Card style={styles.infoCard}>
        <FontAwesome5 name="box-open" size={24} color={COLORS.primary} style={{ marginBottom: SPACING.sm }} />
        <Text style={styles.infoTitle}>Looking for older scans?</Text>
        <Text style={styles.infoSubtitle}>Records are kept for 12 months.</Text>
      </Card>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  headerTitle: { ...TYPOGRAPHY.h1, color: COLORS.primary, marginBottom: SPACING.xs },
  headerSubtitle: { ...TYPOGRAPHY.body, marginBottom: SPACING.lg },
  tabScroll: { marginBottom: SPACING.lg },
  tabContainer: { flexDirection: "row", gap: SPACING.sm },
  tab: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.pill, backgroundColor: COLORS.cardBackground, borderWidth: 1, borderColor: COLORS.border },
  activeTab: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { ...TYPOGRAPHY.small, fontWeight: "600" },
  activeTabText: { color: COLORS.white },
  centered: { alignItems: "center", paddingVertical: SPACING.xxl },
  loadingText: { ...TYPOGRAPHY.small, color: COLORS.textSecondary, marginTop: SPACING.sm },
  errorCard: { alignItems: "center", paddingVertical: SPACING.xl, marginBottom: SPACING.lg, backgroundColor: COLORS.warningBg },
  errorTitle: { ...TYPOGRAPHY.bodySemibold, color: COLORS.warningText, marginBottom: 4 },
  errorSubtitle: { ...TYPOGRAPHY.small, color: COLORS.warningText, textAlign: "center", marginBottom: SPACING.sm },
  errorHint: { ...TYPOGRAPHY.tiny, color: COLORS.textSecondary, textAlign: "center" },
  emptyCard: { alignItems: "center", paddingVertical: SPACING.xl, marginBottom: SPACING.lg },
  emptyTitle: { ...TYPOGRAPHY.bodySemibold, color: COLORS.primary, marginBottom: 4 },
  emptySubtitle: { ...TYPOGRAPHY.small },
  listContainer: { gap: SPACING.sm, marginBottom: SPACING.xl },
  recordCard: { padding: SPACING.sm },
  recordContent: { flexDirection: "row", alignItems: "center" },
  imagePlaceholder: { width: 80, height: 80, borderRadius: RADIUS.sm, overflow: "hidden", marginRight: SPACING.md, justifyContent: "flex-start", alignItems: "flex-start", padding: 4 },
  badgeWrapper: { transform: [{ scale: 0.85 }] },
  recordDetails: { flex: 1 },
  recordTitle: { ...TYPOGRAPHY.bodySemibold, marginBottom: 2 },
  recordCrop: { ...TYPOGRAPHY.tiny, marginBottom: SPACING.xs },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  recordDate: { ...TYPOGRAPHY.tiny, color: COLORS.textSecondary },
  infoCard: { alignItems: "center", backgroundColor: COLORS.brandLight, paddingVertical: SPACING.lg },
  infoTitle: { ...TYPOGRAPHY.bodySemibold, color: COLORS.primary, marginBottom: 4 },
  infoSubtitle: { ...TYPOGRAPHY.tiny, color: COLORS.textPrimary },
});
