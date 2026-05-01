const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    clinicId: {
      type: String,
      required: true,
      index: true
    },

    name: { type: String, default: "AI Patient" },

    phone: { type: String, default: "AI" },

    email: { type: String, default: "" },

    date: { type: String, required: true },

    time: { type: String, required: true },

    reason: { type: String, default: "General" },

    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
