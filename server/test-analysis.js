const { analyzeImage } = require("./src/services/analysisService");
require("dotenv").config();

async function test() {
  try {
    const result = await analyzeImage("uploads/dummy.jpg"); // Need a dummy image
    console.log("Analysis Result:", result);
  } catch (error) {
    console.error("Analysis Failed:", error);
  }
}

test();
