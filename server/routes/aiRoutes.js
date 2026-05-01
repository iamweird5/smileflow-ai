const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

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
You are an AI receptionist for a dental clinic.

Return ONLY valid JSON. No extra text.

Schema:
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
- If missing info → ask_question
- If booking → create_appointment
- If unsafe → reject
- Use natural language dates like "tomorrow"
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

    // 🧠 SAFETY CHECK 1
    if (!data?.choices?.[0]?.message?.content) {
      console.error("OpenAI bad response:", data);

      return res.json({
        success: false,
        reply: "AI service unavailable"
      });
    }

    const content = data.choices[0].message.content;

    let parsed;

    // 🧠 SAFETY CHECK 2 (VERY IMPORTANT)
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error("JSON parse failed:", content);

      return res.json({
        success: false,
        reply: content // fallback: show raw AI text
      });
    }

    const { tool, data: info, message: aiMessage } = parsed;

    if (tool === "ask_question") {
      return res.json({
        success: false,
        reply: aiMessage
      });
    }

    if (tool === "reject") {
      return res.json({
        success: false,
        reply: aiMessage
      });
    }

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
        reply: "Appointment booked successfully",
        appointment
      });
    }

    return res.json({
      success: false,
      reply: "Unknown AI action"
    });

  } catch (err) {
    console.error("AI ERROR:", err);

    return res.status(500).json({
      success: false,
      reply: "AI service error"
    });
  }
});

module.exports = router;
