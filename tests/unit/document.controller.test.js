const httpMocks = require("node-mocks-http");
const DocumentController = require("../../backend/controllers/document.controller");

jest.mock("../../backend/services/gemini.service", () => ({
  summarizeText: jest.fn().mockResolvedValue("mock summary"),
  extractKeywords: jest.fn().mockResolvedValue(["ai", "doc", "summary"]),
  rankSummaryByRelevance: jest.fn().mockResolvedValue(7),
}));

jest.mock("../../backend/services/s3.service", () => ({
  uploadToS3: jest.fn().mockResolvedValue("https://mock-s3-url.com/file.pdf"),
  deleteFromS3: jest.fn().mockResolvedValue({}),
  getSignedS3Url: jest.fn().mockResolvedValue("https://signed-url.com/test.pdf"),
}));

jest.mock("../../backend/utils/pdfParser.util", () => ({
  extractTextFromPdf: jest.fn().mockResolvedValue({ text: "mock content" }),
}));

jest.mock("../../backend/models/document.model", () => {
  const originalModule = jest.requireActual("../../backend/models/document.model");
  return {
    ...originalModule,
    findById: jest.fn(),
    find: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([
      { _id: "doc1", title: "Doc 1", summary: "Summary 1", fileUrl: "url1" },
      { _id: "doc2", title: "Doc 2", summary: "Summary 2", fileUrl: "url2" },
    ]),
    countDocuments: jest.fn().mockResolvedValue(2),
  };
});

const { findById } = require("../../backend/models/document.model");

describe("extractDocumentKeywords", () => {
  it("should return keywords from document content", async () => {
    findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({
        _id: "doc123",
        summary: "This is a test summary.",
      }),
    });

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
    findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue(null),
    });

    const req = httpMocks.createRequest({ params: { id: "unknown" } });
    const res = httpMocks.createResponse();

    await DocumentController.extractDocumentKeywords(req, res);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: "Document not found" });
  });

  it("should return 400 if document has no summary", async () => {
    findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({
        _id: "doc123",
        summary: "",
      }),
    });

    const req = httpMocks.createRequest({ params: { id: "doc123" } });
    const res = httpMocks.createResponse();

    await DocumentController.extractDocumentKeywords(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: "Document has no summary to extract keywords from.",
    });
  });
});
