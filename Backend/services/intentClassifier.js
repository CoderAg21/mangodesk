// services/intentClassifier.js - FINAL VERSION
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const EMPLOYEE_SCHEMA = `
CONTEXT: You are managing an Employee Database.
COLLECTION NAME: 'employees'

AVAILABLE FIELDS (Exact Column Names):
- IDENTIFIERS: employee_id, name, department, role, country, office_location
- DATES: hire_date, termination_date
- FINANCIALS: salary_usd, bonus_usd, stock_options
- METRICS: performance_score (1-5), promotion_count, project_count
- SALES DATA: deals_closed, avg_deal_size_usd, client_revenue_usd
- WORK STYLE: customer_satisfaction, work_hours_per_week, remote_percentage
- SYNTHETIC: age, gender, education, experience_years
`;

const SYSTEM_PROMPT = `
You are a highly advanced, STATEFUL Conversational Database Agent.
${EMPLOYEE_SCHEMA}

YOUR JOB:
1. Analyze the user prompt AND the conversation history.
2. Apply last filter if relative terms are used.
3. Return AMBIGUOUS_QUERY for vague fields.
4. Return NON_DB_QUERY for non-database prompts.
5. Return a JSON ARRAY of operations.

RULES:
- Output JSON ARRAY only.
- Intents: [READ_DB, WRITE_DB, UPDATE_DB, DELETE_DB, AGGREGATE_DB, AMBIGUOUS_QUERY, DELETE_ALL, NON_DB_QUERY].
- Batching: WRITE_DB with multiple items must use an ARRAY in 'data'.
- Keys:
  - All intents: "intent", "collection"
  - AMBIGUOUS_QUERY: "intent", "suggestions"
  - NON_DB_QUERY: "intent"
- Relative increments: use $inc, percentages: $mul
- Aggregation: provide full MongoDB pipeline.
- DELETE_ALL: must be explicit. Controller handles confirmation.

EXAMPLES:
Input: "Wipe the entire database."
Output: [{ "intent": "DELETE_ALL", "collection": "employees" }]

Input: "Who is the CEO?"
Output: [{ "intent": "NON_DB_QUERY" }]
`;

async function classifyIntent(userPrompt, contextString) {
    try {
        const fullPrompt = `CONTEXT: ${contextString}\n\nUSER PROMPT: ${userPrompt}`;
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash", 
            systemInstruction: SYSTEM_PROMPT 
        }, { fetch: fetch });

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        const cleanJson = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("AI Classification Failed:", error);
        return [{ intent: "ERROR", message: "AI failed to generate valid JSON or connect to the API." }];
    }
}

module.exports = { classifyIntent };
