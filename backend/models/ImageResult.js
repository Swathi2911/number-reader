const mongoose = require("mongoose");

const ImageResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    numbers: [String],
    summary: {
      total: Number,
      repeated: [
        {
          number: String,
          count: Number,
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImageResult", ImageResultSchema);
