import React, { useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";

import { Button } from "../../src/components/Button";
import { Card } from "../../src/components/Card";
import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import { TYPOGRAPHY } from "../../src/constants/typography";
import { clearAuth, saveAuthToken, saveAuthUser, type StoredUser } from "../../src/services/authStorage";

type Step = "enterEmail" | "enterOtp" | "completeProfile";

type VerifyOtpResponse =
  | {
      success: true;
      profileComplete: true;
      token: string;
      user: StoredUser;
    }
  | {
      success: true;
      profileComplete: false;
      otpSessionToken: string;
      user: StoredUser;
    };

export default function EmailAuthScreen() {
  const router = useRouter();

  const API_BASE_URL = useMemo(() => {
    const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
    return String(extra.API_BASE_URL ?? "");
  }, []);

  const [step, setStep] = useState<Step>("enterEmail");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSessionToken, setOtpSessionToken] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!API_BASE_URL) throw new Error("Missing API_BASE_URL in app.json extra.");

      const normalizedEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new Error("Enter a valid email address.");
      }

      const response = await fetch(`${API_BASE_URL}/auth/email/send-otp`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const json = await response.json();
      if (!json.success) throw new Error(json.message || "Failed to send OTP.");

      setStep("enterOtp");
      setOtp("");
      setOtpSessionToken(null);
    } catch (e: any) {
      setError(e?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!API_BASE_URL) throw new Error("Missing API_BASE_URL in app.json extra.");

      const normalizedEmail = email.trim().toLowerCase();
      const otpTrimmed = otp.trim();
      if (!normalizedEmail) throw new Error("Enter your email first.");
      if (!/^\d{6}$/.test(otpTrimmed)) throw new Error("OTP must be 6 digits.");

      const response = await fetch(`${API_BASE_URL}/auth/email/verify-otp`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, otp: otpTrimmed }),
      });

      const json = (await response.json()) as VerifyOtpResponse & { success?: boolean };
      if (!json.success) throw new Error((json as any).message || "OTP verification failed.");

      if (json.profileComplete) {
        await saveAuthToken(json.token);
        await saveAuthUser(json.user);
        router.replace("/(tabs)/scan");
        return;
      }

      setOtpSessionToken(json.otpSessionToken);
      setStep("completeProfile");
    } catch (e: any) {
      setError(e?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!API_BASE_URL) throw new Error("Missing API_BASE_URL in app.json extra.");
      if (!otpSessionToken) throw new Error("OTP session missing. Please verify OTP again.");

      const dn = displayName.trim();
      const un = username.trim();
      if (!dn) throw new Error("Enter your name.");
      if (!un) throw new Error("Enter a username.");
      if (un.length < 3) throw new Error("Username must be at least 3 characters.");

      const response = await fetch(`${API_BASE_URL}/auth/email/complete-profile`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${otpSessionToken}`,
        },
        body: JSON.stringify({ displayName: dn, username: un }),
      });

      const json = await response.json();
      if (!json.success) throw new Error(json.message || "Failed to complete profile.");

      await saveAuthToken(json.token);
      await saveAuthUser(json.user);
      router.replace("/(tabs)/scan");
    } catch (e: any) {
      setError(e?.message || "Failed to complete profile.");
    } finally {
      setLoading(false);
    }
  };

  const onReset = async () => {
    await clearAuth();
    setStep("enterEmail");
    setEmail("");
    setOtp("");
    setOtpSessionToken(null);
    setDisplayName("");
    setUsername("");
    setError(null);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.topBrand}>
        <View style={styles.brandRow}>
          <FontAwesome5 name="leaf" size={24} color={COLORS.primary} />
          <Text style={styles.brandTitle}>Dr. Planteinstein</Text>
        </View>
        <Text style={styles.brandSubtitle}>SCAN · DETECT · CURE</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.title}>
          {step === "enterEmail" ? "Sign in with Email" : step === "enterOtp" ? "Verify OTP" : "Complete Profile"}
        </Text>

        {step === "enterEmail" && (
          <>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <View style={{ height: SPACING.md }} />

            <Button
              title={loading ? "Sending..." : "Send OTP"}
              onPress={() => void sendOtp()}
              disabled={loading}
              variant="primary"
            />
          </>
        )}

        {step === "enterOtp" && (
          <>
            <Text style={styles.label}>OTP (6 digits)</Text>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              style={styles.input}
              placeholder="123456"
              keyboardType="number-pad"
            />

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <View style={{ height: SPACING.md }} />

            <Button
              title={loading ? "Verifying..." : "Verify OTP"}
              onPress={() => void verifyOtp()}
              disabled={loading}
              variant="primary"
            />

            <TouchableOpacity
              onPress={() => {
                if (!loading) {
                  setStep("enterEmail");
                  setOtp("");
                  setError(null);
                }
              }}
              style={styles.linkRow}
              disabled={loading}
            >
              <Text style={styles.linkText}>Edit email</Text>
            </TouchableOpacity>
          </>
        )}

        {step === "completeProfile" && (
          <>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              style={styles.input}
              placeholder="John Doe"
              autoCapitalize="words"
            />

            <Text style={[styles.label, { marginTop: SPACING.sm }]}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              placeholder="john"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <View style={{ height: SPACING.md }} />

            <Button
              title={loading ? "Saving..." : "Finish"}
              onPress={() => void completeProfile()}
              disabled={loading}
              variant="primary"
            />
          </>
        )}

        <TouchableOpacity onPress={() => void onReset()} disabled={loading} style={styles.resetRow}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </Card>

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={COLORS.primary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    justifyContent: "center",
  },
  topBrand: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  brandTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontWeight: "800",
  },
  brandSubtitle: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginTop: SPACING.xs,
  },
  card: {
    marginBottom: 10,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.warningText,
    ...TYPOGRAPHY.small,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  linkRow: {
    marginTop: SPACING.sm,
    alignItems: "center",
  },
  linkText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.primary,
    textDecorationLine: "underline",
    fontWeight: "700",
  },
  resetRow: {
    marginTop: SPACING.lg,
    alignItems: "center",
  },
  resetText: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.inactive,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
});

