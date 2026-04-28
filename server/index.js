const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Stripe = require("stripe");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const stripe = Stripe(process.env.STRIPE_SECRET);

// ---------------- DB ----------------
mongoose.connect(process.env.MONGO_URI);

const Appointment = mongoose.model("Appointment", new mongoose.Schema({
  clinicId: String,
  name: String,
  phone: String,
  service: String,
  date: String,
  time: String
}));

const Clinic = mongoose.model("Clinic", new mongoose.Schema({
  name: String,
  email: String
}));

// ---------------- AI CHAT ----------------
app.post("/chat", async (req, res) => {
  const { message, clinicId } = req.body;

  const clinic = await Clinic.findById(clinicId);

  const ai = await fetch("https://api.openai.com/v1/chat/completions", {
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
          content: `You are Maya, a warm dental receptionist for ${clinic?.name || "a clinic"}.
Collect: name, phone, service, date, time.
If complete, respond as:
BOOKING:{json}`
        },
        { role: "user", content: message }
      ]
    })
  });

  const data = await ai.json();
  const reply = data.choices[0].message.content;

  if (reply.includes("BOOKING:")) {
    const json = JSON.parse(reply.replace("BOOKING:", ""));

    await Appointment.create({ ...json, clinicId });

    return res.json({ reply: "Booked successfully 🎉 We'll see you soon!" });
  }

  res.json({ reply });
});

// ---------------- STRIPE ----------------
app.post("/create-checkout", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{
      price: process.env.PRICE_ID,
      quantity: 1
    }],
    success_url: "https://your-frontend-url.com/success",
    cancel_url: "https://your-frontend-url.com"
  });

  res.json({ url: session.url });
});

app.listen(5000, () => console.log("Server running"));
