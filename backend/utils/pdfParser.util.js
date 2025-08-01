const pdfParse = require("pdf-parse");

exports.extractTextFromPdf = async (buffer) => {
  try {
    const result = await pdfParse(buffer);
    return {
      text: result.text,
    };
  } catch (err) {
    console.error("[PDF PARSE ERROR]", err.message);
    if (err.stack) console.error(err.stack);
    throw new Error("Unexpected error while parsing the doc.");
  }
};
