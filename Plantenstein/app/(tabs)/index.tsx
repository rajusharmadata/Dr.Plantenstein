import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { TYPOGRAPHY } from "../../src/constants/typography";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const [weather, setWeather] = useState({ temp: 28, condition: "sunny", icon: "sunny-outline" });

  useEffect(() => {
    const fetchRealWeather = async () => {
      try {
        const lat = 28.6139;
        const lon = 77.2090;
        const response = await fetch(`http://192.168.31.68:3000/api/weather?lat=${lat}&lon=${lon}`);
        const result = await response.json();
        if (result.success) {
          setWeather(result.data);
        }
      } catch (error) {
        console.error("Error fetching weather from backend:", error);
      }
    };
    fetchRealWeather();
  }, []);

  const handleGalleryUpload = async () => {
    try {
      // Request media library permission if not already granted
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload images.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        // Navigate to the scan tab with the selected image URI
        router.push({ pathname: "/(tabs)/scan", params: { preselectedUri: imageUri } });
      }
    } catch (err: any) {
      Alert.alert("Error", "Could not open photo library. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Info */}
      <View style={styles.topInfo}>
        <View>
          <Text style={styles.welcomeText}>{t("welcome")}</Text>
          <Text style={styles.subtitleText}>{t("welcomeSubtitle")}</Text>
        </View>
        <View style={styles.weatherWidget}>
          <Ionicons name="sunny-outline" size={20} color={COLORS.primary} />
          <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
        </View>
      </View>

      {/* Main Scan Card */}
      <TouchableOpacity
        style={styles.scanCard}
        onPress={() => router.push("/(tabs)/scan")}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1000" }}
          style={styles.scanCardImage}
        />
        <View style={styles.scanCardOverlay}>
          <View style={styles.scanIconBadge}>
            <Ionicons name="scan-outline" size={32} color={COLORS.white} />
          </View>
          <View style={styles.primaryActionBadge}>
            <Text style={styles.primaryActionText}>PRIMARY ACTION</Text>
          </View>
          <Text style={styles.scanTitle}>{t("scanYourCrop")}</Text>
          <Text style={styles.scanDescription}>{t("scanSubtitle")}</Text>
        </View>
      </TouchableOpacity>

      {/* Quick Actions Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionCard} activeOpacity={0.8} onPress={handleGalleryUpload}>
          <View style={styles.actionIconContainer}>
            <Ionicons name="image-outline" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>{t("uploadGallery")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/(tabs)/history")}
          activeOpacity={0.8}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="folder-open-outline" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>{t("viewPastReports")}</Text>
        </TouchableOpacity>
      </View>

      {/* Tips Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("tipsTitle")}</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>{t("seeAll")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tipsContainer}
      >
        <TipCard
          icon="water-outline"
          category="HYDRATION"
          title="Optimizing water schedule for summer soil."
          time="4 min read"
        />
        <TipCard
          icon="leaf-outline"
          category="SOIL"
          title="Best organic fertilizers for tomatoes."
          time="6 min read"
        />
      </ScrollView>

      {/* Recent Reports Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("recentReports")}</Text>
      </View>

      <View style={styles.reportsList}>
        <ReportItem
          image="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&q=80&w=200"
          title="Corn Blight (Detected)"
          time={t("analyzedAgo", { count: 2 })}
          status="warning"
        />
        <ReportItem
          image="https://images.unsplash.com/photo-1615485290382-441e4d0c9cb5?auto=format&fit=crop&q=80&w=200"
          title="Bell Pepper (Healthy)"
          time={t("analyzedAgo", { count: 5 })}
          status="healthy"
        />
      </View>

      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

function TipCard({ icon, category, title, time }: any) {
  return (
    <TouchableOpacity style={styles.tipCard} activeOpacity={0.8}>
      <View style={styles.tipTag}>
        <Ionicons name={icon} size={14} color={COLORS.primary} />
        <Text style={styles.tipTagText}>{category}</Text>
      </View>
      <Text style={styles.tipTitle}>{title}</Text>
      <View style={styles.tipFooter}>
        <Text style={styles.tipTime}>{time}</Text>
        <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
}

function ReportItem({ image, title, time, status }: any) {
  return (
    <View style={styles.reportItem}>
      <Image source={{ uri: image }} style={styles.reportImage} />
      <View style={styles.reportInfo}>
        <Text style={styles.reportTitle}>{title}</Text>
        <Text style={styles.reportTime}>{time}</Text>
      </View>
      <Ionicons
        name={status === "warning" ? "warning" : "checkmark-circle"}
        size={24}
        color={status === "warning" ? "#E57373" : "#81C784"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },
  topInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  welcomeText: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
  },
  subtitleText: {
    ...TYPOGRAPHY.body,
    marginTop: 2,
  },
  weatherWidget: {
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  weatherTemp: {
    ...TYPOGRAPHY.bodySemibold,
    fontSize: 12,
    marginTop: 2,
  },
  scanCard: {
    height: 220,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    marginBottom: SPACING.lg,
  },
  scanCardImage: {
    width: "100%",
    height: "100%",
  },
  scanCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: SPACING.lg,
    justifyContent: "flex-end",
  },
  scanIconBadge: {
    position: "absolute",
    top: SPACING.lg,
    left: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  primaryActionBadge: {
    backgroundColor: "#A5D6A7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    alignSelf: "flex-start",
    marginBottom: SPACING.sm,
  },
  primaryActionText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.textPrimary,
    fontWeight: "800",
  },
  scanTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.white,
  },
  scanDescription: {
    ...TYPOGRAPHY.body,
    color: "rgba(255,255,255,0.9)",
  },
  actionRow: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#E1E8D9",
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: "center",
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  actionText: {
    ...TYPOGRAPHY.bodySemibold,
    textAlign: "center",
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
  },
  seeAllText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.primary,
    fontWeight: "700",
  },
  tipsContainer: {
    paddingRight: SPACING.md,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  tipCard: {
    backgroundColor: "#F4F7EF",
    width: width * 0.65,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "#E5EBE0",
  },
  tipTag: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  tipTagText: {
    ...TYPOGRAPHY.tiny,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  tipTitle: {
    ...TYPOGRAPHY.bodySemibold,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  tipFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tipTime: {
    ...TYPOGRAPHY.tiny,
  },
  reportsList: {
    backgroundColor: "#F4F7EF",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  reportItem: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
  },
  reportImage: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.md,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    ...TYPOGRAPHY.bodySemibold,
  },
  reportTime: {
    ...TYPOGRAPHY.tiny,
    marginTop: 2,
  },
});
