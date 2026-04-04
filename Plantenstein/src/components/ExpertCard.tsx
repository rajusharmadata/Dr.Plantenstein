import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../constants/theme";
import { TYPOGRAPHY } from "../constants/typography";
import { Ionicons } from "@expo/vector-icons";

interface ExpertCardProps {
  name: string;
  specialty: string;
  description: string;
  imageUrl: string;
  location?: string;
  rating?: number;
  experience?: string;
  selected?: boolean;
  onSelect: () => void;
}

export function ExpertCard({ name, specialty, description, imageUrl, location, rating, experience, selected, onSelect }: ExpertCardProps) {
  return (
    <TouchableOpacity 
      onPress={onSelect} 
      style={[styles.container, selected && styles.selectedContainer]}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.statusDot} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.specialty}>{specialty.toUpperCase()}</Text>
          </View>
          {selected && (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedText}>SELECTED</Text>
            </View>
          )}
        </View>

        {/* Location & Rating Row */}
        <View style={styles.metaRow}>
          {location && (
            <View style={styles.metaChip}>
              <Ionicons name="location-sharp" size={11} color="#4A6148" />
              <Text style={styles.metaText}>{location}</Text>
            </View>
          )}
          {rating && (
            <View style={styles.metaChip}>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text style={styles.metaText}>{rating.toFixed(1)}</Text>
            </View>
          )}
          {experience && (
            <View style={styles.metaChip}>
              <Ionicons name="briefcase-outline" size={11} color="#4A6148" />
              <Text style={styles.metaText}>{experience}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F8FBF5",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedContainer: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFF",
    ...SHADOWS.sm,
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  name: {
    ...TYPOGRAPHY.body,
    fontWeight: "bold",
    color: "#1A2016",
    fontSize: 16,
  },
  specialty: {
    fontSize: 10,
    fontWeight: "800",
    color: "#4A6148",
    letterSpacing: 0.5,
  },
  selectedBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectedText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: "900",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
    marginBottom: 6,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF4EB",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  metaText: {
    fontSize: 10,
    color: "#4A6148",
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
});
