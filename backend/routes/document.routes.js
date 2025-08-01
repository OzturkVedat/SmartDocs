const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const documentController = require("../controllers/document.controller");
const authenticateJWT = require("../middlewares/auth.middleware");

router.use(authenticateJWT);

/**
 * @swagger
 * /api/document:
 *   get:
 *     summary: List paginated documents
 *     security:
 *       - bearerAuth: []
 *     tags: [Documents]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Documents per page
 *     responses:
 *       200:
 *         description: Paginated list of documents
 */
router.get("/", documentController.listDocuments);

/**
 * @swagger
 * /api/document/search:
 *   get:
 *     summary: Search documents using natural language query
 *     security:
 *       - bearerAuth: []
 *     tags: [Documents]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Missing or invalid query
 */
router.get("/search", documentController.searchDocuments);

/**
 * @swagger
 * /api/document/{id}:
 *   get:
 *     summary: Get a document by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document found
 *       404:
 *         description: Document not found
 */
router.get("/:id", documentController.getDocumentById);

/**
 * @swagger
 * /api/document/{id}/keywords:
 *   get:
 *     summary: Extract keywords from a document
 *     security:
 *       - bearerAuth: []
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Extracted keywords
 *       404:
 *         description: Document not found
 */
router.get("/:id/keywords", documentController.extractDocumentKeywords);

/**
 * @swagger
 * /api/document:
 *   post:
 *     summary: Upload a PDF document
 *     security:
 *       - bearerAuth: []
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file to upload
 *     responses:
 *       201:
 *         description: Document uploaded and summarized
 *       400:
 *         description: Invalid file or no file uploaded
 *       500:
 *         description: Server error during processing
 */
router.post("/", upload.single("file"), documentController.uploadDocument);

/**
 * @swagger
 * /api/document/{id}:
 *   delete:
 *     summary: Delete a document by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       404:
 *         description: Document not found
 */
router.delete("/:id", documentController.deleteDocument);

module.exports = router;
