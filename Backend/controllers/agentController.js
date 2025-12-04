// Backend/controllers/agentController.js
const { classifyIntent } = require('../services/intentClassifier');

/**
 * Handles incoming natural language commands for the AI agent.
 */
const handleAgentCommand = async (req, res) => {
    // 1. Extract the prompt from the request body
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Error: No prompt provided in the request body." });
    }

    try {
        // 2. Pass the prompt to the existing intent classifier
        const intentResult = await classifyIntent(prompt);

        // 3. Check for immediate errors from the classifier
        if (intentResult.intent === "ERROR") {
             return res.status(500).json(intentResult);
        }

        // 4. For now, we return the classified intent as proof the flow works
        return res.json({
            status: "Intent Classified",
            receivedPrompt: prompt,
            classifiedIntent: intentResult
        });

    } catch (error) {
        console.error("Error processing agent command:", error);
        return res.status(500).json({ error: "Internal server error during classification." });
    }
};

module.exports = {
    handleAgentCommand
};