const httpMocks = require("node-mocks-http");
const DocumentController = require("../../backend/controllers/document.controller");

jest.mock("../../backend/services/gemini.service", () => ({
  summarizeText: jest.fn().mockResolvedValue("mock summary"),
}));

jest.mock("../../backend/services/s3.service", () => ({
  uploadToS3: jest.fn().mockResolvedValue("https://mock-s3-url.com/file.pdf"),
}));

jest.mock("../../backend/utils/pdfParser.util", () => ({
  extractTextFromPdf: jest.fn().mockResolvedValue("mock content"),
}));

jest.mock("../../backend/models/document.model", () => ({
  create: jest.fn().mockResolvedValue({
    _id: "doc123",
    title: "test.pdf",
    content: "mock content",
    summary: "mock summary",
    fileUrl: "https://mock-s3-url.com/file.pdf",
  }),
}));

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
});
