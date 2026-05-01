// ==========================
// SmileFlow Backend Server
// ==========================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ==========================
// App Init
// ==========================
const app = express();

// ==========================
// Middleware
// ==========================
app.use(cors());
app.use(express.json());

// ==========================
// Environment Safety Check
// ==========================
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in environment variables");
  process.exit(1);
}

// ==========================
// Routes Import
// ==========================
const appointmentRoutes = require("./routes/appointmentRoutes");
const aiRoutes = require("./routes/aiRoutes");

// ==========================
// Routes
// ==========================

// Root route
app.get("/", (req, res) => {
  res.send("SmileFlow API is running 🚀");
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SmileFlow Backend",
    time: new Date().toISOString()
  });
});

// ==========================
// API Routes
// ==========================

// Appointment routes (web booking + dashboard)
app.use("/api/appointments", appointmentRoutes);

// AI receptionist routes (chat booking)
app.use("/api/ai", aiRoutes);

// ==========================
// Database Connection
// ==========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    const PORT = process.env.PORT || 10000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// ==========================
// Global Error Handler
// ==========================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});
