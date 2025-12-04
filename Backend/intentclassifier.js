require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch'); // Keeping this as you needed it for network issues

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. DATASET KNOWLEDGE BASE
// We explicitly tell the AI your exact CSV column names here.
const EMPLOYEE_SCHEMA = `
CONTEXT: You are managing an Employee Database.
COLLECTION NAME: 'employees'

AVAILABLE FIELDS (Exact Column Names):
- IDENTIFIERS: employee_id, name, department, role, country, office_location
- DATES: hire_date, termination_date
- FINANCIALS: salary_usd, bonus_usd, stock_options (All in USD)
- METRICS: performance_score (1-5 scale), promotion_count, project_count
- SALES DATA: deals_closed, avg_deal_size_usd, client_revenue_usd
- WORK STYLE: customer_satisfaction, work_hours_per_week, remote_percentage
`;

// 2. STRICT RULES FOR THE AI
const SYSTEM_PROMPT = `
You are a Database Intent Classifier.
${EMPLOYEE_SCHEMA}

YOUR JOB:
1. Analyze the user prompt.
2. Return a JSON object with the user's intent and valid MongoDB parameters.

RULES:
- **Keys:** Use ONLY these keys in your JSON:
  - "intent": One of [READ_DB, WRITE_DB, UPDATE_DB, DELETE_DB]
  - "collection": Always "employees" (unless user explicitly asks for 'users' system)
  - "query": The filter criteria (The "Who" or "Which")
  - "data": The data to be inserted or updated (The "What")

- **Mapping:**
  - If user says "salary" or "income" -> map to 'salary_usd'
  - If user says "rating" or "score" -> map to 'performance_score'
  - If user says "remote" -> map to 'remote_percentage'
  - If user says "revenue" -> map to 'client_revenue_usd'

- **Format:**
  - Return RAW JSON only. Do not wrap in markdown like \`\`\`json.

EXAMPLES:
Input: "Find everyone in Sales with a rating over 4"
Output: { "intent": "READ_DB", "collection": "employees", "query": { "department": "Sales", "performance_score": { "$gt": 4 } } }

Input: "Update John Doe's salary to 80,000"
Output: { "intent": "UPDATE_DB", "collection": "employees", "query": { "name": "John Doe" }, "data": { "salary_usd": 80000 } }
`;

async function classifyIntent(userPrompt) {
  try {
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash", // Using the fast model you verified works
        systemInstruction: SYSTEM_PROMPT 
    }, { fetch: fetch });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const text = response.text();

    // Cleanup: Remove any potential markdown formatting the AI adds
    const cleanJson = text.replace(/```json|```/g, '').trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Classification Failed:", error);
    // Return a structured error so your app doesn't crash
    return { intent: "ERROR", message: "Could not classify intent." };
  }
}

module.exports = { classifyIntent };