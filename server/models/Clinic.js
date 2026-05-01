const mongoose = require("mongoose");

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    clinicId: { type: String, required: true, unique: true },

    timezone: { type: String, default: "America/Toronto" },

    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "18:00" }
    },

    slotDuration: { type: Number, default: 30 },

    services: {
      type: [String],
      default: ["cleaning", "consultation"]
    },

    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Clinic", clinicSchema);
