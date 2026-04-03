const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");

/**
 * Uses Gemini AI to provide a structured explanation and remedies for a detected disease.
 */
const getExpertAnalysis = async (prediction) => {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.warn("GEMINI_API_KEY not found in .env. Skipping AI analysis.");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const prompt = `
        You are "Dr. Planteinstein", a world-class plant pathologist. 
        You just received a diagnosis from a specialized ML model: "${prediction}".
        
        GOAL:
        1. Explain this diagnosis professionally yet friendly.
        2. Provide expert agricultural advice.
        3. LANGUAGE RULE: If this is an Indian crop or if requested, provide the response in a way that respects Hindi/English bilingual needs (Hinglish/Hindi/English).
        
        STRICT JSON FORMAT:
        {
          "title": "Clear Name of the Disease (in English & Hindi)",
          "cropName": "Common Name",
          "cropScientific": "Scientific Name",
          "status": "healthy/warning/severe/critical",
          "analysis": {
            "description": "Conversational explanation (1-2 sentences).",
            "remedies": "Expert organic & chemical treatments.",
            "prevention": ["Step 1", "Step 2", "Step 3"],
            "soilHealth": "Soil & nutrient management advice."
          }
        }
      `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const text = response.text;
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
};

/**
 * Plant Disease Analysis Engine
 * 1. Sends image to local Flask model (port 5000/predict).
 * 2. Uses the predicted category to query Gemini for expert solutions.
 */
const analyzeImage = async (imagePath) => {
  const modelUrl = process.env.MODEL_URL || "http://localhost:5000/predict";
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let prediction = "Unknown Issue";
  let confidence = 0;

  try {
    // 1. Call your trained ML Model (DETECT)
    const form = new FormData();
    form.append("file", fs.createReadStream(imagePath));

    const modelResponse = await axios.post(modelUrl, form, {
      headers: { ...form.getHeaders() },
    });

    prediction = modelResponse.data.prediction;
    confidence = modelResponse.data.confidence;

    // 2. Query Gemini for solutions (SOLVE)
    if (!geminiApiKey) {
      return getFallbackDiagnosis(prediction, confidence);
    }

    try {
      const aiSolutions = await getExpertAnalysis(prediction);

      if (!aiSolutions) throw new Error("Invalid AI response");

      return {
        ...aiSolutions,
        confidence: Math.round(confidence * 100),
        predictionRaw: prediction,
      };
    } catch (aiError) {
      console.error("Gemini AI Error:", aiError.message);
      return getFallbackDiagnosis(prediction, confidence);
    }

  } catch (modelError) {
    console.error("Your Model Error:", modelError.message);
    return getFallbackDiagnosis("Error in Model Connection", 0);
  }
};

const getFallbackDiagnosis = (prediction, confidence) => {
  return {
    title: prediction || "Unknown Issue",
    cropName: "General Plant",
    cropScientific: "N/A",
    status: "warning",
    confidence: Math.round(confidence * 100) || 0,
    predictionRaw: prediction,
    analysis: {
      description: "Dr. Planteinstein is temporarily offline. Please try again later.",
      remedies: "Please consult a local agricultural expert.",
      prevention: ["Maintain regular watering", "Ensure good sunlight"],
      soilHealth: "Test soil pH and nutrients.",
    },
  };
};

module.exports = { analyzeImage };
