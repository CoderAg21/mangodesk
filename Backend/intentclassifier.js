const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. DEFINE THE SYSTEM PROMPT ("THE BRAIN")
const SYSTEM_PROMPT = `
You are a Database Intent Classifier. Your job is to translate natural language user prompts into structured JSON commands for a MongoDB Employee Database.

**DATABASE SCHEMA FIELDS:**
- Identifiers: employee_id, name, department, role, country, office_location
- Dates: hire_date, termination_date
- Financials: salary_usd, bonus_usd, stock_options
- Metrics: performance_score, promotion_count, project_count, deals_closed, avg_deal_size_usd, client_revenue_usd, customer_satisfaction, work_hours_per_week, remote_percentage

**RULES:**
1. **Identify Operation:** Map the user's request to one of: "CREATE", "READ", "UPDATE", "DELETE".
2. **Safety Check:** - If the action is "DELETE", set "requires_confirmation": true.
   - If the action is a bulk "UPDATE" (no specific name/ID provided), set "requires_confirmation": true.
3. **Multi-Step:** If the user asks for two distinct actions (e.g., "Fire John AND Hire Mike"), return two intent objects in the list.
4. **Parameter Extraction:** Extract specific values. If a user says "Sales Department", map it to { "department": "Sales" }.
5. **Missing Info:** If CREATE is requested but "name" or "role" is missing, add them to "missing_critical_fields".

**OUTPUT FORMAT (JSON ONLY):**
{
  "intents": [
    {
      "action": "CREATE" | "READ" | "UPDATE" | "DELETE",
      "target_entity": "Employee",
      "filter_criteria": { "field": "value" }, 
      "data_payload": { "field": "new_value" },
      "meta": {
        "requires_confirmation": boolean,
        "missing_critical_fields": ["field_name"]
      }
    }
  ]
}
`;

// 2. CONFIGURE THE MODEL
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { responseMimeType: "application/json" }
});

// 3. EXPORT THE FUNCTION
async function parseUserIntent(userPrompt) {
    try {
        const result = await model.generateContent(userPrompt);
        const responseText = result.response.text();
        return JSON.parse(responseText);
    } catch (error) {
        console.error("Gemini Error:", error);
        return { error: "Failed to parse intent" };
    }
}

module.exports = { parseUserIntent };