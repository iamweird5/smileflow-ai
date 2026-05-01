const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ENV CHECK
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing");
  process.exit(1);
}

// ROUTES
const appointmentRoutes = require("./routes/appointmentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const clinicRoutes = require("./routes/clinicRoutes");

app.get("/", (req, res) => {
  res.send("SmileFlow API running 🚀");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🔥 ROUTE REGISTRATION
app.use("/api/appointments", appointmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/clinics", clinicRoutes);

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Mongo connected");

    const PORT = process.env.PORT || 10000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB error:", err);
    process.exit(1);
  });

// GLOBAL ERROR
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});
