const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: String,
    summary: String,
    fileUrl: String,
    keywords: [String],
  },
  { timestamps: true }
);

documentSchema.index({ summary: "text", title: "text" });

module.exports = mongoose.model("Document", documentSchema);
