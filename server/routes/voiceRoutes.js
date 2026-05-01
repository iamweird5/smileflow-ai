const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

/**
 * 📞 VOICE RECEPTIONIST (Twilio webhook)
 * Receives spoken input converted to text
 */
router.post("/book-voice", async (req, res) => {
  try {
    const speech = req.body.SpeechResult;

    if (!speech) {
      return res.send("Sorry, I didn't catch that.");
    }

    const text = speech.toLowerCase();

    // 🧠 Extract date & time
    const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
    const timeMatch = text.match(/\d{1,2}:\d{2}/);

    if (!dateMatch || !timeMatch) {
      return res.send(
        "Please say your appointment like: 2026-05-10 at 14:30"
      );
    }

    const date = dateMatch[0];
    const time = timeMatch[0];

    // ❌ prevent past booking
    const now = new Date();
    const selected = new Date(`${date}T${time}`);

    if (selected < now) {
      return res.send("You cannot book a past time slot.");
    }

    // ❌ check conflict
    const existing = await Appointment.findOne({ date, time });

    if (existing) {
      return res.send("That slot is already booked.");
    }

    // ✅ create appointment
    await Appointment.create({
      name: "Phone Caller",
      phone: "VOICE",
      email: "",
      date,
      time,
      reason: "Booked via phone call"
    });

    return res.send(
      `Your appointment is confirmed for ${date} at ${time}`
    );

  } catch (err) {
    console.error(err);
    return res.send("Server error occurred.");
  }
});

module.exports = router;
