// Backend/controllers/agentController.js
const { classifyIntent } = require('../services/intentClassifier');
const { translateIntent } = require('../services/intentToMongo');
const { executeQuery } = require('../services/queryEngine');
const Employee = require('../models/Employee');

/**
 * FULL AI PIPELINE:
 * 1. Receive User Prompt
 * 2. AI Classifies Intent (Gemini)
 * 3. Translator Converts to MongoDB Syntax
 * 4. Engine Executes Query on Database
 * 5. Return Results
 */
const handleAgentCommand = async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "No prompt provided." });
    }

    try {
        console.log(`🧠 Processing: "${prompt}"`);

        // STEP 1: Classify
        const intentResult = await classifyIntent(prompt);
        if (intentResult.intent === "ERROR") {
             return res.status(500).json(intentResult);
        }

        // STEP 2: Translate
        const dbOperation = translateIntent(intentResult);
        
        // Handle unsupported actions immediately
        if (dbOperation.action === 'unknown') {
            return res.json({
                status: "Unprocessed",
                message: dbOperation.reason,
                originalIntent: intentResult
            });
        }

        // STEP 3: Execute
        // Note: This requires a live MongoDB connection (setup in index.js)
        const dataResult = await executeQuery(dbOperation, Employee);

        // STEP 4: Respond
        return res.json({
            status: "Success",
            action: dbOperation.action,
            data: dataResult,
            meta: {
                originalPrompt: prompt,
                aiInterpretation: intentResult
            }
        });

    } catch (error) {
        console.error("❌ Agent Error:", error);
        return res.status(500).json({ error: "Agent failed to process request.", details: error.message });
    }
};

module.exports = { handleAgentCommand };