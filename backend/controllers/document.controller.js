const Document = require("../models/document.model");
const { uploadToS3, getSignedS3Url, deleteFromS3 } = require("../services/s3.service");
const { summarizeText, extractKeywords, rankSummaryByRelevance } = require("../services/gemini.service");
const { extractTextFromPdf } = require("../utils/pdfParser.util");

exports.getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const key = extractKeyFromS3Url(doc.fileUrl);
    const signedUrl = await getSignedS3Url(key);

    res.status(200).json({ ...doc.toObject(), fileUrl: signedUrl });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: err.message });
  }
};

function extractKeyFromS3Url(url) {
  const parts = url.split(".amazonaws.com/");
  return parts[1]; // after the domain
}

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

    const batchSize = 100;
    const maxDocsToConsider = 500;

    let skip = 0;
    let allRanked = [];

    while (skip < maxDocsToConsider) {
      // Fetch batch
      const docs = await Document.find().select("_id title summary").sort({ createdAt: -1 }).skip(skip).limit(batchSize);
      if (docs.length === 0) break; // No more docs

      const ranked = await Promise.allSettled(
        docs.map(async (doc) => {
          const summary = doc.summary?.trim() || "Bu dokümanın özeti mevcut değil.";
          const score = await rankSummaryByRelevance(query, summary);
          return {
            id: doc._id,
            title: doc.title,
            summary,
            relevance: score,
          };
        })
      );

      const successful = ranked.filter((r) => r.status === "fulfilled").map((r) => r.value);
      allRanked.push(...successful);
      skip += batchSize;
    }

    allRanked.sort((a, b) => b.relevance - a.relevance);
    allRanked = allRanked.filter((item) => item.relevance > 0); // filter out the irrelevants

    res.status(200).json({
      query,
      results: allRanked.slice(0, 10),
    });
  } catch (err) {
    console.error("Semantic search error:", err.message);
    res.status(500).json({ error: "Failed to perform semantic search." });
  }
};

exports.extractDocumentKeywords = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id).select("summary");
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const baseText = doc.summary?.trim();
    if (!baseText) return res.status(400).json({ error: "Document has no summary to extract keywords from." });

    const keywords = await extractKeywords(baseText);

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

    const { text } = await extractTextFromPdf(file.buffer);

    const [summary, keywords] = await Promise.all([summarizeText(text), extractKeywords(text)]);
    const s3Url = await uploadToS3(file);

    const newDoc = await Document.create({
      title: file.originalname,
      summary,
      keywords,
      fileUrl: s3Url,
    });

    res.status(201).json({ message: "Doküman yüklendi", newDoc });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Server error while uploading." });
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
