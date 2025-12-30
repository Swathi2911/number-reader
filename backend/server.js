const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());

/* ================= API ROUTES ================= */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/text", require("./routes/text"));
app.use("/api/ocr", require("./routes/ocr"));

/* ================= SERVE REACT BUILD ================= */
app.use(express.static(path.join(__dirname, "../build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

/* ================= DB ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
