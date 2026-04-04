import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "../src/components/Header";
import { ExpertCard } from "../src/components/ExpertCard";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../src/constants/theme";
import { TYPOGRAPHY } from "../src/constants/typography";
import { Ionicons } from "@expo/vector-icons";

// Expert data with Indian city locations, ratings, and experience
const EXPERTS = [
  {
    id: "1",
    name: "Dr. Aranya Sen",
    specialty: "Soil Specialist",
    location: "Kolkata, WB",
    rating: 4.9,
    experience: "15 yrs",
    description: "Expert in organic pest control and soil health management with 15+ years in sustainable agriculture across Eastern India.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Prof. Vikram Nair",
    specialty: "Mycology & Pathogens",
    location: "Pune, MH",
    rating: 4.8,
    experience: "12 yrs",
    description: "Specializing in fungal disease identification for tropical crops. Advisor to Maharashtra Agricultural University.",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Dr. Priya Sharma",
    specialty: "Hydroponic Engineer",
    location: "Bengaluru, KA",
    rating: 4.7,
    experience: "10 yrs",
    description: "Pioneer in vertical farming and automated irrigation systems. Works with tech-driven agriculture startups in Bangalore.",
    imageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Rajesh Patel",
    specialty: "Pest Management",
    location: "Ahmedabad, GJ",
    rating: 4.6,
    experience: "18 yrs",
    description: "Specialist in biological pest control for cotton and groundnut crops across Gujarat and Rajasthan.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "5",
    name: "Dr. Sunita Reddy",
    specialty: "Rice & Paddy Expert",
    location: "Hyderabad, TS",
    rating: 4.9,
    experience: "20 yrs",
    description: "Leading researcher in rice blast and brown plant hopper management. Adviser to Telangana state government.",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "6",
    name: "Dr. Harpreet Singh",
    specialty: "Wheat & Cereal Crops",
    location: "Ludhiana, PB",
    rating: 4.8,
    experience: "22 yrs",
    description: "Punjab Agricultural University faculty. Expert in wheat rust prevention and crop rotation strategies for North India.",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
  },
];

export default function ExpertSelectionScreen() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("1");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header showBackButton title="Our Agricultural Experts" showLanguageToggle={false} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerTextSection}>
          <Text style={styles.sublabel}>THE DIGITAL AGRONOMIST</Text>
          <Text style={styles.mainTitle}>World-class insights,{"\n"}delivered naturally.</Text>
          <Text style={styles.subtitle}>
            Select a specialist to begin a tailored consultation for your crops. Each expert brings years of field-tested experience to your screen.
          </Text>
        </View>

        <View style={styles.expertList}>
          {EXPERTS.map((expert) => (
            <ExpertCard
              key={expert.id}
              name={expert.name}
              specialty={expert.specialty}
              description={expert.description}
              imageUrl={expert.imageUrl}
              location={expert.location}
              rating={expert.rating}
              experience={expert.experience}
              selected={selectedId === expert.id}
              onSelect={() => setSelectedId(expert.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Persistent Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.startBtn} 
          onPress={() => router.push(`/expert-chat/${selectedId}`)} 
          activeOpacity={0.9}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
          <Text style={styles.startBtnText}>Start Chat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFEF8" },
  scrollContent: { padding: SPACING.md, paddingBottom: 120 },
  
  headerTextSection: { marginBottom: SPACING.xl },
  sublabel: { 
    fontSize: 12, 
    fontWeight: "700", 
    color: "#78876F", 
    letterSpacing: 0.5, 
    marginBottom: 8 
  },
  mainTitle: { 
    ...TYPOGRAPHY.h1, 
    fontSize: 32, 
    color: "#1A2016", 
    lineHeight: 38,
    marginBottom: SPACING.md
  },
  subtitle: { 
    ...TYPOGRAPHY.body, 
    color: "#526D57", 
    lineHeight: 22,
    fontSize: 15
  },

  expertList: { marginTop: SPACING.md },

  bottomBar: { 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: "#FDFEF8", 
    padding: SPACING.md,
    paddingBottom: 30
  },
  startBtn: { 
    backgroundColor: "#16552B", 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18, 
    borderRadius: RADIUS.md,
    ...SHADOWS.md
  },
  startBtnText: { 
    color: "#FFF", 
    fontWeight: "bold", 
    fontSize: 16,
    marginLeft: 10
  },
});
