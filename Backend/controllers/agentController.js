const fs = require("fs");
const path = require("path");
const multer = require("multer");

const { classifyIntent } = require("../services/intentClassifier");
const { translateIntent } = require("../services/intentToMongo");
const { executeQuery } = require("../services/queryEngine");
const Employee = require("../models/Employee");

// ------------------------------
// 1. MULTER DISK STORAGE SETUP
// ------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = path.join(__dirname, "../data");

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true }); // create if not exists
        }

        cb(null, folderPath); // save inside backend/data
    },

    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/\s+/g, "_");
        cb(null, `${timestamp}-${safeName}`);
    }
});

const upload = multer({ storage });

// ----------------------------------
// IN-MEMORY SESSION CONTEXT STORAGE
// ----------------------------------
const SESSION_CONTEXT = {};

const handleAgentCommand = async (req, res) => {
    try {
        let { prompt, sessionId = "default-session" } = req.body;
        const file = req.file;

        console.log(`📩 Prompt: "${prompt}", File: ${file ? file.filename : "None"}`);

        if (!prompt && !file) {
            return res.status(400).json({ error: "No input provided." });
        }

        // ------------------------------
        // 2. PROCESS FILE (Saved via Multer)
        // ------------------------------
        let augmentedPrompt = prompt || "";

        if (file) {
            try {
                const fullPath = file.path; // multer saved the file
                const fileContent = fs.readFileSync(fullPath, "utf8");

                augmentedPrompt += `

[ATTACHED FILE (${file.originalname}) SAVED AT ${fullPath}]
${fileContent}

[INSTRUCTION]: Analyze the above file based on the user's request.`;

            } catch (err) {
                console.error("❌ File Read Error:", err);
                return res.status(500).json({ error: "Failed to read saved file." });
            }
        }

        // ------------------------------
        // 3. CONTEXT PREP
        // ------------------------------
        const context = SESSION_CONTEXT[sessionId] || {};
        const contextString = JSON.stringify(context);

        // ------------------------------
        // 4. INTENT CLASSIFICATION
        // ------------------------------
        const intentResults = await classifyIntent(augmentedPrompt, contextString);
        const firstIntent = intentResults[0];

        if (firstIntent.intent === "ERROR") {
            return res.status(500).json(firstIntent);
        }

        if (firstIntent.intent === "AMBIGUOUS_QUERY") {
            return res.json({
                status: "Clarification Needed",
                message: "Your query is unclear. Did you mean one of these?",
                details: firstIntent.suggestions
            });
        }

        // ------------------------------
        // 5. TRANSLATE + EXECUTE QUERY
        // ------------------------------
        const dbOperations = translateIntent(intentResults);
        const finalResults = [];

        for (const operation of dbOperations) {
            if (operation.action === "unknown" || operation.action === "chat") {
                finalResults.push({
                    status: "Processed",
                    message: operation.response || operation.reason
                });
                continue;
            }

            const dataResult = await executeQuery(operation, Employee);

            finalResults.push({
                action: operation.action,
                data: dataResult,
                filterOrPipelineUsed: operation.filter || operation.pipeline || operation.data
            });

            // update context
            if (["find", "aggregate"].includes(operation.action)) {
                SESSION_CONTEXT[sessionId] = {
                    lastAction: operation.action,
                    lastFilter: operation.filter || operation.pipeline
                };
            } else if (["updateMany", "deleteMany"].includes(operation.action)) {
                delete SESSION_CONTEXT[sessionId];
            }
        }

        return res.json({
            status: "Success",
            response: "Process completed.",
            results: finalResults
        });

    } catch (err) {
        console.error("❌ Agent Error:", err);
        return res.status(500).json({ error: "Agent failed", details: err.message });
    }
};

// EXPORT upload + handler
module.exports = {
    upload,
    handleAgentCommand
};
