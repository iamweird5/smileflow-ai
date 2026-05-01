
const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

/**
 * 🧠 AI AGENT (SaaS VERSION)
 */

router.post("/chat", async (req, res) => {
  try {
    const { message, clinicId } = req.body;

    if (!message || !clinicId) {
      return res.status(400).json({
        success: false,
        reply: "Missing message or clinicId"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
You are a SaaS AI receptionist for dental clinics.

Return ONLY JSON:

{
  "tool": "create_appointment | ask_question | reject",
  "data": {
    "date_text": "",
    "time_text": "",
    "reason": ""
  },
  "message": ""
}

Rules:
- Use natural language (tomorrow, next Friday, etc.)
- Do NOT format dates
- If missing info → ask_question
- If valid → create_appointment
`
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return res.json({
        success: false,
        reply: "AI failed"
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      return res.json({
        success: false,
        reply: "Invalid AI response"
      });
    }

    const { tool, data: info, message: aiMessage } = parsed;

    // ASK QUESTION
    if (tool === "ask_question") {
      return res.json({
        success: false,
        reply: aiMessage
      });
    }

    // REJECT
    if (tool === "reject") {
      return res.json({
        success: false,
        reply: aiMessage
      });
    }

    // CREATE APPOINTMENT
    if (tool === "create_appointment") {
      const appointment = await Appointment.create({
        clinicId,
        name: "AI Patient",
        phone: "AI",
        date: info?.date_text || "TBD",
        time: info?.time_text || "TBD",
        reason: info?.reason || "General"
      });

      return res.json({
        success: true,
        reply: "Appointment booked",
        appointment
      });
    }

    return res.json({
      success: false,
      reply: "Unknown tool"
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      reply: "Server error"
    });
  }
});

module.exports = router;
