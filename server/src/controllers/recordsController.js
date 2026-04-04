const Record = require("../models/Record");
const fs = require("fs");
const path = require("path");

// ─── Gemini AI Setup (using correct @google/genai v1.x API) ─────────────────
// The correct class is GoogleGenAI, and response.text is a property, NOT a function.
const { GoogleGenAI } = require("@google/genai");

const logError = (context, error) => {
  const logPath = path.join(__dirname, "../../server_error.log");
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${context}: ${error.message}\n${error.stack}\n\n`;
  try { fs.appendFileSync(logPath, logMessage); } catch (e) { /* ignore */ }
};

// Initialise the AI client once (not on every request)
const geminiApiKey = () => process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

/**
 * GET /api/records
 */
const getAllRecords = async (req, res) => {
  try {
    const filter = { userId: req.user?.userId };
    if (!req.user?.userId) return res.status(401).json({ success: false, message: "Unauthorized." });
    if (req.query.status) filter.status = req.query.status;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Record.find(filter).sort({ scannedAt: -1 }).skip(skip).limit(limit),
      Record.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, total, page, pages: Math.ceil(total / limit), data: records });
  } catch (error) {
    console.error("getAllRecords error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch records." });
  }
};

const getRecordById = async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, userId: req.user?.userId });
    if (!record) return res.status(404).json({ success: false, message: "Record not found." });
    res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error("getRecordById error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch record." });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findOneAndDelete({ _id: req.params.id, userId: req.user?.userId });
    if (!record) return res.status(404).json({ success: false, message: "Record not found." });
    res.status(200).json({ success: true, message: "Record deleted successfully." });
  } catch (error) {
    console.error("deleteRecord error:", error);
    res.status(500).json({ success: false, message: "Failed to delete record." });
  }
};

/**
 * POST /api/records/:id/chat
 * Uses GoogleGenAI with the correct API: ai.models.generateContent() & response.text (property)
 */
const addChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "No message provided." });
    }

    const record = await Record.findOne({ _id: req.params.id, userId: req.user?.userId });
    if (!record) return res.status(404).json({ success: false, message: "Record not found." });

    const apiKey = geminiApiKey();
    if (!apiKey) {
      return res.status(500).json({ success: false, message: "AI service not configured." });
    }

    // Build conversation history for context
    const historyText = record.chatMessages
      .slice(-10) // Last 10 messages to keep context manageable
      .map(m => `${m.role === "user" ? "Kisan (Farmer)" : "Dr. Planteinstein"}: ${m.content}`)
      .join("\n");

    const contextPrompt = `
You are "Dr. Planteinstein", a friendly and expert plant pathologist and agricultural advisor.
You help farmers diagnose and treat crop diseases with practical, actionable advice.

CROP INFORMATION:
- Crop Name: ${record.cropName}
- Scientific Name: ${record.cropScientific || "N/A"}
- Diagnosis: ${record.title}
- Severity: ${record.status}
- Confidence: ${record.confidence}%

CONVERSATION HISTORY (last 10 messages):
${historyText || "This is the beginning of the conversation."}

FARMER'S QUESTION: "${message.trim()}"

INSTRUCTIONS:
- Respond in a warm, friendly, expert manner
- If the farmer writes in Hindi, respond in Hindi. If in English, respond in English.
- Keep response concise (2-4 paragraphs max)
- Be practical and give actionable advice
- Always sign responses as "Dr. Planteinstein 🌿"
    `.trim();

    console.log("[AI Chat] Processing request for record:", req.params.id);

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contextPrompt,
    });

    // response.text is a PROPERTY, not a method (per @google/genai v1.x SDK)
    const text = response.text;

    if (!text || text.trim() === "") {
      console.error("[AI Chat] Empty AI response for record:", req.params.id);
      throw new Error("AI returned an empty response.");
    }

    console.log("[AI Chat] Success, response length:", text.length);

    record.chatMessages.push({ role: "user", content: message.trim() });
    record.chatMessages.push({ role: "model", content: text.trim() });
    await record.save();

    res.status(200).json({
      success: true,
      userMessage: record.chatMessages[record.chatMessages.length - 2],
      aiResponse: record.chatMessages[record.chatMessages.length - 1],
    });

  } catch (error) {
    console.error("[AI Chat] Error:", error.message, "| Status:", error.status || "N/A");
    logError("addChatMessage", error);

    // ── Graceful fallback: if Gemini is rate-limited or temporarily down, ──────
    // save the user's message and return a friendly "busy" response so the
    // chat continues working instead of showing a crash error.
    const isRateLimited = error.status === 429 || (error.message && error.message.includes("429"));
    const isUnavailable = error.status === 503 || error.status === 500;

    if (isRateLimited || isUnavailable) {
      try {
        const userMsg = req.body.message?.trim() || "";
        const fallbackText = isRateLimited
          ? "मैं अभी बहुत व्यस्त हूँ (I'm currently handling many requests). Please try again in a moment — Dr. Planteinstein 🌿"
          : "I'm temporarily offline. Please try again shortly — Dr. Planteinstein 🌿";

        const record = await Record.findOne({ _id: req.params.id });
        if (record && userMsg) {
          record.chatMessages.push({ role: "user", content: userMsg });
          record.chatMessages.push({ role: "model", content: fallbackText });
          await record.save();
          return res.status(200).json({
            success: true,
            userMessage: record.chatMessages[record.chatMessages.length - 2],
            aiResponse: record.chatMessages[record.chatMessages.length - 1],
          });
        }
      } catch (fallbackErr) {
        console.error("[AI Chat] Fallback also failed:", fallbackErr.message);
      }
    }

    res.status(500).json({
      success: false,
      message: "AI response failed.",
      detail: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
};

/**
 * POST /api/records/:id/voice-chat
 * Multimodal voice processing with Gemini
 */
const addVoiceChatMessage = async (req, res) => {
  const localFilePath = req.file?.path;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No audio file provided." });
    }

    const record = await Record.findOne({ _id: req.params.id, userId: req.user?.userId });
    if (!record) return res.status(404).json({ success: false, message: "Record not found." });

    const apiKey = geminiApiKey();
    if (!apiKey) {
      return res.status(500).json({ success: false, message: "AI service not configured." });
    }

    const audioData = fs.readFileSync(localFilePath).toString("base64");
    const historyText = record.chatMessages
      .slice(-6)
      .map(m => `${m.role === "user" ? "Farmer" : "Dr. Planteinstein"}: ${m.content}`)
      .join("\n");

    const prompt = `
You are "Dr. Planteinstein", a friendly and expert plant pathologist.
CROP: ${record.cropName}, DIAGNOSIS: "${record.title}", STATUS: ${record.status}
RECENT HISTORY: ${historyText || "None."}

Listen carefully to the audio message from the farmer.
Respond with a JSON object containing exactly two fields:
- "transcription": what the farmer said (transcribe the audio accurately)  
- "response": your expert response in the same language as the farmer spoke

JSON response only, no markdown.
    `.trim();

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt },
        { inlineData: { data: audioData, mimeType: req.file.mimetype } },
      ],
    });

    const text = response.text;
    if (!text) throw new Error("Empty AI response for voice chat.");

    const cleanJson = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    if (!parsed.transcription || !parsed.response) {
      throw new Error("AI response missing required fields: transcription or response.");
    }

    record.chatMessages.push({ role: "user", content: parsed.transcription });
    record.chatMessages.push({ role: "model", content: parsed.response });
    await record.save();

    res.status(200).json({
      success: true,
      userMessage: record.chatMessages[record.chatMessages.length - 2],
      aiResponse: record.chatMessages[record.chatMessages.length - 1],
    });

  } catch (error) {
    console.error("addVoiceChatMessage error:", error.message);
    logError("addVoiceChatMessage", error);
    res.status(500).json({ success: false, message: "Voice processing failed.", detail: error.message });
  } finally {
    if (localFilePath) fs.unlink(localFilePath, () => {});
  }
};

module.exports = { getAllRecords, getRecordById, deleteRecord, addChatMessage, addVoiceChatMessage };
