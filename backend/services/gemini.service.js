const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.summarizeText = async (text) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent(`Lütfen bu metni özetle (en fazla 10 cümle olsun): ${text}`);
  const response = await result.response;
  return response.text();
};

exports.extractKeywords = async (text) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Metinden en önemli anahtar kelimeleri (en fazla 10) virgülle ayrılmış şekilde çıkar: ${text}`;
  const result = await model.generateContent(prompt);

  const response = await result.response;
  const textOutput = await response.text();
  return textOutput.split(",").map((k) => k.trim());
};
