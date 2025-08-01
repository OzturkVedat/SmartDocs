require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Document = require("../models/document.model");
const { extractTextFromPdf } = require("../utils/pdfParser.util");
const { summarizeText, extractKeywords } = require("../services/gemini.service");
const { uploadToS3 } = require("../services/s3.service");

const seedFolderPath = path.join(__dirname, "../seed-docs");
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const seedDocuments = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const files = fs.readdirSync(seedFolderPath).filter((f) => f.endsWith(".pdf"));

  for (const filename of files) {
    const filePath = path.join(seedFolderPath, filename);
    const fileBuffer = fs.readFileSync(filePath);
    const fileStat = fs.statSync(filePath);

    if (fileStat.size > MAX_FILE_SIZE) {
      console.warn(`[SKIPPED] ${filename} is too large`);
      continue;
    }

    try {
      console.log(`[PROCESSING] ${filename}`);
      const { text } = await extractTextFromPdf(fileBuffer);
      const [summary, keywords] = await Promise.all([summarizeText(text), extractKeywords(text)]);
      const s3Url = await uploadToS3({ originalname: filename, buffer: fileBuffer });

      await Document.create({ title: filename, summary, keywords, fileUrl: s3Url });
      console.log(`[SUCCESS] ${filename} added`);
    } catch (err) {
      console.error(`[FAILED] ${filename}`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log("Seeding complete");
};

seedDocuments();
