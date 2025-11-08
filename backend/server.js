require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const messagesRoutes = require("./routes/messages");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI);

// Auth routes
app.use("/api", authRoutes);

// Message routes
app.use("/api/messages", messagesRoutes);

// Protect your project routes
app.use("/api/portfolio/projects", authMiddleware, (req, res) => {
  // Return projects only if authenticated
  res.json([
    // your projects data json here...
  ]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ---- KEEP ALIVE PING CODE ----
const User = mongoose.models.User || require("./models/User");

setInterval(async () => {
  try {
    await User.estimatedDocumentCount();
    console.log("Keep-alive: pinged MongoDB Atlas.");
  } catch (err) {
    console.error("MongoDB keep-alive ping failed:", err.message);
  }
}, 15 * 60 * 1000); // every 15 minutes
