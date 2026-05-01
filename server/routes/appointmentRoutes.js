const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

/**
 * 📅 CREATE APPOINTMENT (FORM + AI SAFE)
 */
router.post("/book", async (req, res) => {
  try {
    const {
      clinicId,
      name,
      phone,
      email,
      date,
      time,
      reason
    } = req.body;

    // ✅ fallback for old frontend (IMPORTANT)
    const finalClinicId = clinicId || "default_clinic";

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Date and time are required"
      });
    }

    // ❌ block past booking
    const now = new Date();
    const selected = new Date(`${date}T${time}`);

    if (selected < now) {
      return res.status(400).json({
        success: false,
        message: "Cannot book past time"
      });
    }

    // ❌ prevent double booking (per clinic)
    const existing = await Appointment.findOne({
      clinicId: finalClinicId,
      date,
      time
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Slot already booked"
      });
    }

    // ✅ create appointment
    const appointment = await Appointment.create({
      clinicId: finalClinicId,
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
    console.error("BOOK ERROR:", err); // 🔥 IMPORTANT

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

/**
 * 📊 GET ALL APPOINTMENTS
 */
router.get("/", async (req, res) => {
  try {
    const { clinicId } = req.query;

    const filter = clinicId ? { clinicId } : {};

    const appointments = await Appointment.find(filter).sort({
      createdAt: -1
    });

    res.json(appointments);

  } catch (err) {
    console.error("FETCH ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments"
    });
  }
});

module.exports = router;
