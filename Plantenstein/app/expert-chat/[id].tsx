import React, { useState, useRef } from "react";
import { 
  View, Text, StyleSheet, ScrollView, Image, TextInput, 
  TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ExpertChatHeader } from "../../src/components/ExpertChatHeader";
import { CaseCard } from "../../src/components/CaseCard";
import { StatusCapsule } from "../../src/components/StatusCapsule";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../src/constants/theme";
import { TYPOGRAPHY } from "../../src/constants/typography";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

// Mock expert data lookup (same as selection screen)
const EXPERTS: Record<string, any> = {
  "1": {
    name: "Dr. Aranya Sen",
    specialty: "Soil Specialist",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop",
  },
  "2": {
    name: "Prof. Julian Thorne",
    specialty: "Mycology & Pathogens",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
  },
};

export default function ExpertChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const expert = EXPERTS[id] || EXPERTS["1"];
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "expert",
      content: "Hello! I've reviewed your crop scan. It looks like a typical case of nitrogen deficiency in early stage tomatoes.",
      timestamp: "10:42 AM",
    },
    {
      id: "2",
      role: "user",
      content: "Thank you, Dr. Aranya. What organic fertilizers do you recommend for this?",
      timestamp: "10:45 AM",
      status: "read",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
    };
    setMessages([...messages, newMessage]);
    setInputText("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ExpertChatHeader 
          name={expert.name} 
          specialty={expert.specialty} 
          imageUrl={expert.imageUrl} 
        />

        <ScrollView 
          ref={scrollRef}
          style={styles.chatArea} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>TODAY</Text>
          </View>

          <CaseCard 
            caseId="#TMT-2024-00" 
            subject="Early Stage Tomato Crop Scan" 
          />

          {messages.map((msg) => (
            <View key={msg.id} style={styles.messageRow}>
              {msg.role === "expert" ? (
                <View style={styles.expertBubbleWrapper}>
                  <Text style={styles.expertLabel}>{expert.name.toUpperCase()}</Text>
                  <View style={styles.expertBubble}>
                    <Text style={styles.expertText}>{msg.content}</Text>
                  </View>
                  <Text style={styles.timestampLeft}>{msg.timestamp}</Text>
                </View>
              ) : (
                <View style={styles.userBubbleWrapper}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userText}>{msg.content}</Text>
                  </View>
                  <View style={styles.statusRow}>
                    <Text style={styles.timestampRight}>{msg.timestamp}</Text>
                    <Ionicons name="checkmark-done" size={14} color="#4CAF50" style={styles.checkIcon} />
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* Diagnosis & Status Capsules */}
          <StatusCapsule 
            type="diagnosis" 
            title="Diagnosis Confirmed" 
            subtitle="Nitrogen (N) depletion in sandy loam soil." 
          />
          <StatusCapsule 
            type="hydration" 
            title="Soil Hydration" 
            subtitle="Maintain moisture at 65% for nutrient uptake." 
          />
        </ScrollView>

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachmentButton}>
            <Ionicons name="attach" size={24} color="#16552B" />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.inputField}
              placeholder="Type a message..."
              placeholderTextColor="#99AFA0"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Feather name="smile" size={20} color="#99AFA0" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.voiceButton} onPress={sendMessage}>
            <MaterialCommunityIcons name={inputText.trim() ? "send" : "microphone"} size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FDFEF8" },
  container: { flex: 1 },
  chatArea: { flex: 1 },
  scrollContent: { padding: SPACING.md, paddingBottom: 120 },

  dateSeparator: { alignSelf: "center", backgroundColor: "#EAEFE2", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  dateText: { ...TYPOGRAPHY.tiny, fontWeight: "700", color: "#78876F" },

  messageRow: { marginBottom: 20 },
  
  expertBubbleWrapper: { alignSelf: "flex-start", maxWidth: "80%" },
  expertLabel: { fontSize: 10, fontWeight: "800", color: "#78876F", marginBottom: 4, marginLeft: 12 },
  expertBubble: { backgroundColor: "#EDF2E6", padding: 16, borderRadius: 20, borderTopLeftRadius: 4 },
  expertText: { ...TYPOGRAPHY.body, color: "#3E4438", lineHeight: 22 },
  timestampLeft: { fontSize: 10, color: "#99AFA0", marginTop: 4, marginLeft: 12 },

  userBubbleWrapper: { alignSelf: "flex-end", maxWidth: "80%" },
  userBubble: { backgroundColor: "#114D23", padding: 16, borderRadius: 20, borderTopRightRadius: 4 },
  userText: { ...TYPOGRAPHY.body, color: "#E8EFE5", lineHeight: 22 },
  statusRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 4, marginRight: 12 },
  timestampRight: { fontSize: 10, color: "#99AFA0" },
  checkIcon: { marginLeft: 4 },

  inputBar: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: SPACING.md, 
    backgroundColor: "#FDFEF8",
    paddingBottom: Platform.OS === "ios" ? 10 : 20,
  },
  attachmentButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: "#E6EEE1", 
    justifyContent: "center", 
    alignItems: "center",
    marginRight: 10,
  },
  inputWrapper: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#EFF4EA", 
    borderRadius: 25, 
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  inputField: { 
    flex: 1, 
    fontSize: 15, 
    color: "#333", 
    maxHeight: 100 
  },
  emojiButton: { marginLeft: 8 },
  voiceButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: "#16552B", 
    justifyContent: "center", 
    alignItems: "center",
    ...SHADOWS.sm,
  },
});
