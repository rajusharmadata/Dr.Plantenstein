/**
 * Mock AI Disease Analysis Engine
 * In production, replace this with a real ML model API call (e.g. Vertex AI, PlantNet, etc.)
 */

const DISEASE_DATABASE = [
  {
    title: "Early Blight",
    cropName: "Tomato",
    cropScientific: "Solanum lycopersicum",
    status: "severe",
    confidence: 92,
    analysis: {
      description:
        "A common fungal infection (Alternaria solani) that primarily affects tomatoes and potatoes, starting on older leaves near the ground.",
      remedies:
        "Remove and destroy all infected plant parts immediately. Apply a copper-based fungicide or a mixture of baking soda and water to prevent further spore spread.",
      prevention: [
        "Rotate crops annually",
        "Water at the base, not leaves",
        "Space plants for airflow",
      ],
      soilHealth:
        "Spores can live in soil for years. Consider using a mulch barrier to prevent soil splashing onto leaves during rain.",
    },
  },
  {
    title: "Northern Leaf Blight",
    cropName: "Maize",
    cropScientific: "Zea mays",
    status: "warning",
    confidence: 87,
    analysis: {
      description:
        "A fungal disease (Exserohilum turcicum) that causes elongated tan lesions on maize leaves significantly reducing yield.",
      remedies:
        "Apply foliar fungicides such as azoxystrobin or propiconazole. Remove and destroy infected leaves promptly.",
      prevention: [
        "Plant resistant hybrid varieties",
        "Rotate with non-host crops",
        "Ensure narrow row spacing for airflow",
      ],
      soilHealth:
        "Infected crop debris should be incorporated into the soil or removed to reduce inoculum load next season.",
    },
  },
  {
    title: "Stem Rust (Puccinia)",
    cropName: "Wheat",
    cropScientific: "Triticum aestivum",
    status: "critical",
    confidence: 95,
    analysis: {
      description:
        "One of the most devastating wheat diseases caused by Puccinia graminis, forming brick-red uredia on stems and leaves.",
      remedies:
        "Apply triazole fungicides (e.g. tebuconazole) immediately at first sign. Avoid dense planting.",
      prevention: [
        "Use certified rust-resistant wheat varieties",
        "Monitor fields weekly during humid seasons",
        "Eliminate barberry plants nearby (alternate host)",
      ],
      soilHealth:
        "Puccinia spores spread via wind, not soil. Focus on sanitation of infected stubble after harvest.",
    },
  },
  {
    title: "No Issues Detected",
    cropName: "Soybean",
    cropScientific: "Glycine max",
    status: "healthy",
    confidence: 98,
    analysis: {
      description:
        "Your crop appears to be in excellent health. No signs of disease, pests, or nutritional deficiency were detected.",
      remedies: "No remedies needed. Continue your current crop management practices.",
      prevention: [
        "Maintain current watering schedule",
        "Continue crop rotation plan",
        "Monitor bi-weekly for early detection",
      ],
      soilHealth:
        "Soil conditions appear suitable. Consider a soil nutrient test every 3 months for optimal yield.",
    },
  },
  {
    title: "Low Moisture Index",
    cropName: "General Crop",
    cropScientific: "N/A",
    status: "soil",
    confidence: 78,
    analysis: {
      description:
        "The scan indicates low moisture levels in the soil around your crop, which may stress the plant if left unaddressed.",
      remedies:
        "Initiate drip irrigation immediately. Apply organic mulch (straw or wood chips) to retain moisture.",
      prevention: [
        "Install soil moisture sensors",
        "Schedule irrigation based on evapotranspiration data",
        "Use drought-resistant crop varieties long-term",
      ],
      soilHealth:
        "Low moisture can reduce nutrient uptake. Consider a compost amendment to improve water-holding capacity.",
    },
  },
];

/**
 * Picks one of the mock diseases at random to simulate AI variability.
 * In a real implementation, you'd call:
 *   - Google Vertex AI Vision API
 *   - Plant.id API
 *   - A custom trained TFLite/ONNX model
 */
const analyzeImage = (imagePath) => {
  return new Promise((resolve) => {
    // Simulate a 2-second AI processing delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * DISEASE_DATABASE.length);
      resolve(DISEASE_DATABASE[randomIndex]);
    }, 2000);
  });
};

module.exports = { analyzeImage };
