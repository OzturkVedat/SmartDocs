const fs = require("fs");
const path = require("path");
const { extractTextFromPdf } = require("../../backend/utils/pdfParser.util");

describe("PDF Parser", () => {
  it("should extract text from a PDF buffer", async () => {
    const filePath = path.join(__dirname, "../mock/test.pdf");
    const buffer = fs.readFileSync(filePath);

    const text = await extractTextFromPdf(buffer);
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(10);
  });
});
