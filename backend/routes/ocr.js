const express = require("express");
const Tesseract = require("tesseract.js");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image" });

    const { data } = await Tesseract.recognize(image, "eng");
    res.json({ text: data.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OCR failed" });
  }
});

module.exports = router;
