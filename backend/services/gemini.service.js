const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.summarizeText = async (text) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent([{ role: "user", parts: [`Lütfen bu metni özetle: ${text}`] }]);

  const response = await result.response;
  return response.text();
};
