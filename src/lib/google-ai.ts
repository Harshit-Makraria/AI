const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI('AIzaSyBij2R2KnCNjJ9SNNUgRWtTA67Lf5CIdro');
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
