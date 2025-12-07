// Backend/controllers/agentController.js - UPDATED for Sequential/Batch Processing

const { classifyIntent } = require('../services/intentClassifier');
const { translateIntent } = require('../services/intentToMongo');
const { executeQuery } = require('../services/queryEngine');
const Employee = require('../models/Employee');

// Store results from previous successful commands for context (Placeholder for next step)
const CONTEXT_STORE = {}; 

/**
 * FULL AI PIPELINE:
 * 1. Receive User Prompt
 * 2. AI Classifies Intent (Gemini) -> Returns ARRAY of Intent Objects
 * 3. Translator Converts to MongoDB Syntax -> Returns ARRAY of Execution Operations
 * 4. Engine Executes Query on Database (Sequential Execution)
 * 5. Return ALL Results
 */
const handleAgentCommand = async (req, res) => {
    const { prompt, sessionId = 'default-session' } = req.body; // Use a default session ID if none is provided

    if (!prompt) {
        return res.status(400).json({ error: "No prompt provided." });
    }

    try {
        console.log(`🧠 Processing: "${prompt}"`);

        // STEP 1: Classify (The AI now returns an array of 1 or more intent objects)
        const intentResults = await classifyIntent(prompt); 
        
        // Basic check for classification error
        if (intentResults[0].intent === "ERROR") {
             return res.status(500).json(intentResults[0]);
        }
        
        // STEP 2: Translate - Returns an array of execution operations
        const dbOperations = translateIntent(intentResults); 
        
        const finalResults = [];

        // STEP 3: Execute (Sequential Execution of all operations)
        for (const operation of dbOperations) {
            if (operation.action === 'unknown') {
                finalResults.push({ status: "Unprocessed", message: operation.reason });
                continue;
            }

            const dataResult = await executeQuery(operation, Employee);
            finalResults.push({ 
                action: operation.action, 
                data: dataResult, 
                filterOrPipelineUsed: operation.filter || operation.pipeline || operation.data 
            });
            
            // Context placeholder: We won't fully implement context until the next step
            if (operation.action === 'find' || operation.action === 'aggregate') {
                 // Store the retrieved data for subsequent commands in the same session
                 CONTEXT_STORE[sessionId] = dataResult; 
            }
        }

        // STEP 4: Respond
        return res.json({
            status: "Success",
            results: finalResults,
            meta: {
                originalPrompt: prompt,
                aiInterpretation: intentResults
            }
        });

    } catch (error) {
        console.error("❌ Agent Error:", error);
        return res.status(500).json({ error: "Agent failed to process request.", details: error.message });
    }
};

module.exports = { handleAgentCommand };