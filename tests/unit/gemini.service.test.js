const { summarizeText, extractKeywords } = require("../../backend/services/gemini.service");

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: () => ({
      generateContent: jest.fn(() =>
        Promise.resolve({
          response: {
            text: () => Promise.resolve("ai, machine learning, data"),
          },
        })
      ),
    }),
  })),
}));

describe("summarizeText", () => {
  it("should return a summary from Gemini", async () => {
    const input = "Yapay zeka günümüzde birçok alanda kullanılmaktadır.";
    const summary = await summarizeText(input);

    expect(summary).toBe("ai, machine learning, data");
  });
});

describe("extractKeywords", () => {
  it("should return array of keywords from Gemini", async () => {
    const input = "Yapay zeka ve makine öğrenimi, modern teknolojilerin temelini oluşturur.";

    const keywords = await extractKeywords(input);

    expect(Array.isArray(keywords)).toBe(true);
    expect(keywords).toEqual(["ai", "machine learning", "data"]);
  });
});
