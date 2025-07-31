const Document = require("../models/document.model");
const { uploadToS3 } = require("../services/s3.service");
const { summarizeText } = require("../services/gemini.service");
const { extractTextFromPdf } = require("../utils/pdfParser.util");

exports.uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const textContent = await extractTextFromPdf(file.buffer);
    const summary = await summarizeText(textContent);

    const s3Url = await uploadToS3(file);

    const newDoc = await Document.create({
      title: file.originalname,
      content: textContent,
      summary,
      fileUrl: s3Url,
    });

    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchDocuments = async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query required" });

  const results = await Document.find({ $text: { $search: query } });
  res.status(200).json({ results });
};

exports.getDocumentById = async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Document not found" });

  res.status(200).json(doc);
};
