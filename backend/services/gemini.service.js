const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

exports.summarizeText = async (text) => {
  const prompt = `Metni akademik bir dille özetle. Sadece özet içeriğini üret. “İşte özet” gibi ifadeler yazma. En fazla 10 cümle kullan:\n\n${text}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

exports.extractKeywords = async (text) => {
  const prompt = `Metinden en önemli anahtar kelimeleri (en fazla 10) virgülle ayrılmış şekilde çıkar ve bana sadece bu anahtar kelimeleri ver: ${text}`;
  const result = await model.generateContent(prompt);

  const response = await result.response;
  const textOutput = await response.text();
  return textOutput
    .split(/,|\n|;/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
};

exports.rankSummaryByRelevance = async (query, summary) => {
  const prompt = `
Kullanıcının arama sorgusu: "${query}"
Doküman Özeti:
"${summary}"
Bu özet bu aramayla ne kadar alakalı? Yalnızca tek satırda, 0 (alakasız) ile 10 (oldukça alakalı) arasında bir sayı ver. Açıklama yapma. Yanıt sadece sayısal değer olmalı.
`.trim();

  const result = await model.generateContent(prompt);
  const response = await result.response.text();
  console.log("Model response:", response);

  const scoreMatch = response.trim().match(/^([0-9](?:\.[0-9]+)?|10)$/);
  const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
  return score;
};
