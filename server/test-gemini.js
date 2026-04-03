require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGeminiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("🔑 Testing API Key prefix:", apiKey ? apiKey.substring(0, 10) + "..." : "NOT FOUND");
  
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is missing from .env");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello, say 'Key Working' if you can hear me.");
    console.log("✅ GEMINI RESPONSE:", result.response.text());
  } catch (error) {
    console.error("❌ GEMINI API ERROR:", error.message);
  }
}

testGeminiKey();
