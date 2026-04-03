require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }
  
  console.log("Testing Gemini with key:", apiKey.substring(0, 10) + "...");
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Test prompt: How to fix Tomato Early Blight organic way? Answer in 1 sentence.");
    console.log("Gemini Response:", result.response.text());
  } catch (error) {
    console.error("Gemini Error Detail:", error);
  }
}

testGemini();
