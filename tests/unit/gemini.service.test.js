const mockGeminiResponse = (mockText) => {
  jest.resetModules();

  jest.doMock("@google/generative-ai", () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: jest.fn(() =>
          Promise.resolve({
            response: {
              text: () => Promise.resolve(mockText),
            },
          })
        ),
      }),
    })),
  }));
};

describe("Gemini Service", () => {
  beforeEach(() => {
    jest.resetModules(); //  clear previous mocks
  });

  describe("summarizeText", () => {
    it("should return a summary from Gemini", async () => {
      mockGeminiResponse("ai, machine learning, data");
      const { summarizeText } = require("../../backend/services/gemini.service");

      const input = "Yapay zeka günümüzde birçok alanda kullanılmaktadır.";
      const summary = await summarizeText(input);

      expect(summary).toBe("ai, machine learning, data");
    });
  });

  describe("extractKeywords", () => {
    it("should return array of keywords from Gemini", async () => {
      mockGeminiResponse("ai, machine learning, data");
      const { extractKeywords } = require("../../backend/services/gemini.service");

      const input = "Yapay zeka ve makine öğrenimi, modern teknolojilerin temelini oluşturur.";
      const keywords = await extractKeywords(input);

      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords).toEqual(["ai", "machine learning", "data"]);
    });

    it("should return an empty array when Gemini response is empty", async () => {
      mockGeminiResponse(" , , , ");
      const { extractKeywords } = require("../../backend/services/gemini.service");

      const keywords = await extractKeywords("dummy input");
      expect(keywords).toEqual([]);
    });
  });

  describe("rankSummaryByRelevance", () => {
    it("should return a numeric relevance score from 0 to 10", async () => {
      mockGeminiResponse("8");
      const { rankSummaryByRelevance } = require("../../backend/services/gemini.service");

      const score = await rankSummaryByRelevance("query", "summary");
      expect(score).toBe(8);
    });

    it("should return 0 if response is not a valid number", async () => {
      mockGeminiResponse("not a number");
      const { rankSummaryByRelevance } = require("../../backend/services/gemini.service");

      const score = await rankSummaryByRelevance("query", "summary");
      expect(score).toBe(0);
    });
  });
});
