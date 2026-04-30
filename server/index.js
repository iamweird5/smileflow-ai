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
// Routes
// ==========================

// Root route
app.get("/", (req, res) => {
  res.send("SmileFlow API is running 🚀");
});

const appointmentRoutes = require("./routes/appointmentRoutes");

app.use("/api/appointments", appointmentRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SmileFlow Backend",
    time: new Date().toISOString()
  });
});

// ==========================
// Database Connection
// ==========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Start server ONLY after DB connects
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
