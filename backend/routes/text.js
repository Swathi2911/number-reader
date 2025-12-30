const router = require("express").Router();
const auth = require("../middleware/auth");
const TextResult = require("../models/TextResult");

/* SAVE TEXT RESULT */
router.post("/save", auth, async (req, res) => {
  try {
    const { half, full, result } = req.body;

    await TextResult.create({
      userId: req.user.id,
      half,
      full,
      result,
    });

    res.json({ message: "Text result saved" });
  } catch (err) {
    res.status(500).json({ message: "Error saving text result" });
  }
});

module.exports = router;
