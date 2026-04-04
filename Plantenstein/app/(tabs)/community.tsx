import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Share,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../src/constants/theme";
import { TYPOGRAPHY } from "../../src/constants/typography";
import { getCommunityPosts, CommunityPost, formatImageUrl, togglePostLike, getUserProfile, UserProfile } from "../../src/services/api";

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?q=80&w=1000&auto=format&fit=crop";

export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

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

  const fetchUser = async () => {
    try {
      const profile = await getUserProfile();
      setCurrentUser(profile);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUser();
      fetchPosts();
    }, [selectedCategory])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const categories = ["All", "Cereals", "Vegetables", "Fruits"];

  const handleLike = async (postId: string) => {
    if (!currentUser?.id) {
      console.log("[ToggleLike] No user ID available. Fetching profile...");
      await fetchUser();
      if (!currentUser?.id) return;
    }

    const userId = currentUser.id;

    // Optimistic Update
    setPosts(prevPosts => prevPosts.map(post => {
      if (post._id === postId) {
        const isLiked = post.likes.some(id => id.toString() === userId.toString());
        const newLikes = isLiked 
          ? post.likes.filter(id => id.toString() !== userId.toString())
          : [...post.likes, userId];
        return { ...post, likes: newLikes };
      }
      return post;
    }));

    try {
      await togglePostLike(postId);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert on error
      fetchPosts();
    }
  };

  const handleShare = async (post: CommunityPost) => {
    try {
      const result = await Share.share({
        message: `${post.content}\n\nShared via Dr. Planteinstein`,
        url: post.images[0] ? formatImageUrl(post.images[0]) : undefined,
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleComment = (postId: string) => {
    // Navigate to post details (future implementation or simple alert for now)
    Alert.alert("Comments", "Comment section coming soon in the next update!");
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.logoRow}>
          <FontAwesome5 name="leaf" size={18} color="#2D5A27" />
          <Text style={styles.logoText}>Dr. Planteinstein</Text>
        </View>
        <TouchableOpacity style={styles.langToggle}>
          <Text style={styles.langText}>HI/EN</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Farmer's Guild</Text>
      <Text style={styles.subtitle}>Join 2,400+ growers sharing insights today.</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[
              styles.catChip,
              selectedCategory === cat && styles.catChipActive,
            ]}
          >
            <Text style={[
              styles.catText,
              selectedCategory === cat && styles.catTextActive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPost = ({ item }: { item: CommunityPost }) => {
    const isLiked = item.likes.some(id => id.toString() === (currentUser?.id || "").toString());

    // Type 2: Popular Scan Analysis
    if (item.type === "scan_analysis" || item.diagnosis) {
      return (
        <View style={styles.scanCard}>
          <View style={styles.scanHeader}>
             <Ionicons name="scan-outline" size={16} color="#4A6148" />
             <Text style={styles.scanHeaderText}>POPULAR SCAN ANALYSIS</Text>
          </View>
          
          <View style={styles.scanBody}>
            <View style={styles.scanMainRow}>
               <Image 
                 source={{ uri: formatImageUrl(item.images[0] || PLACEHOLDER_IMAGE) }} 
                 style={styles.scanImageSmall} 
                 contentFit="cover"
               />
               <View style={styles.scanInfoText}>
                  <Text style={styles.scanTitle}>{item.diagnosis?.title || "Crop Disease"}</Text>
                  <View style={styles.alertBadge}>
                     <MaterialCommunityIcons name="alert-outline" size={12} color="#D32F2F" />
                     <Text style={styles.alertText}>HIGH ALERT</Text>
                  </View>
               </View>
            </View>

            <View style={styles.remedyBox}>
               <Text style={styles.boxLabel}>RECOMMENDED REMEDY</Text>
               <Text style={styles.boxContent}>
                 {item.remedy || "Apply a copper-based fungicide or a mixture of baking soda and water to affected leaves immediately."}
               </Text>
            </View>

            <View style={styles.precautionBox}>
               <Text style={styles.boxLabelBrown}>FUTURE PRECAUTION</Text>
               <Text style={styles.boxContent}>
                 {item.precaution || "Ensure adequate spacing between plants for airflow and avoid overhead watering to keep foliage dry."}
               </Text>
            </View>

            <View style={styles.postFooter}>
               <View style={styles.socialRow}>
                 <TouchableOpacity style={styles.socialBtn} onPress={() => handleLike(item._id)}>
                   <Ionicons 
                    name={isLiked ? "heart" : "heart-outline"} 
                    size={18} 
                    color={isLiked ? "#D32F2F" : "#666"} 
                   />
                   <Text style={[styles.socialCount, isLiked && { color: "#D32F2F" }]}>{item.likes.length}</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.socialBtn} onPress={() => handleComment(item._id)}>
                   <Ionicons name="chatbubble-outline" size={18} color="#666" />
                   <Text style={styles.socialCount}>{item.comments.length}</Text>
                 </TouchableOpacity>
               </View>
               <TouchableOpacity onPress={() => handleShare(item)}>
                 <Ionicons name="share-social-outline" size={18} color="#666" />
               </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // Type 3: Community Question
    if (item.type === "question") {
      return (
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
             <View style={styles.questionIconWrapper}>
                <MaterialCommunityIcons name="comment-question-outline" size={18} color="#FFF" />
             </View>
             <Text style={styles.questionHeaderText}>Community Question</Text>
          </View>
          <Text style={styles.questionText}>
            {item.content || "What's the best time to prune guava trees for maximum yield in tropical climates? 🌳"}
          </Text>
          <View style={styles.questionFooter}>
             <Text style={styles.askedBy}>ASKED BY {item.authorRole || "FARMERS GROUP"}</Text>
             <TouchableOpacity style={styles.answerBtn} onPress={() => handleComment(item._id)}>
                <Text style={styles.answerBtnText}>Answer</Text>
             </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Type 1: Standard Post
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: "https://i.pravatar.cc/100?u=" + (item.userId?._id || item._id) }} 
              style={styles.avatarImage} 
            />
          </View>
          <View style={styles.postHeaderTextWrapper}>
            <Text style={styles.posterName}>{item.userId?.displayName || "Farmer"}</Text>
            <Text style={styles.postTime}>6h ago</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {item.images.length > 0 && (
          <Image
            source={{ uri: formatImageUrl(item.images[0]) }}
            style={styles.mainPostImage}
            contentFit="cover"
          />
        )}

        <View style={styles.postFooter}>
           <View style={styles.socialRow}>
             <TouchableOpacity style={styles.socialBtn} onPress={() => handleLike(item._id)}>
               <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={isLiked ? "#D32F2F" : "#666"} 
               />
               <Text style={[styles.socialCount, isLiked && { color: "#D32F2F" }]}>{item.likes?.length || 0}</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.socialBtn} onPress={() => handleComment(item._id)}>
               <Ionicons name="chatbubble-outline" size={18} color="#666" />
               <Text style={styles.socialCount}>{item.comments?.length || 0}</Text>
             </TouchableOpacity>
           </View>
           <TouchableOpacity onPress={() => handleShare(item)}>
             <Ionicons name="share-social-outline" size={20} color="#666" />
           </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        ListHeaderComponent={renderHeader}
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyFeed}>
              <Text style={styles.emptyText}>Feed is quiet today...</Text>
            </View>
          )
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push("/community/new-post")}
      >
        <MaterialCommunityIcons name="message-text-outline" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9F4", // Light cream/greenish background
  },
  header: {
    padding: SPACING.md,
    backgroundColor: "#F8F9F4",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D5A27",
    marginLeft: 6,
  },
  langToggle: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  langText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 28,
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  categoryScroll: {
    marginHorizontal: -SPACING.md,
    marginTop: SPACING.md,
  },
  categoryContent: {
    paddingHorizontal: SPACING.md,
  },
  catChip: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: "#EFF2E7",
    marginRight: 10,
  },
  catChipActive: {
    backgroundColor: "#2D5A27",
  },
  catText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5D48",
  },
  catTextActive: {
    color: "#FFF",
  },
  listContent: {
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: "#FFF",
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: 20,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEE",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  postHeaderTextWrapper: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  posterName: {
    fontWeight: "800",
    fontSize: 15,
    color: "#1A1A1A",
  },
  postTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 1,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: SPACING.md,
  },
  mainPostImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: SPACING.md,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  socialRow: {
    flexDirection: "row",
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  socialCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  
  // Scan Analysis Card
  scanCard: {
    backgroundColor: "#FFF",
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: 20,
    overflow: "hidden",
    ...SHADOWS.sm,
  },
  scanHeader: {
    backgroundColor: "#EBF0E9",
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  scanHeaderText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4A6148",
    letterSpacing: 1,
    marginLeft: 6,
  },
  scanBody: {
    padding: SPACING.md,
  },
  scanMainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  scanImageSmall: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
  },
  scanInfoText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCE4E4",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  alertText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#D32F2F",
    marginLeft: 4,
  },
  remedyBox: {
    backgroundColor: "#F4F7EF",
    borderLeftWidth: 4,
    borderLeftColor: "#2D5827",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  precautionBox: {
    backgroundColor: "#F4F7EF",
    borderLeftWidth: 4,
    borderLeftColor: "#7D6B5A",
    padding: 12,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2D5827",
    marginBottom: 4,
  },
  boxLabelBrown: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7D6B5A",
    marginBottom: 4,
  },
  boxContent: {
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },

  // Question Card
  questionCard: {
    backgroundColor: "#8E7A6B", // Muted brown from screenshot
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: 24,
    padding: SPACING.xl,
    ...SHADOWS.md,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  questionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  questionHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
    marginLeft: 10,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: "#FFF",
    fontWeight: "500",
    marginBottom: SPACING.xl,
  },
  questionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  askedBy: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
  },
  answerBtn: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
  },
  answerBtnText: {
    color: "#8E7A6B",
    fontWeight: "800",
    fontSize: 12,
  },
  
  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "#2D5A27",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
    elevation: 5,
  },
  emptyFeed: {
    padding: 100,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});
