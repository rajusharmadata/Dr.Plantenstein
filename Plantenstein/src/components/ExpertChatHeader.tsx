import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from "react-native";
import { COLORS, SPACING, RADIUS } from "../constants/theme";
import { TYPOGRAPHY } from "../constants/typography";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface ExpertChatHeaderProps {
  name: string;
  specialty: string;
  imageUrl: string;
  online?: boolean;
}

export function ExpertChatHeader({ name, specialty, imageUrl, online = true }: ExpertChatHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A2016" />
        </TouchableOpacity>

        <View style={styles.expertInfo}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: imageUrl }} style={styles.avatar} />
            {online && <View style={styles.onlineDot} />}
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.specialty}>{specialty.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionIcon}>
            <Ionicons name="call-outline" size={22} color="#1A2016" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIcon}>
            <Feather name="more-vertical" size={22} color="#1A2016" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FDFEF8",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEFE2",
    paddingTop: 50,
    paddingBottom: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    marginRight: 12,
  },
  expertInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#DCE5C5",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#FDFEF8",
  },
  textContainer: {
    marginLeft: 12,
  },
  name: {
    ...TYPOGRAPHY.body,
    fontWeight: "bold",
    color: "#16552B",
    fontSize: 16,
  },
  specialty: {
    fontSize: 10,
    fontWeight: "700",
    color: "#78876F",
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    marginLeft: 20,
  },
});
