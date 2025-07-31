const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    summary: String,
    fileUrl: String,
    keywords: [String],
  },
  { timestamps: true }
);

documentSchema.index({ content: "text", summary: "text", title: "text" });

module.exports = mongoose.model("Document", documentSchema);
