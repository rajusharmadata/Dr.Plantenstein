import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { COLORS, RADIUS, SPACING } from "../constants/theme";
import { TYPOGRAPHY } from "../constants/typography";
import { FontAwesome5 } from "@expo/vector-icons";
import { Badge } from "./Badge";

interface ProfileCardProps {
  name: string;
  phone: string;
  isVerified: boolean;
  avatarUrl?: string;
  onEditPress?: () => void;
}

export function ProfileCard({
  name,
  phone,
  isVerified,
  avatarUrl,
  onEditPress,
}: ProfileCardProps) {
  // Use a default placeholder avatar if none provided
  const avatarSource = avatarUrl
    ? { uri: avatarUrl }
    : { uri: "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=1C6B38&color=fff" };

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <Image source={avatarSource} style={styles.avatar} />
        <TouchableOpacity style={styles.editButton} activeOpacity={0.7} onPress={onEditPress}>
          <FontAwesome5 name="pencil-alt" size={12} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoWrapper}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.phone}>{phone}</Text>
        <View style={styles.badgeWrapper}>
          <Badge 
            type="healthy" 
            text="Verified Farmer" 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginVertical: SPACING.md,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: SPACING.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  editButton: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  infoWrapper: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  phone: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  badgeWrapper: {
    flexDirection: "row",
  },
});
