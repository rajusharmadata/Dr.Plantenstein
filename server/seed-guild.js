require("dotenv").config();
const mongoose = require("mongoose");
const Post = require("./src/models/Post");
const User = require("./src/models/User");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("🌱 Seeding Farmer's Guild...");

  // Get a user to be the author
  const user = await User.findOne();
  if (!user) {
    console.error("No user found to author seed posts.");
    process.exit(1);
  }

  const mockPosts = [
    {
      userId: user._id,
      type: "post",
      content: "Anyone seeing early signs of blight in tomatoes near Raipur? My organic spray doesn't seem to hold up after the recent rains. Advice needed! 🍅",
      category: "Vegetables",
      images: ["https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=1000&auto=format&fit=crop"],
      likes: [],
      comments: [],
    },
    {
      userId: user._id,
      type: "scan_analysis",
      content: "Latest diagnostic results for Wheat Rust.",
      category: "Cereals",
      diagnosis: {
        title: "Wheat Rust",
        status: "warning",
        confidence: 89,
      },
      remedy: "Apply propiconazole or tebuconazole based fungicides. Ensure timely application before full spread.",
      precaution: "Avoid late planting and overhead irrigation. Use resistant varieties whenever possible.",
      images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=1000&auto=format&fit=crop"],
      likes: [user._id],
      comments: [],
    },
    {
      userId: user._id,
      type: "question",
      content: "What's the best time to prune guava trees for maximum yield in tropical climates? 🌳",
      category: "Fruits",
      authorRole: "FARMERS GROUP",
      images: [],
      likes: [],
      comments: [],
    }
  ];

  await Post.insertMany(mockPosts);
  console.log("✅ Seeded 3 premium posts!");
  process.exit();
}

seed();
