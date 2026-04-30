const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

// Create appointment
router.post("/book", async (req, res) => {
  try {
    const { name, phone, email, date, time, reason } = req.body;

    const existing = await Appointment.findOne({ date, time });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Slot already booked"
      });
    }

    const appointment = await Appointment.create({
      name,
      phone,
      email,
      date,
      time,
      reason
    });

    res.json({
      success: true,
      message: "Appointment booked successfully",
      appointment
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Get all appointments
router.get("/", async (req, res) => {
  const appointments = await Appointment.find().sort({ createdAt: -1 });
  res.json(appointments);
});

module.exports = router;
