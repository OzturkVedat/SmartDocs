const pdfParse = require("pdf-parse");

exports.extractTextFromPdf = async (buffer) => {
  const result = await pdfParse(buffer);
  return result.text;
};
