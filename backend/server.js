const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const serverless = require("serverless-http");
require("dotenv").config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());

/* ================= API ROUTES ================= */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/text", require("./routes/text"));
app.use("/api/ocr", require("./routes/ocr"));

/* ================= SERVE REACT BUILD (optional for Lambda) ================= */
// You can remove this in Lambda, frontend is in S3
// app.use(express.static(path.join(__dirname, "../build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../build", "index.html"));
// });

/* ================= DB ================= */
let isConnected = false;
async function connectDB() {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB Connected");
  }
}
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

/* ================= EXPORT FOR LAMBDA ================= */
module.exports.handler = serverless(app);
