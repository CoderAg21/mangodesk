// Backend/controllers/agentController.js - UPDATED for Ambiguity/Error Handling

const { classifyIntent } = require('../services/intentClassifier');
const { translateIntent } = require('../services/intentToMongo');
const { executeQuery } = require('../services/queryEngine');
const Employee = require('../models/Employee');

// Store the last filter/query used for each session to provide context to the AI.
// Key: sessionId, Value: JSON object of the last executed filter or a summary of results.
const SESSION_CONTEXT = {}; 

/**
 * FULL AI PIPELINE:
 * 1. Receive User Prompt AND Session Context
 * 2. AI Classifies Intent (Gemini) -> Returns ARRAY of Intent Objects
 * 3. Translator Converts to MongoDB Syntax -> Returns ARRAY of Execution Operations
 * 4. Engine Executes Query on Database (Sequential Execution)
 * 5. Update Session Context with results/filters for the next command.
 * 6. Return ALL Results
 */
const handleAgentCommand = async (req, res) => {
    // CRITICAL CHANGE: Default sessionId ensures context works even if frontend is simple
    const { prompt, sessionId = 'default-session' } = req.body; 

    if (!prompt) {
        return res.status(400).json({ error: "No prompt provided." });
    }

    try {
        console.log(`🧠 Processing: "${prompt}" for Session: ${sessionId}`);

        // 1. Prepare Context for the AI
        const context = SESSION_CONTEXT[sessionId] || {};
        const contextString = JSON.stringify(context);
        
        // 2. Classify: Pass the context string along with the prompt
        const intentResults = await classifyIntent(prompt, contextString); 
        
        // --- FEATURE 3: AMBIGUITY CHECK ---
        const firstIntent = intentResults[0];
        if (firstIntent.intent === "ERROR") {
             // Handle core AI classification/parsing errors
             return res.status(500).json(firstIntent);
        }
        if (firstIntent.intent === "AMBIGUOUS_QUERY") {
             // If ambiguous, return the AI's suggested clarification and stop execution
             console.log("⚠️ Ambiguous Query Detected. Returning AI clarification.");
             return res.json({
                status: "Clarification Needed",
                message: "I found an ambiguous term. Did you mean one of these?",
                details: firstIntent.suggestions,
                meta: { originalPrompt: prompt }
             });
        }
        // ---------------------------------
        
        // 3. Translate - Returns an array of execution operations
        const dbOperations = translateIntent(intentResults); 
        
        const finalResults = [];

        // 4. Execute (Sequential Execution of all operations)
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
            
            // 5. Update Context: Only store filters/pipelines for READ/AGGREGATE for re-use
            if (operation.action === 'find' || operation.action === 'aggregate') {
                // Store the filter/pipeline so the AI can reference 'these' employees later
                SESSION_CONTEXT[sessionId] = { 
                    lastAction: operation.action,
                    lastFilter: operation.filter || operation.pipeline,
                    resultCount: Array.isArray(dataResult) ? dataResult.length : 0
                };
            } else if (operation.action === 'updateMany' || operation.action === 'deleteMany') {
                 // Clear context after a major WRITE/DELETE action
                 delete SESSION_CONTEXT[sessionId]; 
            }
        }

        // 6. Respond
        return res.json({
            status: "Success",
            results: finalResults,
            meta: {
                originalPrompt: prompt,
                aiInterpretation: intentResults,
                contextUsed: context // Show the user what context was used
            }
        });

    } catch (error) {
        console.error("❌ Agent Error:", error);
        // Ensure error details are visible
        return res.status(500).json({ error: "Agent failed to process request.", details: error.message });
    }
};

module.exports = { handleAgentCommand };