import React, { useEffect, useState, useRef } from "react";
import { 
  View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, 
  TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Animated
} from "react-native";
import { COLORS, RADIUS, SPACING } from "../src/constants/theme";
import { TYPOGRAPHY } from "../src/constants/typography";
import { Badge } from "../src/components/Badge";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Header } from "../src/components/Header";
import { getRecordById, sendChatMessage, sendVoiceChat, AnalysisResult, formatImageUrl } from "../src/services/api";
import type { BadgeType } from "../src/components/Badge";

// Voice imports (Speech removed)
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
  
  // Voice State (Now strictly input)
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
      <View style={styles.headerArea}>
         <Header />
      </View>

      <ScrollView 
        ref={scrollRef}
        style={styles.chatContainer} 
        contentContainerStyle={styles.chatScrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Initial Greeting */}
        <View style={styles.messageRow}>
          <View style={styles.doctorAvatar}>
            <Image 
               source={{ uri: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png" }} 
               style={styles.avatarImage} 
            />
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
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.label}>DIAGNOSIS</Text>
                <Text style={styles.diagnosisTitle}>{record.title}</Text>
              </View>
              <View style={styles.confidenceInfo}>
                <Text style={styles.label}>CONFIDENCE</Text>
                <Text style={styles.confidenceText}>{record.confidence}%</Text>
              </View>
            </View>

            <View style={styles.vitalityContainer}>
              <View style={styles.vitalityHeader}>
                 <Text style={styles.label}>PLANT VITALITY</Text>
                 <Text style={styles.vitalityStatus}>{vitalityValue > 50 ? "GOOD" : "LOW"}</Text>
              </View>
              <View style={styles.vitalityBarBackground}>
                 <View style={[styles.vitalityBarFilled, { width: `${vitalityValue}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Initial AI Result Bubble */}
        <View style={styles.messageRow}>
          <View style={styles.doctorAvatar}>
            <Image 
               source={{ uri: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png" }} 
               style={styles.avatarImage} 
            />
          </View>
          <View style={styles.doctorBubble}>
            <Text style={styles.doctorText}>
              {record.analysis.description}
              {"\n\n"}
              {record.analysis.remedies}
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
              <View style={styles.doctorAvatar}>
                <Image 
                  source={{ uri: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png" }} 
                  style={styles.avatarImage} 
                />
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
            <View style={styles.doctorAvatar}>
               <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
            <View style={styles.doctorBubble}>
              <Text style={[styles.doctorText, { fontStyle: "italic" }]}>
                Dr. Planteinstein is thinking...
              </Text>
            </View>
          </View>
        )}

        {/* Suggestion Chips */}
        {record.chatMessages.length === 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <TouchableOpacity onPress={() => setInputMessage("Tell me more about organic remedies.")} style={styles.chip}>
              <Text style={styles.chipText}>Organic remedies</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setInputMessage("What are the next steps for my crop?")} style={styles.chip}>
              <Text style={styles.chipText}>Next steps</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setInputMessage("How can I prevent this disease in the future?")} style={styles.chip}>
              <Text style={styles.chipText}>How to prevent</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </ScrollView>

      {/* Chat Input Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.inputContainer}>
          <TextInput 
            placeholder="Ask Dr. Planteinstein..." 
            style={styles.input}
            placeholderTextColor={COLORS.inactive}
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
            maxLength={500}
            editable={!isSending}
          />
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity 
              onPressIn={startRecording}
              onPressOut={stopRecording}
              style={[styles.micButton, isRecording && styles.micButtonActive]}
            >
               <Ionicons name={isRecording ? "mic" : "mic-outline"} size={22} color={isRecording ? COLORS.white : COLORS.inactive} />
            </TouchableOpacity>
          </Animated.View>
        </View>
        <TouchableOpacity 
          style={[styles.sendButton, (!inputMessage.trim() || isSending) && { opacity: 0.5 }]} 
          onPress={handleSendMessage}
          disabled={!inputMessage.trim() || isSending}
        >
           <Ionicons name="send" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerArea: { paddingRight: SPACING.md },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },
  loadingText: { ...TYPOGRAPHY.body, marginTop: SPACING.md, color: COLORS.textSecondary },
  errorText: { ...TYPOGRAPHY.body, textAlign: "center", marginTop: SPACING.md, marginBottom: SPACING.lg, color: COLORS.warningText },
  backButton: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.md },
  backButtonText: { color: COLORS.white, fontWeight: "600" },

  chatContainer: { flex: 1 },
  chatScrollContent: { padding: SPACING.md, paddingBottom: SPACING.xxl },

  messageRow: { flexDirection: "row", marginBottom: SPACING.lg, alignItems: "flex-end" },
  userRow: { justifyContent: "flex-end" },
  doctorRow: { justifyContent: "flex-start" },
  
  doctorAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.healthyBg, marginRight: SPACING.sm, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%" },
  
  doctorBubble: { maxWidth: "80%", backgroundColor: "#F4F7EF", padding: SPACING.md, borderRadius: RADIUS.lg, borderBottomLeftRadius: 0 },
  userBubble: { maxWidth: "80%", backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.lg, borderBottomRightRadius: 0 },
  
  doctorText: { ...TYPOGRAPHY.body, color: "#3E4438", lineHeight: 22 },
  userText: { ...TYPOGRAPHY.body, color: COLORS.white, lineHeight: 22 },

  diagnosisCard: { backgroundColor: "#EDF2E6", borderRadius: RADIUS.xl, overflow: "hidden", marginBottom: SPACING.lg },
  leafImage: { width: "100%", height: 220 },
  badgeLabel: { position: "absolute", top: SPACING.md, right: SPACING.md },

  cardInfo: { padding: SPACING.lg },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { ...TYPOGRAPHY.tiny, color: "#78876F", fontWeight: "bold", letterSpacing: 1 },
  diagnosisTitle: { ...TYPOGRAPHY.h2, color: "#1A2016", marginTop: 4 },
  confidenceInfo: { alignItems: "flex-end" },
  confidenceText: { ...TYPOGRAPHY.h1, color: COLORS.primary, marginTop: 4 },

  vitalityContainer: { marginTop: SPACING.md },
  vitalityHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  vitalityStatus: { ...TYPOGRAPHY.tiny, color: "#78876F", fontWeight: "bold" },
  vitalityBarBackground: { height: 8, backgroundColor: "#D8E2CE", borderRadius: 4, overflow: "hidden" },
  vitalityBarFilled: { height: "100%", backgroundColor: COLORS.primary, borderRadius: 4 },

  chipsScroll: { marginHorizontal: -SPACING.md, paddingHorizontal: SPACING.md, marginBottom: SPACING.md },
  chip: { backgroundColor: "#E6EEE1", paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: RADIUS.pill, marginRight: 8, borderWidth: 1, borderColor: "#D5DEC9" },
  chipText: { ...TYPOGRAPHY.small, color: COLORS.primary, fontWeight: "600" },

  bottomBar: { flexDirection: "row", alignItems: "center", padding: SPACING.sm, paddingHorizontal: SPACING.md, borderTopWidth: 1, borderTopColor: "#EBF0E5", backgroundColor: COLORS.background },
  inputContainer: { flex: 1, flexDirection: "row", backgroundColor: COLORS.white, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, minHeight: 46, maxHeight: 100, alignItems: "center", marginRight: SPACING.sm, borderWidth: 1, borderColor: "#E0E6DA" },
  input: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.textPrimary, paddingVertical: 8 },
  micButton: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  micButtonActive: { backgroundColor: COLORS.primary },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center" },
});

