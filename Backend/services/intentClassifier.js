// Backend/services/intentClassifier.js - UPDATED for Confirmation/Guardrail

require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. DATASET KNOWLEDGE BASE (Same)
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

// 2. STRICT RULES FOR THE AI - CRITICALLY UPDATED FOR CONFIRMATION AND GUARDRAIL
const SYSTEM_PROMPT = `
You are a highly advanced, STATEFUL Conversational Database Agent.
${EMPLOYEE_SCHEMA}

YOUR JOB:
1. Analyze the user prompt AND the conversation history (context).
2. If the user prompt uses relative terms like "these employees", "them", or "that group", **APPLY THE LAST FILTER/PIPELINE from the context to the new query/pipeline.**
3. If the user uses a vague or ambiguous field name, return the **AMBIGUOUS_QUERY** intent.
4. If the user asks a non-database related question (e.g., general knowledge, math, company history), return the **NON_DB_QUERY** intent.
5. Return a JSON ARRAY of operations.

RULES:
- **Output Format:** You MUST return a **JSON ARRAY** containing one or more operation objects.
- **Intent Types:** Intents are one of: [READ_DB, WRITE_DB, UPDATE_DB, DELETE_DB, AGGREGATE_DB, **AMBIGUOUS_QUERY**, **DELETE_ALL**, **NON_DB_QUERY**].
- **Batching:** If a WRITE_DB request involves multiple items, the 'data' field MUST be an **ARRAY of objects**.

- **Keys (for all intents):**
  - "intent": (One of the types above)
  - "collection": Always "employees"
  
- **Keys (for AMBIGUOUS_QUERY only):**
  - "intent": "AMBIGUOUS_QUERY"
  - "suggestions": An array of strings with the correct column names that match the ambiguous term.

- **Keys (for NON_DB_QUERY only):**
  - "intent": "NON_DB_QUERY"

- **Relative Updates/Multiplication:** - For simple increments (e.g., "increase by 5000"), use the **$inc** operator in the 'data' field.
  - For percentage increases (e.g., "increase salary by 15%"), use the **$mul** operator in the 'data' field.

- **Aggregation:** If the prompt asks for metrics (AVG, SUM, COUNT), use the **"AGGREGATE_DB"** intent and provide the full MongoDB **"pipeline"**.

- **Global Wipe:** If the user explicitly asks to 'Delete ALL employees' or similar phrases, use the **"DELETE_ALL"** intent.
  - **Do NOT use DELETE_DB for a full wipe.** The controller will handle confirmation.

- **Format:** Return RAW JSON Array only. Do not wrap in markdown like \`\`\`json.

EXAMPLES (Global Wipe):
Input: "Wipe the entire database."
Output:
[
  { "intent": "DELETE_ALL", "collection": "employees" }
]

EXAMPLES (Non-DB Query):
Input: "Who is the CEO of this company?"
Output:
[
  { "intent": "NON_DB_QUERY" }
]

EXAMPLES (Contextual):
Context: {"lastAction":"find","lastFilter":{"country":"USA","role":"Engineer"}}
Input: "What is their average salary?"
Output:
[
  { "intent": "AGGREGATE_DB", "collection": "employees", "pipeline": [ { "$match": {"country":"USA","role":"Engineer"} }, { "$group": { "_id": null, "avg_salary": { "$avg": "$salary_usd" } } } ] }
]
`;

async function classifyIntent(userPrompt, contextString) { 
    try {
        // Construct the prompt to include the conversation context
        const fullPrompt = `CONTEXT: ${contextString}\n\nUSER PROMPT: ${userPrompt}`;
        
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash", 
            systemInstruction: SYSTEM_PROMPT 
        }, { fetch: fetch });

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // Cleanup: Remove any potential markdown formatting
        const cleanJson = text.replace(/```json|```/g, '').trim();
        
        console.log("AI Classification Result:", cleanJson);
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("AI Classification Failed (Parsing/API):", error);
        // Fallback for API or parsing errors
        return [{ intent: "ERROR", message: "AI failed to generate valid JSON or connect to the API." }];
    }
}

module.exports = { classifyIntent };