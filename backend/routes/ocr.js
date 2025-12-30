const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const ImageResult = require("../models/ImageResult");

/* SAVE IMAGE OCR RESULT */
router.post("/save", auth, async (req, res) => {
  try {
    const { numbers, summary } = req.body;

    if (!Array.isArray(numbers) || !summary) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    await ImageResult.create({
      userId: req.user.id,
      numbers,
      summary,
    });

    res.json({ message: "Image result saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving image result" });
  }
});

module.exports = router;
