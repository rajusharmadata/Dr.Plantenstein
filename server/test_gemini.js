require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello Dr. Planteinstein!");
    console.log("Success with gemini-1.5-flash:", result.response.text());
  } catch (error) {
    console.error("Failed with gemini-1.5-flash:", error.message);
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent("Hello Dr. Planteinstein!");
      console.log("Success with gemini-pro:", result.response.text());
    } catch (err) {
      console.error("Failed with gemini-pro:", err.message);
    }
  }
}

test();
