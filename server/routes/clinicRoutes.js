const express = require("express");
const router = express.Router();
const Clinic = require("../models/Clinic");

/**
 * 🏢 CREATE CLINIC (ONBOARDING)
 */
router.post("/create", async (req, res) => {
  try {
    const { name, clinicId } = req.body;

    if (!name || !clinicId) {
      return res.status(400).json({
        success: false,
        message: "Name and clinicId required"
      });
    }

    const existing = await Clinic.findOne({ clinicId });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Clinic already exists"
      });
    }

    const clinic = await Clinic.create({
      name,
      clinicId
    });

    res.json({
      success: true,
      clinic
    });

  } catch (err) {
    console.error("CREATE CLINIC ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to create clinic"
    });
  }
});

/**
 * 🔍 GET CLINIC
 */
router.get("/:clinicId", async (req, res) => {
  try {
    const clinic = await Clinic.findOne({
      clinicId: req.params.clinicId
    });

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found"
      });
    }

    res.json(clinic);

  } catch (err) {
    console.error("GET CLINIC ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Error fetching clinic"
    });
  }
});

module.exports = router;
