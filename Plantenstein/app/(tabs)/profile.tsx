import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../../src/constants/theme";
import { TYPOGRAPHY } from "../../src/constants/typography";
import { Button } from "../../src/components/Button";
import { clearAuth, getAuthUser, StoredUser } from "../../src/services/authStorage";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    (async () => {
      const u = await getAuthUser();
      setUser(u);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      <Text style={styles.subtitle}>
        {user ? `${user.email} • @${user.username} • ${user.displayName}` : "Loading user..." }
      </Text>

      <View style={{ height: SPACING.lg }} />

      <Button
        title="Logout"
        variant="secondary"
        icon="sign-out-alt"
        onPress={async () => {
          await clearAuth();
            router.replace("/auth/email");
        }}
      />
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
