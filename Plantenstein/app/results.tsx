import React, { useEffect, useState, useRef } from "react";
import { 
  View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, 
  TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Animated
} from "react-native";
import { COLORS, RADIUS, SPACING, SHADOWS } from "../src/constants/theme";
import { TYPOGRAPHY } from "../src/constants/typography";
import { Badge } from "../src/components/Badge";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Header } from "../src/components/Header";
import { getRecordById, sendChatMessage, sendVoiceChat, AnalysisResult, formatImageUrl } from "../src/services/api";
import type { BadgeType } from "../src/components/Badge";

// Voice imports
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

export default function ResultsScreen() {
  const router = useRouter();
  const { id, uri } = useLocalSearchParams<{ id?: string; uri?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [record, setRecord] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Chat State
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Voice State
  const [recordingObject, setRecordingObject] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("No analysis result ID provided.");
      setLoading(false);
      return;
    }
    fetchRecord();

    return () => {
       if (recordingObject) {
         recordingObject.stopAndUnloadAsync().catch(() => {});
       }
    };
  }, [id]);

  const fetchRecord = async () => {
    try {
      const data = await getRecordById(id!);
      setRecord(data);
    } catch (err: any) {
      setError(err.message || "Failed to load result.");
    } finally {
      setLoading(false);
    }
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
      ])
    ).start();
  };

  const startRecording = async () => {
    if (isRecording || recordingObject) return;

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecordingObject(recording);
      setIsRecording(true);
      startPulse();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recordingObject) return;

    try {
      setIsRecording(false);
      pulseAnim.setValue(1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const currentRecording = recordingObject;
      setRecordingObject(null);

      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();

      if (uri) {
        setIsSending(true);
        const result = await sendVoiceChat(id!, uri);
        
        if (record) {
          setRecord({
            ...record,
            chatMessages: [...record.chatMessages, result.userMessage, result.aiResponse]
          });
        }
      }
    } catch (err) {
      console.error("Failed to stop recording:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending || !id) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    try {
      const result = await sendChatMessage(id!, userText);
      
      if (record) {
        setRecord({
          ...record,
          chatMessages: [...record.chatMessages, result.userMessage, result.aiResponse]
        });
      }
      
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Dr. Planteinstein is opening your file...</Text>
      </View>
    );
  }

  if (error || !record) {
    return (
      <View style={styles.centered}>
        <FontAwesome5 name="exclamation-circle" size={40} color={COLORS.warningText} />
        <Text style={styles.errorText}>{error ?? "Something went wrong."}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const vitalityValue = record.status === "healthy" ? 95 : record.status === "warning" ? 65 : 30;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <Header showBackButton showProfile title="Dr. Planteinstein" />

      <ScrollView 
        ref={scrollRef}
        style={styles.chatContainer} 
        contentContainerStyle={styles.chatScrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Initial Greeting */}
        <View style={styles.messageRow}>
          <View style={styles.botAvatar}>
             <Ionicons name="leaf" size={18} color="#FFF" />
          </View>
          <View style={styles.doctorBubble}>
            <Text style={styles.doctorText}>
              I've analyzed your crop scan. Here's what I found.
            </Text>
          </View>
        </View>

        {/* Diagnosis Card */}
        <View style={styles.diagnosisCard}>
          <Image
            source={{ uri: uri ?? formatImageUrl(record.imageUrl) }}
            style={styles.leafImage}
            resizeMode="cover"
          />
          <View style={styles.badgeLabel}>
             <Badge type={record.status as BadgeType} text={record.status.toUpperCase()} />
          </View>

          <View style={styles.cardInfo}>
             <View style={styles.infoTopRow}>
                <View>
                  <Text style={styles.label}>DIAGNOSIS</Text>
                  <Text style={styles.diagnosisTitle}>{record.title}</Text>
                </View>
             </View>

            <View style={styles.vitalityContainer}>
              <View style={styles.vitalityHeader}>
                 <Text style={styles.label}>PLANT VITALITY</Text>
                 <Text style={styles.vitalityStatus}>{vitalityValue > 50 ? "GOOD" : "LOW"}</Text>
              </View>
              <View style={styles.vitalityBarBackground}>
                 <View style={[
                   styles.vitalityBarFilled, 
                   { width: `${vitalityValue}%`, backgroundColor: vitalityValue > 50 ? COLORS.primary : "#D32F2F" }
                 ]} />
              </View>
            </View>
          </View>
        </View>

        {/* Initial AI Result Bubble */}
        <View style={styles.messageRow}>
          <View style={styles.botAvatar}>
             <Ionicons name="leaf" size={18} color="#FFF" />
          </View>
          <View style={styles.doctorBubble}>
            <Text style={styles.doctorText}>
              {record.title} is common. I recommend {record.analysis.remedies.toLowerCase()}
              {"\n\n"}
              Would you like to know more about organic alternatives or how to prevent this in the next season?
            </Text>
          </View>
        </View>

        {/* Persistent Chat History */}
        {record.chatMessages.map((msg, index) => (
          <View 
            key={index} 
            style={[
              styles.messageRow, 
              msg.role === "user" ? styles.userRow : styles.doctorRow
            ]}
          >
            {msg.role === "model" && (
              <View style={styles.botAvatar}>
                 <Ionicons name="leaf" size={18} color="#FFF" />
              </View>
            )}
            <View style={[
              msg.role === "user" ? styles.userBubble : styles.doctorBubble
            ]}>
              <Text style={[
                msg.role === "user" ? styles.userText : styles.doctorText
              ]}>
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {/* Thinking State */}
        {isSending && (
          <View style={styles.messageRow}>
             <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 40 }} />
          </View>
        )}

        {/* Suggestion & Action Chips */}
        <View style={styles.chipsContainer}>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
              <TouchableOpacity 
                onPress={() => router.push("/expert-selection")} 
                style={[styles.actionChip, styles.actionChipPrimary]}
              >
                <FontAwesome5 name="user-tie" size={14} color="#FFF" />
                <Text style={styles.actionChipTextPrimary}>Consult with expert</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setInputMessage("Tell me more about organic remedies.")} style={styles.actionChip}>
                <Text style={styles.actionChipTextSecondary}>Organic remedies</Text>
              </TouchableOpacity>
           </ScrollView>
        </View>
      </ScrollView>

      {/* Chat Input Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.inputOuterContainer}>
           <TextInput 
              placeholder="Ask Dr. Planteinstein..." 
              style={styles.inputField}
              placeholderTextColor="#99AFA0"
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              maxLength={500}
              editable={!isSending}
           />
           <TouchableOpacity 
              onPressIn={startRecording}
              onPressOut={stopRecording}
              style={styles.micIcon}
           >
              <MaterialCommunityIcons name={isRecording ? "microphone" : "microphone-outline"} size={22} color={isRecording ? COLORS.primary : "#99AFA0"} />
           </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.sendCircle, (!inputMessage.trim() || isSending) && { opacity: 0.5 }]} 
          onPress={handleSendMessage}
          disabled={!inputMessage.trim() || isSending}
        >
           <Ionicons name="arrow-up" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFEF8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FDFEF8" },
  loadingText: { ...TYPOGRAPHY.body, marginTop: SPACING.md, color: COLORS.textSecondary },
  errorText: { ...TYPOGRAPHY.body, textAlign: "center", marginTop: SPACING.md, marginBottom: SPACING.lg, color: COLORS.warningText },
  backButton: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  backButtonText: { color: COLORS.white, fontWeight: "600" },

  chatContainer: { flex: 1 },
  chatScrollContent: { padding: SPACING.md, paddingBottom: 100 },

  messageRow: { flexDirection: "row", marginBottom: SPACING.lg, alignItems: "flex-end" },
  userRow: { justifyContent: "flex-end" },
  doctorRow: { justifyContent: "flex-start" },
  
  botAvatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: "#16552B", 
    marginRight: SPACING.sm, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  
  doctorBubble: { maxWidth: "80%", backgroundColor: "#F4F7EF", padding: SPACING.md, borderRadius: 20, borderBottomLeftRadius: 4 },
  userBubble: { maxWidth: "80%", backgroundColor: "#1C6B38", padding: SPACING.md, borderRadius: 20, borderBottomRightRadius: 4 },
  
  doctorText: { ...TYPOGRAPHY.body, color: "#3E4438", lineHeight: 22 },
  userText: { ...TYPOGRAPHY.body, color: COLORS.white, lineHeight: 22 },

  // Diagnosis Card Match
  diagnosisCard: { 
    backgroundColor: "#EDF2E6", 
    borderRadius: 24, 
    overflow: "hidden", 
    marginBottom: SPACING.lg,
    marginLeft: 40,
    ...SHADOWS.sm
  },
  leafImage: { width: "100%", height: 180 },
  badgeLabel: { position: "absolute", top: SPACING.sm, right: SPACING.sm },

  cardInfo: { padding: SPACING.md },
  infoTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  label: { ...TYPOGRAPHY.tiny, color: "#78876F", fontWeight: "800", letterSpacing: 0.5 },
  diagnosisTitle: { ...TYPOGRAPHY.h2, color: "#1A2016", marginTop: 4, fontSize: 22 },

  vitalityContainer: { marginTop: SPACING.md },
  vitalityHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  vitalityStatus: { ...TYPOGRAPHY.tiny, color: "#78876F", fontWeight: "800" },
  vitalityBarBackground: { height: 10, backgroundColor: "#D8E2CE", borderRadius: 5, overflow: "hidden" },
  vitalityBarFilled: { height: "100%", borderRadius: 5 },

  chipsContainer: { marginTop: SPACING.md },
  chipsContent: { paddingRight: SPACING.lg },
  actionChip: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#E6EEE1", 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: RADIUS.pill, 
    marginRight: 10 
  },
  actionChipPrimary: { backgroundColor: "#114D23" },
  actionChipTextPrimary: { color: "#FFF", fontWeight: "700", marginLeft: 8, fontSize: 13 },
  actionChipTextSecondary: { color: "#1C6B38", fontWeight: "700", fontSize: 13 },

  // Input Bar Match
  bottomBar: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.md, 
    backgroundColor: "#FDFEF8" 
  },
  inputOuterContainer: { 
    flex: 1, 
    flexDirection: "row", 
    backgroundColor: "#FFF", 
    borderRadius: 30, 
    paddingHorizontal: 20, 
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#EAEFE2",
    alignItems: "center"
  },
  inputField: { 
    flex: 1, 
    fontSize: 15,
    color: "#333",
    maxHeight: 100
  },
  micIcon: { marginLeft: 10 },
  sendCircle: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: "#2D5A27", 
    justifyContent: "center", 
    alignItems: "center" 
  },
});
