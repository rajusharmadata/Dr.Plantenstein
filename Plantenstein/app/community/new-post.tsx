import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Image } from "expo-image";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../src/constants/theme";
import { TYPOGRAPHY } from "../../src/constants/typography";
import { createCommunityPost, getUserProfile, UserProfile, analyzeLeaf, AnalysisResult } from "../../src/services/api";

type Category = "Cereals" | "Vegetables" | "Fruits" | "Other";

export default function NewPostScreen() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [category, setCategory] = useState<Category>("Cereals");
  const [useLocation, setUseLocation] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  
  // AI Diagnosis State
  const [diagnosis, setDiagnosis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setFetchingUser(false);
      }
    })();
  }, []);

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit Reached", "You can upload up to 5 photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      const updatedImages = [...images, ...newUris];
      setImages(updatedImages);

      // Trigger AI Analysis automatically on first image if not already diagnosed
      if (!diagnosis && updatedImages.length > 0) {
        handleAnalysis(updatedImages[0]);
      }
    }
  };

  const handleAnalysis = async (uri: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeLeaf(uri);
      setDiagnosis(result);
      // Auto-set category based on diagnosis if possible
      if (result.cropName.toLowerCase().includes("cereal") || result.cropName.toLowerCase().includes("wheat") || result.cropName.toLowerCase().includes("rice")) {
        setCategory("Cereals");
      }
    } catch (error) {
      console.warn("Auto-analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
    if (updated.length === 0) setDiagnosis(null);
  };

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please describe what is happening with your crop.");
      return;
    }

    setLoading(true);
    try {
      let locationData = undefined;
      if (useLocation) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({});
          locationData = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
        }
      }

      const diagData = diagnosis ? { 
        title: diagnosis.title, 
        status: diagnosis.status, 
        confidence: diagnosis.confidence 
      } : undefined;

      await createCommunityPost(content, category, images, locationData, diagData);
      Alert.alert("Success", "Post shared with the community!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Failed", error.message || "Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  const categories: { label: Category; icon: string }[] = [
    { label: "Cereals", icon: "seedling" },
    { label: "Vegetables", icon: "leaf" },
    { label: "Fruits", icon: "apple-alt" },
    { label: "Other", icon: "plus" },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true, // IMPORTANT: Fix for missing header buttons
          headerTitle: "New Post",
          headerTitleStyle: { ...TYPOGRAPHY.h3, color: COLORS.primary },
          headerRight: () => (
            <TouchableOpacity onPress={handlePost} disabled={loading} style={styles.postButtonHeader}>
              {loading ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.postButtonText}>Post</Text>}
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
          headerShadowVisible: false,
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarPlaceholder}>
              <FontAwesome5 name="user-alt" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.white} />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName || "Samuel Okoro"}</Text>
            <Text style={styles.userSubtitle}>Cereal Farmer • Nigeria</Text>
          </View>
        </View>

        {/* Symptoms Input */}
        <View style={styles.inputCard}>
          <TextInput
            placeholder="What is happening with your crop? Describe the symptoms..."
            placeholderTextColor={COLORS.inactive}
            multiline
            style={styles.textInput}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </View>

        {/* AI Diagnosis Card (Integrated Model) */}
        {(isAnalyzing || diagnosis) && (
          <View style={[styles.diagnosisCard, diagnosis?.status === 'healthy' ? styles.diagSuccess : styles.diagWarning]}>
            <View style={styles.diagHeader}>
              <FontAwesome5 
                name={isAnalyzing ? "sync" : "robot"} 
                size={16} 
                color={diagnosis?.status === 'healthy' ? COLORS.healthyText : COLORS.warningText} 
              />
              <Text style={[styles.diagTitle, { color: diagnosis?.status === 'healthy' ? COLORS.healthyText : COLORS.warningText }]}>
                {isAnalyzing ? "Analyzing Symptoms..." : "AI Diagnosis Result"}
              </Text>
            </View>
            {isAnalyzing ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <View>
                <Text style={styles.diagResult}>{diagnosis?.title}</Text>
              </View>
            )}
          </View>
        )}

        {/* Evidence Section */}
        <Text style={styles.sectionTitle}>EVIDENCE & PHOTOS</Text>
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
            <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
            <Text style={styles.addPhotoText}>Add Photos</Text>
          </TouchableOpacity>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imagePreviewWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} contentFit="cover" />
                <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(idx)}>
                  <Ionicons name="close" size={14} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Crop Category */}
        <Text style={styles.sectionTitle}>CROP CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => setCategory(item.label)}
              style={[
                styles.categoryChip,
                category === item.label && styles.categoryChipActive,
              ]}
            >
              <FontAwesome5
                name={item.icon}
                size={14}
                color={category === item.label ? COLORS.white : COLORS.primary}
              />
              <Text
                style={[
                  styles.categoryText,
                  category === item.label && styles.categoryTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location Toggle */}
        <View style={styles.locationCard}>
          <View style={styles.locationIconWrapper}>
            <Ionicons name="location-sharp" size={20} color={COLORS.primary} />
          </View>
          <View style={styles.locationTextWrapper}>
            <Text style={styles.locationTitle}>Add your location</Text>
            <Text style={styles.locationSubtitle}>Helps experts provide local advice</Text>
          </View>
          <Switch
            value={useLocation}
            onValueChange={setUseLocation}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Cream background from screenshot
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  backButton: {
    paddingRight: SPACING.md,
  },
  postButtonHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    minWidth: 80,
    alignItems: "center",
  },
  postButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    position: "relative",
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E1E8D9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  badge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userInfo: {
    marginLeft: SPACING.md,
  },
  userName: {
    ...TYPOGRAPHY.h3,
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  userSubtitle: {
    ...TYPOGRAPHY.caption,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    minHeight: 180,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  textInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  diagnosisCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  diagSuccess: {
    backgroundColor: COLORS.healthyBg,
    borderColor: COLORS.success,
  },
  diagWarning: {
    backgroundColor: COLORS.warningBg,
    borderColor: COLORS.warningText + '40',
  },
  diagHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  diagTitle: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  diagResult: {
    ...TYPOGRAPHY.bodySemibold,
    fontSize: 16,
    marginTop: SPACING.xs,
  },
  diagConfidence: {
    ...TYPOGRAPHY.tiny,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  photoSection: {
    flexDirection: "row",
    marginBottom: SPACING.xl,
  },
  addPhotoButton: {
    width: 140,
    height: 140,
    borderRadius: RADIUS.lg,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  addPhotoText: {
    marginTop: SPACING.xs,
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  photoScroll: {
    marginLeft: SPACING.md,
  },
  imagePreviewWrapper: {
    width: 140,
    height: 140,
    borderRadius: RADIUS.lg,
    marginRight: SPACING.md,
    overflow: "hidden",
    position: "relative",
    ...SHADOWS.sm,
  },
  imagePreview: {
    width: 140,
    height: 140,
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8EFE8",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    marginLeft: SPACING.xs,
    fontWeight: "700",
    color: COLORS.primary,
    fontSize: 14,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.sm,
  },
  locationIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  locationTextWrapper: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  locationTitle: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  locationSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});
