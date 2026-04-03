const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        As a world-class plant pathologist and friendly expert named "Dr. Planteinstein", analyze this detected plant disease: "${prediction}".
        Respond as if you are talking to a farmer who just showed you a photo of their crops.
        Provide a structured JSON response (strictly JSON, no extra text) with:
        - title: A user-friendly name for the disease.
        - cropName: The common name of the plant.
        - cropScientific: Scientific name of the plant.
        - status: One of ["healthy", "warning", "severe", "critical"] based on severity.
        - analysis: {
            description: A conversational, expert explanation of what is happening (1-2 sentences).
            remedies: Specific immediate actions/treatments with an organic focus, written as advice.
            prevention: An array of 3-4 preventive steps for the future.
            soilHealth: Advice on soil management to avoid recurrence.
          }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const aiSolutions = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

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
      description: "",
      remedies: "Please consult a local agricultural expert.",
      prevention: ["Maintain regular watering", "Ensure good sunlight"],
      soilHealth: "Test soil pH and nutrients.",
    },
  };
};

module.exports = { analyzeImage };
