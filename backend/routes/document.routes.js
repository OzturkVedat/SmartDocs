const express = require("express");
const router = express.Router();
const DocumentController = require("../controllers/document.controller");

router.post("/upload", DocumentController.uploadDocument);
router.get("/search", DocumentController.searchDocuments);

module.exports = router;
