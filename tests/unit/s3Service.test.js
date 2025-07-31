const { uploadToS3 } = require("../../backend/services/s3.service");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

jest.mock("@aws-sdk/client-s3", () => {
  const putMock = jest.fn();
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: putMock,
    })),
    PutObjectCommand: jest.fn((params) => params),
  };
});

describe("S3 Service", () => {
  it("should upload file and return URL", async () => {
    const mockFile = {
      originalname: "example.pdf",
      buffer: Buffer.from("test content"),
      mimetype: "application/pdf",
    };

    const url = await uploadToS3(mockFile);

    expect(url).toMatch(/^https?:\/\//);
  });
});
