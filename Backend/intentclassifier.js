require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch'); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The "System Prompt" is the set of rules the AI must follow.
const SYSTEM_PROMPT = `
You are a Database Intent Classifier for a MongoDB system.
Your job is to analyze the user's request and map it to ONE of the following intents:

1. READ_DB   (Fetching, searching, finding)
2. WRITE_DB  (Creating, adding, inserting)
3. UPDATE_DB (Modifying, changing, editing)
4. DELETE_DB (Removing, deleting)

RULES:
- Return ONLY valid JSON.
- **ALWAYS use the key "data" for the content to be added or updated.**
- **ALWAYS use the key "query" for the filter condition.**

Example READ:
Input: "Find users active is true"
Output: { "intent": "READ_DB", "collection": "users", "query": { "active": true } }

Example WRITE:
Input: "Add a user named John"
Output: { "intent": "WRITE_DB", "collection": "users", "data": { "name": "John" } }

Example UPDATE:
Input: "Update iPhone price to 1200"
Output: { "intent": "UPDATE_DB", "collection": "products", "query": { "name": "iPhone" }, "data": { "price": 1200 } }
`;
async function classifyIntent(userPrompt) {
  try {
    const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", // <--- Add -001 to the end
    systemInstruction: SYSTEM_PROMPT 
},{
    fetch:fetch
});;

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