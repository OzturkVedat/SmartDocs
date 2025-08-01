const httpMocks = require("node-mocks-http");
const DocumentController = require("../../backend/controllers/document.controller");

// Mocks
jest.mock("../../backend/services/gemini.service", () => ({
  summarizeText: jest.fn().mockResolvedValue("mock summary"),
  extractKeywords: jest.fn().mockResolvedValue(["ai", "doc", "summary"]),
}));

jest.mock("../../backend/services/s3.service", () => ({
  uploadToS3: jest.fn().mockResolvedValue("https://mock-s3-url.com/file.pdf"),
  deleteFromS3: jest.fn().mockResolvedValue({}),
}));

jest.mock("../../backend/utils/pdfParser.util", () => ({
  extractTextFromPdf: jest.fn().mockResolvedValue("mock content"),
}));

jest.mock("../../backend/models/document.model", () => {
  const originalModule = jest.requireActual("../../backend/models/document.model");

  return {
    ...originalModule,
    create: jest.fn().mockResolvedValue({
      _id: "doc123",
      title: "test.pdf",
      content: "mock content",
      summary: "mock summary",
      fileUrl: "https://mock-s3-url.com/file.pdf",
    }),
    findById: jest.fn().mockResolvedValue({
      _id: "doc123",
      title: "test.pdf",
      content: "mock content",
      fileUrl: "https://mock-s3-url.com/file.pdf",
      deleteOne: jest.fn().mockResolvedValue({}),
    }),
    find: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([
      {
        _id: "doc1",
        title: "Doc 1",
        summary: "Summary 1",
        fileUrl: "url1",
      },
      {
        _id: "doc2",
        title: "Doc 2",
        summary: "Summary 2",
        fileUrl: "url2",
      },
    ]),
    countDocuments: jest.fn().mockResolvedValue(2),
  };
});

// === UPLOAD TEST ===
describe("uploadDocument", () => {
  it("should return 201 and new document", async () => {
    const file = {
      originalname: "test.pdf",
      buffer: Buffer.from("mock file buffer"),
      mimetype: "application/pdf",
    };

    const req = httpMocks.createRequest({
      method: "POST",
      url: "/api/documents/upload",
      file,
    });

    const res = httpMocks.createResponse();

    await DocumentController.uploadDocument(req, res);

    expect(res.statusCode).toBe(201);
    const json = res._getJSONData();
    expect(json.title).toBe("test.pdf");
    expect(json.summary).toBe("mock summary");
    expect(json.fileUrl).toContain("mock-s3-url");
  });

  it("should return 400 if no file is provided", async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await DocumentController.uploadDocument(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: "No file uploaded" });
  });

  it("should return 400 if file is not a PDF", async () => {
    const file = {
      originalname: "test.docx",
      buffer: Buffer.from("mock file buffer"),
      mimetype: "application/msword",
    };

    const req = httpMocks.createRequest({ file });
    const res = httpMocks.createResponse();

    await DocumentController.uploadDocument(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: "Only PDF files allowed" });
  });
});

// === LIST DOCUMENTS TEST ===
describe("listDocuments", () => {
  it("should return paginated list of documents", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
      query: { page: "1", limit: "2" },
    });

    const res = httpMocks.createResponse();

    await DocumentController.listDocuments(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.documents.length).toBe(2);
    expect(data.page).toBe(1);
    expect(data.totalPages).toBe(1);
  });
});

// === KEYWORD EXTRACTION TEST ===
describe("extractDocumentKeywords", () => {
  it("should return keywords from document content", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
      params: { id: "doc123" },
    });
    const res = httpMocks.createResponse();

    await DocumentController.extractDocumentKeywords(req, res);

    expect(res.statusCode).toBe(200);
    const data = res._getJSONData();
    expect(data.keywords).toContain("summary");
    expect(data.id).toBe("doc123");
  });

  it("should return 404 if document not found", async () => {
    const { findById } = require("../../backend/models/document.model");
    findById.mockResolvedValueOnce(null);

    const req = httpMocks.createRequest({ params: { id: "unknown" } });
    const res = httpMocks.createResponse();

    await DocumentController.extractDocumentKeywords(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: "Document not found" });
  });
});

// === DELETE DOCUMENT TEST ===
describe("deleteDocument", () => {
  it("should delete document and return success", async () => {
    const req = httpMocks.createRequest({ params: { id: "doc123" } });
    const res = httpMocks.createResponse();

    await DocumentController.deleteDocument(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ message: "Document deleted successfully" });
  });

  it("should return 404 if document not found", async () => {
    const { findById } = require("../../backend/models/document.model");
    findById.mockResolvedValueOnce(null);

    const req = httpMocks.createRequest({ params: { id: "nonexistent" } });
    const res = httpMocks.createResponse();

    await DocumentController.deleteDocument(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: "Document not found" });
  });
});
