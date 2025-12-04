require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("Checking API Key...");
    const result = await model.generateContent("Hello");
    console.log("Success! Model works.");
  } catch (error) {
    console.log("Error details:", error.message);
    if (error.response) {
        console.error("API Response:", await error.response.json());
    }
  }
}

listModels();