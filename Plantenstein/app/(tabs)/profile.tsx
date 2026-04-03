import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";
import { TYPOGRAPHY } from "../../src/constants/typography";
import { Button } from "../../src/components/Button";
import { clearAuth } from "../../src/services/authStorage";
import { useRouter } from "expo-router";
import { Header } from "../../src/components/Header";
import { ProfileCard } from "../../src/components/ProfileCard";
import { MenuCard } from "../../src/components/MenuCard";
import { getUserProfile, UserProfile } from "../../src/services/api";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await getUserProfile();
        setUser(u);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      t("profilePage.logout"),
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await clearAuth();
            router.replace("/auth/email");
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Card */}
        <ProfileCard 
          name={user?.displayName || "Farmer"}
          phone={user?.phoneNumber || user?.email || ""}
          isVerified={user?.isVerified || false}
        />

        <Text style={styles.sectionTitle}>{t("profilePage.account_support")}</Text>

        {/* Menu Items */}
        <MenuCard 
          icon="history" 
          label={t("profilePage.scan_history")} 
          onPress={() => router.push("/(tabs)/history")}
        />
        
        <MenuCard 
          icon="user-md" 
          label={t("profilePage.contact_experts")} 
          onPress={() => Alert.alert("Coming Soon", "This feature is under development.")}
        />

        <MenuCard 
          icon="info-circle" 
          label={t("profilePage.about_us")} 
          onPress={() => Alert.alert("About Us", "Dr. Planteinstein v2.4.0")}
        />

        <MenuCard 
          icon="phone-alt" 
          label={t("profilePage.customer_care")} 
          onPress={() => Alert.alert("Customer Care", "Email us at support@planteinstein.com")}
        />

        {/* Logout Button */}
        <Button
          title={t("profilePage.logout")}
          variant="primary"
          icon="sign-out-alt"
          style={styles.logoutButton}
          onPress={handleLogout}
        />

        <Text style={styles.versionInfo}>{t("profilePage.version_info")}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.textSecondary,
    fontWeight: "bold",
    letterSpacing: 1.2,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    paddingLeft: SPACING.xs,
  },
  logoutButton: {
    backgroundColor: COLORS.primary, // Dark green logout
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  versionInfo: {
    ...TYPOGRAPHY.tiny,
    textAlign: "center",
    color: COLORS.inactive,
    marginTop: SPACING.lg,
  },
});
