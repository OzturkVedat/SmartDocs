process.env.S3_BUCKET_NAME = "mock-bucket";

const mockSend = jest.fn();

jest.mock("@aws-sdk/client-s3", () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: mockSend,
    })),
    PutObjectCommand: jest.fn((params) => params),
    DeleteObjectCommand: jest.fn((params) => params),
  };
});

// Mock'tan sonra getirt
const { uploadToS3, deleteFromS3 } = require("../../backend/services/s3.service");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

describe("S3 Service", () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  describe("uploadToS3", () => {
    it("should upload file and return URL", async () => {
      mockSend.mockResolvedValueOnce({});

      const mockFile = {
        originalname: "example.pdf",
        buffer: Buffer.from("test content"),
        mimetype: "application/pdf",
      };
      const url = await uploadToS3(mockFile);

      expect(url).toMatch(/^https?:\/\//);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(PutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: "mock-bucket",
          Key: expect.any(String),
          ACL: "public-read",
          ContentType: "application/pdf",
        })
      );
    });

    it("should throw error if file is null", async () => {
      await expect(uploadToS3(null)).rejects.toThrow();
    });
  });

  describe("deleteFromS3", () => {
    it("should delete file from S3", async () => {
      mockSend.mockResolvedValueOnce({});
      const fileUrl = "https://my-bucket.s3.amazonaws.com/test-folder/test.pdf";
      await deleteFromS3(fileUrl);

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(DeleteObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Bucket: expect.any(String),
          Key: "test-folder/test.pdf",
        })
      );
    });

    it("should throw error if URL is invalid", async () => {
      await expect(deleteFromS3("invalid-url")).rejects.toThrow();
    });
  });
});
