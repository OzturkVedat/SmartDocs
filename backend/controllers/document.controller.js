const Document = require("../models/document.model");
const { uploadToS3, deleteFromS3 } = require("../services/s3.service");
const { summarizeText, extractKeywords } = require("../services/gemini.service");
const { extractTextFromPdf } = require("../utils/pdfParser.util");

exports.getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.status(200).json(doc);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.listDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const documents = await Document.find({}).select("title summary fileUrl createdAt").sort({ createdAt: -1 }).skip(skip).limit(limit);

    const total = await Document.countDocuments();

    res.status(200).json({
      page,
      totalPages: Math.ceil(total / limit),
      totalDocs: total,
      documents,
    });
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "Failed to list documents" });
  }
};

exports.searchDocuments = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query required" });

    const results = await Document.find({ $text: { $search: query } });
    res.status(200).json({ results });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.extractDocumentKeywords = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const keywords = await extractKeywords(doc.content);

    res.status(200).json({ id: doc._id, keywords });
  } catch (err) {
    console.error("Keyword extraction error:", err);
    res.status(500).json({ error: "Failed to extract keywords" });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (file.mimetype !== "application/pdf") return res.status(400).json({ error: "Only PDF files allowed" });

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) return res.status(400).json({ error: "PDF file is too large (max 5MB)." });

    const { text, pageCount } = await extractTextFromPdf(file.buffer);
    if (pageCount > 30) return res.status(400).json({ error: "PDF has too many pages (max 30)." });

    const summary = await summarizeText(text);
    const s3Url = await uploadToS3(file);

    const newDoc = await Document.create({
      title: file.originalname,
      content: text,
      summary,
      fileUrl: s3Url,
    });

    res.status(201).json({
      id: newDoc._id,
      title: newDoc.title,
      summary: newDoc.summary,
      fileUrl: newDoc.fileUrl,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    await deleteFromS3(doc.fileUrl);
    await doc.deleteOne();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete document" });
  }
};
