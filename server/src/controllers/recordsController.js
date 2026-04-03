const Record = require("../models/Record");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

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
 * Standard non-streaming response with Hindi & History support.
 */
const addChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: "No message provided." });

    const record = await Record.findOne({ _id: req.params.id, userId: req.user?.userId });
    if (!record) return res.status(404).json({ success: false, message: "Record not found." });

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenerativeAI(geminiApiKey);

    const historyText = record.chatMessages.map(m => `${m.role === 'user' ? 'User' : 'Dr. Planteinstein'}: ${m.content}`).join('\n');
    
    // Hindi + Context Prompt - Sharpened for better "Memory"
    const contextPrompt = `
      You are "Dr. Planteinstein", a highly intelligent and empathetic professional plant pathologist.
      
      CORE KNOWLEDGE:
      - CROP: ${record.cropName}
      - INITIAL DIAGNOSIS: "${record.title}"
      
      YOUR MEMORY (PREVIOUS CONVERSATION):
      ${historyText || "No previous history. This is the start of the consultation."}
      
      INSTRUCTIONS:
      1. Use the "PREVIOUS CONVERSATION" logic above to maintain continuity. If the user refers to something said earlier, you MUST know what they are talking about.
      2. If the user asks in Hindi or Hinglish, respond in fluent Hindi or Hinglish.
      3. Be concise but expert.
      
      USER'S NEW MESSAGE: "${message}"
      
      RESPONSE LOGIC: Acknowledge previous context if relevant. Give expert advice.
    `;

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(contextPrompt);
    const text = result.response.text();

    record.chatMessages.push({ role: "user", content: message });
    record.chatMessages.push({ role: "model", content: text });
    await record.save();

    res.status(200).json({ 
      success: true, 
      userMessage: record.chatMessages[record.chatMessages.length - 2],
      aiResponse: record.chatMessages[record.chatMessages.length - 1] 
    });

  } catch (error) {
    console.error("addChatMessage error:", error);
    res.status(500).json({ success: false, message: "AI response failed." });
  }
};

/**
 * POST /api/records/:id/voice-chat
 */
const addVoiceChatMessage = async (req, res) => {
  const localFilePath = req.file?.path;
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No audio." });

    const record = await Record.findOne({ _id: req.params.id, userId: req.user?.userId });
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenerativeAI(geminiApiKey);
    const audioData = fs.readFileSync(localFilePath).toString("base64");

    const historyText = record.chatMessages.map(m => `${m.role === 'user' ? 'User' : 'Dr. Planteinstein'}: ${m.content}`).join('\n');
    
    // Audio + Context Prompt - Sharpened for better "Memory"
    const prompt = `
      You are "Dr. Planteinstein", a professional plant pathologist with deep empathy.
      
      CORE KNOWLEDGE:
      - CROP: ${record.cropName}
      - INITIAL DIAGNOSIS: "${record.title}"
      
      YOUR MEMORY (PREVIOUS CONVERSATION):
      ${historyText || "No previous history. This is the start of the consultation."}
      
      INSTRUCTIONS:
      1. Listen to the user's audio carefully.
      2. If the user refers to past advice or messages, you MUST identify them from "YOUR MEMORY".
      3. Match user's language (Hindi or English).
      
      GOAL: Provide a JSON with "transcription" (their spoken words) and "response" (your advice).
    `;

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: audioData, mimeType: req.file.mimetype } },
    ]);
    const response = result.response;
    const text = response.text();

    const cleanJson = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    record.chatMessages.push({ role: "user", content: parsed.transcription });
    record.chatMessages.push({ role: "model", content: parsed.response });
    await record.save();

    res.status(200).json({ 
      success: true, 
      userMessage: record.chatMessages[record.chatMessages.length - 2],
      aiResponse: record.chatMessages[record.chatMessages.length - 1] 
    });

  } catch (error) {
    console.error("addVoiceChatMessage error:", error);
    res.status(500).json({ success: false, message: "Voice processing failed." });
  } finally {
    if (localFilePath) fs.unlink(localFilePath, () => {});
  }
};

module.exports = { getAllRecords, getRecordById, deleteRecord, addChatMessage, addVoiceChatMessage };
