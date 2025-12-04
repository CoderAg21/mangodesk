require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The "System Prompt" is the set of rules the AI must follow.
const SYSTEM_PROMPT = `
You are a Database Intent Classifier for a MongoDB system.
Your job is to analyze the user's natural language request and map it to ONE of the following intents:

1. READ_DB   (Fetching, searching, finding, or viewing data)
2. WRITE_DB  (Creating, adding, inserting, or new entries)
3. UPDATE_DB (Modifying, changing, editing, or updating existing data)
4. DELETE_DB (Removing, deleting, erasing, or dropping data)

You must also extract the "target" (what is being manipulated) and any "parameters" (values).

RULES:
- You must return ONLY valid JSON.
- Do not add markdown formatting (like \`\`\`json).
- If the request is unclear or unsafe, return intent: "UNKNOWN".

Example Input: "Add a new user named John Doe with email john@example.com"
Example Output: { "intent": "WRITE_DB", "collection": "users", "data": { "name": "John Doe", "email": "john@example.com" } }

Example Input: "Find all orders over $50"
Example Output: { "intent": "READ_DB", "collection": "orders", "query": "price > 50" }
`;

async function classifyIntent(userPrompt) {
  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT 
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the output just in case the model adds markdown
    const cleanJson = text.replace(/```json|```/g, '').trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Classification Failed:", error);
    return { intent: "ERROR", message: "Could not classify intent." };
  }
}

module.exports = { classifyIntent };