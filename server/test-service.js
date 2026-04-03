require("dotenv").config();
const { analyzeImage } = require("./src/services/analysisService");
const path = require("path");

async function testPipeline() {
  console.log("🚀 Starting AI Pipeline Test...");
  
  // Use one of the existing sample images
  const testImagePath = path.join(__dirname, "uploads", "36b526d1-e6a7-4ed0-a536-424bdf92d619.jpeg");
  
  console.log(`📸 Testing with image: ${testImagePath}`);
  
  try {
    console.log("📡 Step 1: Sending image to your Flask model...");
    const result = await analyzeImage(testImagePath);
    
    console.log("\n✅ Pipeline analysis complete!\n");
    console.log("--------------------------------------------------");
    console.log(`🦠 DETECTED (BY YOUR MODEL): ${result.predictionRaw}`);
    console.log(`📊 CONFIDENCE: ${result.confidence}%`);
    console.log(`📝 USER-FRIENDLY TITLE: ${result.title}`);
    console.log(`🌱 CROP: ${result.cropName} (${result.cropScientific})`);
    console.log(`⚠️ STATUS: ${result.status.toUpperCase()}`);
    console.log("\n💡 GEMINI SOLUTIONS:");
    console.log(`   Description: ${result.analysis.description}`);
    console.log(`   Remedies: ${result.analysis.remedies}`);
    console.log(`   Prevention: ${result.analysis.prevention.join(", ")}`);
    console.log(`   Soil Health: ${result.analysis.soilHealth}`);
    console.log("--------------------------------------------------");
    
  } catch (error) {
    console.error("\n❌ Pipeline Test Failed!");
    console.error(error.message);
    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 TIP: Ensure your Flask server is running on port 5000!");
    }
  }
}

testPipeline();
