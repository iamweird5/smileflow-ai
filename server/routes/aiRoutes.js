const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

/**
 * 🤖 AI RECEPTIONIST (TEXT VERSION v1)
 * Input: natural language message
 * Output: booking or response
 */

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const text = message.toLowerCase();

    // 🧠 SIMPLE EXTRACTION (MVP AI LOGIC)
    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
    const timeMatch = text.match(/\d{1,2}:\d{2}/);

    const date = dateMatch?.[0];
    const time = timeMatch?.[0];

    if (!date || !time) {
      return res.json({
        success: false,
        reply: "Please send date in YYYY-MM-DD and time like 14:30"
      });
    }

    // ❌ BLOCK PAST BOOKINGS
    const now = new Date();
    const selected = new Date(`${date}T${time}`);

    if (selected < now) {
      return res.json({
        success: false,
        reply: "You cannot book past time slots."
      });
    }

    // ❌ SLOT CHECK
    const existing = await Appointment.findOne({ date, time });

    if (existing) {
      return res.json({
        success: false,
        reply: "This slot is already booked."
      });
    }

    // ✅ CREATE BOOKING
    const appointment = await Appointment.create({
      name: "AI Patient",
      phone: "AI",
      email: "",
      date,
      time,
      reason: "Booked via AI receptionist"
    });

    return res.json({
      success: true,
      reply: `Booked successfully for ${date} at ${time}`,
      appointment
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      reply: "AI error"
    });
  }
});

module.exports = router;
