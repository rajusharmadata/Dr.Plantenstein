const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Explain how AI works in simple words",
    });
    console.log("Success! AI Response:", response.text);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

main();
