import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../src/constants/theme";
import { TYPOGRAPHY } from "../../src/constants/typography";
import { getCommunityPosts, CommunityPost, formatImageUrl } from "../../src/services/api";

const safeShadows = SHADOWS || { sm: {}, md: {} };

export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchPosts = async () => {
    try {
      const data = await getCommunityPosts(selectedCategory);
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [selectedCategory])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const categories = ["All", "Cereals", "Vegetables", "Fruits", "Other"];

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.avatarMini}>
          <FontAwesome5 name="user" size={14} color={COLORS.primary} />
        </View>
        <View style={styles.postHeaderText}>
          <Text style={styles.posterName}>{item.userId?.displayName || "Anonymous"}</Text>
          <Text style={styles.postDate}>
            {new Date(item.createdAt).toLocaleDateString()} • {item.category}
          </Text>
        </View>
        {item.location && (
          <View style={styles.locationTag}>
            <Ionicons name="location" size={12} color={COLORS.primary} />
          </View>
        )}
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{item.content}</Text>

      {/* Post Images */}
      {item.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {item.images.map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: formatImageUrl(img) }}
              style={styles.postImage}
              contentFit="cover"
            />
          ))}
        </ScrollView>
      )}

      {/* Interactions */}
      <View style={styles.postFooter}>
        <TouchableOpacity style={styles.footerBtn}>
          <Ionicons name="heart-outline" size={20} color={COLORS.inactive} />
          <Text style={styles.footerBtnText}>{item.likes.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtn}>
          <Ionicons name="chatbubble-outline" size={18} color={COLORS.inactive} />
          <Text style={styles.footerBtnText}>{item.comments.length}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <View style={styles.categoryBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          contentContainerStyle={{ paddingHorizontal: SPACING.md }}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              style={[
                styles.filterChip,
                selectedCategory === item && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Feed...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.feedScroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyFeed}>
              <FontAwesome5 name="users" size={40} color={COLORS.background} />
              <Text style={styles.emptyTitle}>No Posts Yet</Text>
              <Text style={styles.emptySubtitle}>Be the first to share an update with the community!</Text>
            </View>
          }
        />
      )}

      {/* FAB - Create Post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/community/new-post")}
      >
        <Ionicons name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

// Community Feed Styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    ...TYPOGRAPHY.caption,
    color: COLORS.inactive,
  },
  categoryBar: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontWeight: "600",
    color: COLORS.inactive,
    fontSize: 13,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  feedScroll: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...safeShadows.sm,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  postHeaderText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  posterName: {
    fontWeight: "700",
    color: "#333",
    fontSize: 14,
  },
  postDate: {
    fontSize: 11,
    color: COLORS.inactive,
  },
  locationTag: {
    padding: 4,
  },
  postContent: {
    ...TYPOGRAPHY.body,
    color: "#444",
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  imageScroll: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  postImage: {
    width: 250,
    height: 160,
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm,
  },
  postFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    paddingTop: SPACING.sm,
  },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.xl,
  },
  footerBtnText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.inactive,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },
  emptyFeed: {
    paddingTop: 100,
    alignItems: "center",
    opacity: 0.5,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.caption,
    textAlign: "center",
    paddingHorizontal: 40,
    marginTop: SPACING.xs,
  },
});
