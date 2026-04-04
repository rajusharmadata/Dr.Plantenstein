const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

/**
 * Uses Gemini AI to provide structured expert analysis for a detected disease.
 * Uses the correct @google/genai v1.x API: ai.models.generateContent() & response.text (property)
 */
const getExpertAnalysis = async (prediction) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[Analysis] GEMINI_API_KEY not found in .env. Skipping AI analysis.");
      return null;
    }

    const prompt = `
You are a professional plant pathologist. Analyze this plant disease and respond with a valid JSON object only (no markdown, no backticks).

Disease/Condition: "${prediction}"

Return this exact JSON structure:
{
  "title": "Brief disease title (e.g. 'Tomato Early Blight')",
  "cropName": "Common crop name (e.g. 'Tomato')",
  "cropScientific": "Scientific crop name (e.g. 'Solanum lycopersicum')",
  "status": "one of: healthy, warning, critical, severe, soil",
  "analysis": {
    "description": "2-3 sentence description of the disease and its symptoms",
    "remedies": "Practical treatment steps the farmer can take",
    "prevention": ["Prevention tip 1", "Prevention tip 2", "Prevention tip 3"],
    "soilHealth": "Brief soil health recommendation related to this disease"
  }
}
    `.trim();

    console.log("[Analysis] Calling Gemini for expert analysis of:", prediction);

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    // response.text is a PROPERTY in @google/genai v1.x (NOT response.text())
    const text = response.text;

    if (!text || text.trim() === "") {
      console.error("[Analysis] Empty AI response for prediction:", prediction);
      throw new Error("Empty response from Gemini AI.");
    }

    const cleanJson = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    // Validate required fields
    if (!parsed.title || !parsed.cropName || !parsed.status || !parsed.analysis) {
      throw new Error("AI response missing required fields.");
    }

    return parsed;
  } catch (error) {
    console.error("[Analysis] getExpertAnalysis failed:", error.message);
    if (error.stack) console.error(error.stack);
    return null;
  }
};

/**
 * Plant Disease Analysis Engine:
 * 1. Sends image to local Flask ML model (port 5000/predict)
 * 2. Uses the predicted category to query Gemini for expert solutions
 */
const analyzeImage = async (imagePath) => {
  const modelUrl = process.env.MODEL_URL || "http://localhost:5000/predict";
  let prediction = "Unknown Issue";
  let confidence = 0;

  try {
    // Step 1: Call the trained ML model
    const form = new FormData();
    form.append("file", fs.createReadStream(imagePath));

    console.log("[AnalysisService] Calling ML model at:", modelUrl);
    const modelResponse = await axios.post(modelUrl, form, {
      headers: { ...form.getHeaders() },
      timeout: 30000, // 30 second timeout
    });

    console.log("[AnalysisService] Flask Model Response:", modelResponse.data);
    prediction = modelResponse.data.prediction || "Unknown Issue";
    confidence = modelResponse.data.confidence || 0;

    // Step 2: Query Gemini for solutions
    if (!process.env.GEMINI_API_KEY) {
      console.warn("[AnalysisService] No GEMINI_API_KEY; using fallback diagnosis.");
      return getFallbackDiagnosis(prediction, confidence);
    }

    const aiSolutions = await getExpertAnalysis(prediction);

    if (!aiSolutions) {
      console.warn("[AnalysisService] AI returned null; using fallback.");
      return getFallbackDiagnosis(prediction, confidence);
    }

    return {
      ...aiSolutions,
      confidence: isNaN(confidence) ? 0 : Math.min(100, Math.max(0, Math.round(confidence * 100))),
      predictionRaw: String(prediction || "unknown"),
    };

  } catch (modelError) {
    console.error("[AnalysisService] ML Model Error:", modelError.message);
    return getFallbackDiagnosis("Error connecting to ML model", 0);
  }
};

const getFallbackDiagnosis = (prediction, confidence) => ({
  title: prediction || "Unknown Issue",
  cropName: "General Plant",
  cropScientific: "N/A",
  status: "warning",
  confidence: Math.round((confidence || 0) * 100),
  predictionRaw: String(prediction || "unknown"),
  analysis: {
    description: "Dr. Planteinstein is temporarily offline. Please try again later.",
    remedies: "Please consult a local agricultural expert or try again.",
    prevention: ["Maintain regular watering schedule", "Ensure good sunlight exposure", "Monitor plants daily for early detection"],
    soilHealth: "Test soil pH and nutrient levels regularly.",
  },
});

module.exports = { analyzeImage };
