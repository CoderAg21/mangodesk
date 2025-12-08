const { classifyIntent } = require('../services/intentClassifier');
const { translateIntent } = require('../services/intentToMongo');
const { executeQuery } = require('../services/queryEngine');
const Employee = require('../models/Employee');

// In-memory storage for session context (remembering filters between chats)
const SESSION_CONTEXT = {}; 

const handleAgentCommand = async (req, res) => {
    try {
        // 1. EXTRACT DATA (Populated by Multer middleware)
        let { prompt, sessionId = 'default-session' } = req.body;
        const file = req.file;

        console.log(`📩 Received - Prompt: "${prompt || ''}", File: ${file ? file.originalname : "None"}`);

        if (!prompt && !file) {
            return res.status(400).json({ error: "No prompt or file provided." });
        }

        // 2. FILE PROCESSING
        // If a file is attached, read it as text and append to the prompt
        let augmentedPrompt = prompt || "";
        if (file) {
            const fileContent = file.buffer.toString('utf8'); 
            augmentedPrompt += `\n\n[ATTACHED FILE DATA (${file.originalname})]:\n${fileContent}\n\n[INSTRUCTION]: Analyze the attached data above based on the user's request.`;
        }

        // 3. PREPARE CONTEXT
        const context = SESSION_CONTEXT[sessionId] || {};
        const contextString = JSON.stringify(context);

        // 4. CLASSIFY INTENT (Gemini)
        const intentResults = await classifyIntent(augmentedPrompt, contextString);
        
        // --- AMBIGUITY / ERROR CHECK ---
        const firstIntent = intentResults[0];
        if (firstIntent.intent === "ERROR") return res.status(500).json(firstIntent);
        
        if (firstIntent.intent === "AMBIGUOUS_QUERY") {
             return res.json({
                status: "Clarification Needed",
                message: "I found an ambiguous term. Did you mean one of these?",
                details: firstIntent.suggestions,
                meta: { originalPrompt: prompt }
             });
        }

        // 5. TRANSLATE & EXECUTE
        const dbOperations = translateIntent(intentResults);
        const finalResults = [];

        for (const operation of dbOperations) {
            if (operation.action === 'unknown' || operation.action === 'chat') {
                finalResults.push({ status: "Processed", message: operation.response || operation.reason });
                continue;
            }

            const dataResult = await executeQuery(operation, Employee);
            
            finalResults.push({ 
                action: operation.action, 
                data: dataResult, 
                filterOrPipelineUsed: operation.filter || operation.pipeline || operation.data 
            });

            // Update Context for Follow-ups
            if (operation.action === 'find' || operation.action === 'aggregate') {
                SESSION_CONTEXT[sessionId] = { 
                    lastAction: operation.action,
                    lastFilter: operation.filter || operation.pipeline,
                    resultCount: Array.isArray(dataResult) ? dataResult.length : 0
                };
            } else if (operation.action === 'updateMany' || operation.action === 'deleteMany') {
                 delete SESSION_CONTEXT[sessionId]; 
            }
        }

        // 6. GENERATE RESPONSE TEXT
        let aiResponseText = "Process completed.";
        if (finalResults.length > 0) {
            const firstRes = finalResults[0];
            if (firstRes.message) aiResponseText = firstRes.message;
            else if (Array.isArray(firstRes.data)) aiResponseText = `Found ${firstRes.data.length} matching records.`;
        }

        return res.json({
            status: "Success",
            response: aiResponseText,
            results: finalResults,
            meta: { originalPrompt: prompt }
        });

    } catch (error) {
        console.error("❌ Agent Error:", error);
        return res.status(500).json({ error: "Agent failed.", details: error.message });
    }
};

module.exports = { handleAgentCommand };