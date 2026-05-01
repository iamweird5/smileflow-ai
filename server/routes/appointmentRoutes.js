console.log("📅 Appointment routes initialized");

const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

/**
 * TEST ROUTE
 */
router.get("/test", (req, res) => {
  res.json({ message: "Appointment route working" });
});

/**
 * CREATE APPOINTMENT
 */
router.post("/book", async (req, res) => {
  try {
    const { name, phone, email, date, time, reason } = req.body;

    // 🔴 1. BASIC VALIDATION
    if (!name || !phone || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Name, phone, date, and time are required"
      });
    }

    // 🔴 2. BLOCK PAST DATE/TIME
    const now = new Date();
    const selectedDateTime = new Date(`${date}T${time}`);

    if (isNaN(selectedDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date or time format"
      });
    }

    if (selectedDateTime < now) {
      return res.status(400).json({
        success: false,
        message: "Cannot book past date/time"
      });
    }

    // 🔴 3. CHECK SLOT CONFLICT
    const existing = await Appointment.findOne({ date, time });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked"
      });
    }

    // 🔴 4. CREATE APPOINTMENT
    const appointment = await Appointment.create({
      name,
      phone,
      email: email || "",
      date,
      time,
      reason: reason || ""
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment
    });

  } catch (err) {
    console.error("Booking error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * GET ALL APPOINTMENTS
 */
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: appointments.length,
      appointments
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments"
    });
  }
});

module.exports = router;
