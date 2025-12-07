// Backend/services/intentClassifier.js - UPDATED for Batch & Aggregation (CLEANED)

require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. DATASET KNOWLEDGE BASE
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
- SYNTHETIC: age, gender, education, experience_years
`;

// 2. STRICT RULES FOR THE AI - CRITICALLY UPDATED
const SYSTEM_PROMPT = `
You are a highly advanced Conversational Database Agent.
${EMPLOYEE_SCHEMA}

YOUR JOB:
1. Analyze the user prompt.
2. Determine if the request requires one operation or a sequence of operations (e.g., Delete THEN Read).
3. Determine if the request is a standard CRUD or an **AGGREGATION** (e.g., AVG, SUM, COUNT, GROUP BY).
4. Return a **JSON ARRAY** of operations.

RULES:
- **Output Format:** You MUST return a **JSON ARRAY** containing one or more operation objects.
- **Intent Types:** Intents are one of: [READ_DB, WRITE_DB, UPDATE_DB, DELETE_DB, **AGGREGATE_DB**].
- **Batching:** If a WRITE_DB request involves multiple items, the 'data' field MUST be an **ARRAY of objects**.

- **Keys (for all intents):**
  - "intent": (One of the types above)
  - "collection": Always "employees"
- **Keys (for CRUD):**
  - "query": The filter criteria (The "Who" or "Which")
  - "data": The data to be inserted/updated (The "What"). Use ARRAY for batch inserts.
- **Keys (for AGGREGATE):**
  - "pipeline": An ARRAY of MongoDB Aggregation Stages.

- **Relative Updates/Multiplication:** - For simple increments (e.g., "increase by 5000"), use the **$inc** operator in the 'data' field: \`{"$inc": {"salary_usd": 5000}}\`.
  - For percentage increases (e.g., "increase salary by 15%"), use the **$mul** operator in the 'data' field. The AI must calculate the multiplier (e.g., 1.15): \`{"$mul": {"salary_usd": 1.15}}\`.

- **Aggregation:** If the prompt asks for metrics (AVG, SUM, COUNT), use the **"AGGREGATE_DB"** intent and provide the full MongoDB **"pipeline"**.
- **Global Wipe:** If the user explicitly asks to 'Delete ALL employees', include the key "confirm_global_wipe": true in the query object.

- **Format:** Return RAW JSON Array only. Do not wrap in markdown like \`\`\`json.

EXAMPLES:
Input: "Find all managers, then increase their salary by 5% and give me the new average salary for them."
Output: 
[
  { "intent": "UPDATE_DB", "collection": "employees", "query": { "role": "Manager" }, "data": { "$mul": { "salary_usd": 1.05 } } },
  { "intent": "AGGREGATE_DB", "collection": "employees", "pipeline": [ { "$match": { "role": "Manager" } }, { "$group": { "_id": null, "avg_salary": { "$avg": "$salary_usd" } } } ] }
]

Input: "Add Jane Smith (Sales, $70k) and Tom Brown (HR, $60k)."
Output:
[
  { 
    "intent": "WRITE_DB", 
    "collection": "employees", 
    "data": [
      { "name": "Jane Smith", "department": "Sales", "salary_usd": 70000 },
      { "name": "Tom Brown", "department": "HR", "salary_usd": 60000 }
    ]
  }
]
`;

async function classifyIntent(userPrompt) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash", 
            systemInstruction: SYSTEM_PROMPT 
        }, { fetch: fetch });

        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const text = response.text();

        // Cleanup: Remove any potential markdown formatting
        const cleanJson = text.replace(/```json|```/g, '').trim();
        
        // CRITICAL: The output is now expected to be an array of operations
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("AI Classification Failed:", error);
        // Return a structured error to avoid crashing the app
        return [{ intent: "ERROR", message: "Could not classify intent." }];
    }
}

module.exports = { classifyIntent };