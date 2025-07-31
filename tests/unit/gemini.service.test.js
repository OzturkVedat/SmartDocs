const { summarizeText } = require("../../backend/services/gemini.service");

jest.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: jest.fn(() =>
          Promise.resolve({
            response: {
              text: () => Promise.resolve("This is a test summary."),
            },
          })
        ),
      }),
    })),
  };
});

describe("summarizeText", () => {
  it("should return a summary from Gemini", async () => {
    const input = "Yapay zeka günümüzde birçok alanda kullanılmaktadır.";
    const summary = await summarizeText(input);

    expect(summary).toBe("This is a test summary.");
  });
});
