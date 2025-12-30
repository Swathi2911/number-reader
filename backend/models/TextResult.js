const mongoose = require("mongoose");

const TextResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    half: String,
    full: String,
    result: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TextResult", TextResultSchema);
