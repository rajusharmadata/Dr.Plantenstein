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
  Image as RNImage,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Image } from "expo-image";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../src/constants/theme";
import { TYPOGRAPHY } from "../../src/constants/typography";
import { createCommunityPost, getUserProfile, UserProfile } from "../../src/services/api";

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
      setImages([...images, ...newUris]);
    }
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
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

      await createCommunityPost(content, category, images, locationData);
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
          headerTitle: "New Post",
          headerTitleStyle: { ...TYPOGRAPHY.h3, color: COLORS.primary },
          headerRight: () => (
            <TouchableOpacity onPress={handlePost} disabled={loading}>
              <View style={styles.postButtonHeader}>
                {loading ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.postButtonText}>Post</Text>}
              </View>
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
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
              <FontAwesome5 name="user" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.white} />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName || "Guest User"}</Text>
            <Text style={styles.userSubtitle}>Farmer • Worldwide</Text>
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

        {/* Evidence Section */}
        <Text style={styles.sectionTitle}>EVIDENCE & PHOTOS</Text>
        <View style={styles.photoContainer}>
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
            <Ionicons name="location-outline" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.locationTextWrapper}>
            <Text style={styles.locationTitle}>Add your location</Text>
            <Text style={styles.locationSubtitle}>Helps experts provide local advice</Text>
          </View>
          <Switch
            value={useLocation}
            onValueChange={setUseLocation}
            trackColor={{ false: COLORS.background, true: COLORS.primary }}
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
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  postButtonHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    minWidth: 70,
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
    width: 60,
    height: 60,
    position: "relative",
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  badge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    marginLeft: SPACING.md,
  },
  userName: {
    ...TYPOGRAPHY.h3,
    fontSize: 18,
    color: "#333",
  },
  userSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.inactive,
  },
  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    minHeight: 150,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.background,
    ...SHADOWS.sm,
  },
  textInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: "#333",
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    letterSpacing: 1,
    color: COLORS.inactive,
    marginBottom: SPACING.md,
  },
  photoContainer: {
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
    backgroundColor: COLORS.background + "20",
  },
  addPhotoText: {
    marginTop: SPACING.xs,
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  photoScroll: {
    marginLeft: SPACING.sm,
  },
  imagePreviewWrapper: {
    width: 140,
    height: 140,
    borderRadius: RADIUS.lg,
    marginLeft: SPACING.sm,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: 140,
    height: 140,
  },
  removeImageBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
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
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    marginLeft: SPACING.xs,
    fontWeight: "600",
    color: COLORS.primary,
    fontSize: 14,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background + "40",
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.background,
  },
  locationIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },
  locationTextWrapper: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  locationTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: "700",
    color: "#333",
  },
  locationSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.inactive,
  },
});
