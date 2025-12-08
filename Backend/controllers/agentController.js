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

// Helper functions
const safeNumber = v => (typeof v === 'number' && !Number.isNaN(v)) ? v : null;
const fmtNumber = n => {
    const num = safeNumber(n);
    return num == null ? 'N/A' : Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtCurrency = n => {
    const num = safeNumber(n);
    if (num == null) return 'N/A';
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const plural = (n, singular, pluralForm) => (n === 1 ? singular : (pluralForm || singular + 's'));

// Intelligent summary generator
const generateAgentResponse = (results = [], intentResults = []) => {
    if (!results || results.length === 0) return "I completed the request but no data was returned.";

    const firstIntent = intentResults[0] || {};
    const firstResult = results[0] || {};
    const action = firstResult.action || 'unknown';

    if (firstIntent.intent === 'CHAT_RESPONSE') return firstIntent.response || "Okay — noted.";
    if (action === 'unknown') return firstResult.message || "Could not process the request.";

    if (results.length > 1) {
        const parts = results.map(r => {
            switch (r.action) {
                case 'insertMany':
                case 'create': {
                    const arr = Array.isArray(r.data) ? r.data : [r.data];
                    const names = arr.map(e => e?.name).filter(Boolean);
                    if (arr.length === 0) return 'added records (no details)';
                    if (arr.length === 1) return `added 1 record (${names[0]})`;
                    return `added ${arr.length} records: ${names.join(', ')}`;
                }
                case 'updateMany': {
                    const modified = r.data?.modifiedCount || 0;
                    const names = Array.isArray(r.data?.matchedDocs) ? r.data.matchedDocs.map(e => e.name).filter(Boolean) : [];
                    const nameStr = names.length ? `: ${names.join(', ')}` : '';
                    return modified ? `updated ${modified} ${plural(modified, 'record')}${nameStr}` : 'performed an update (0 changed)';
                }
                case 'deleteMany': {
                    const deleted = r.data?.deletedCount || 0;
                    return deleted ? `removed ${deleted} ${plural(deleted, 'record')}` : 'performed a delete (0 removed)';
                }
                case 'aggregate': {
                    const rows = Array.isArray(r.data) ? r.data : [r.data];
                    const metrics = rows.map(row => {
                        const keys = Object.keys(row).filter(k => typeof row[k] === 'number');
                        return keys.map(k => `${row.name || row._id}: ${fmtNumber(row[k])}`).join(', ');
                    });
                    return metrics.length ? `calculated metrics: ${metrics.join(', ')}` : 'aggregation returned no valid data';
                }
                case 'find': {
                    const count = Array.isArray(r.data) ? r.data.length : (r.data ? 1 : 0);
                    return count ? `verified ${count} ${plural(count, 'record')}` : 'no matching records found';
                }
                default: return r.message || 'action performed';
            }
        });
        return `All set — ${parts.join(', ')}.`;
    }

    // Single-action handling
    switch (action) {
        case 'find': {
            const rows = Array.isArray(firstResult.data) ? firstResult.data : [firstResult.data];
            if (rows.length === 0) return 'Searched database but found no matching employees.';
            if (rows.length === 1) return `Found 1 employee — ${rows[0].name ?? 'Unknown'}${rows[0].department ? ` in ${rows[0].department}` : ''}.`;
            return `Found ${rows.length} employees that match your criteria.`;
        }
        case 'aggregate': {
            const rows = Array.isArray(firstResult.data) ? firstResult.data : [firstResult.data];
            const metrics = rows.map(row => {
                const keys = Object.keys(row).filter(k => typeof row[k] === 'number');
                return keys.map(k => `${row.name || row._id}: ${fmtNumber(row[k])}`).join(', ');
            });
            return metrics.length ? `Calculated metrics: ${metrics.join(', ')}.` : 'Aggregation returned no valid data.';
        }
        case 'insertMany':
        case 'create': {
            const arr = Array.isArray(firstResult.data) ? firstResult.data : [firstResult.data];
            const names = arr.map(e => e?.name).filter(Boolean);
            if (arr.length === 0) return 'No records inserted.';
            if (arr.length === 1) return `Added ${names[0]}`;
            return `Added ${arr.length} records: ${names.join(', ')}`;
        }
        case 'updateMany': {
            const modified = firstResult.data?.modifiedCount || 0;
            const names = Array.isArray(firstResult.data?.matchedDocs) ? firstResult.data.matchedDocs.map(e => e.name).filter(Boolean) : [];
            const nameStr = names.length ? `: ${names.join(', ')}` : '';
            return modified ? `Updated ${modified} ${plural(modified, 'record')}${nameStr} successfully.` : 'No records updated.';
        }
        case 'deleteMany': {
            const removed = firstResult.data?.deletedCount || 0;
            return removed ? `Removed ${removed} ${plural(removed, 'record')}.` : 'No records deleted.';
        }
        default: return 'Request completed.';
    }
};

// Main handler
const handleAgentCommand = async (req, res) => {
    const { prompt, sessionId = 'default-session' } = req.body || {};
    const file = req.file;

    if (!prompt && !file) return res.status(400).json({ error: 'A prompt or file attachment must be provided.' });

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
        const intentResults = await classifyIntent(augmentedPrompt, JSON.stringify(context));
        const firstIntent = intentResults[0] || {};

        if (firstIntent.intent === 'ERROR') return res.status(500).json(firstIntent);

        if (firstIntent.intent === 'AMBIGUOUS_QUERY') {
            const humanOptions = (firstIntent.suggestions || []).map(opt =>
                opt.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
            );
            return res.json({
                status: 'Clarification Needed',
                message: "Your query is ambiguous. Please choose one of the following fields:",
                options: humanOptions,
                meta: { originalPrompt: prompt }
            });
        }

        if (firstIntent.intent === 'CHAT_RESPONSE') {
            return res.json({
                status: 'Processed',
                response: firstIntent.response || 'Understood.',
                results: [],
                meta: { originalPrompt: prompt }
            });
        }

        // Translate intent to MongoDB operations
        const dbOperations = translateIntent(intentResults);
        const finalResults = [];

        for (const op of dbOperations) {
            if (!op || op.action === 'unknown') {
                finalResults.push({ status: 'Unprocessed', message: op?.reason || 'unknown operation' });
                continue;
            }

            try {
                const dataResult = await executeQuery(op, Employee);

                // For updateMany, attach matchedDocs for reporting names
                if (op.action === 'updateMany' && Array.isArray(dataResult?.matchedDocs)) {
                    finalResults.push({ action: op.action, data: dataResult, filterOrPipelineUsed: op.filter || {} });
                } else {
                    finalResults.push({ action: op.action, data: dataResult, filterOrPipelineUsed: op.filter || op.pipeline || op.data || {} });
                }

                if (['find', 'aggregate'].includes(op.action)) {
                    SESSION_CONTEXT[sessionId] = { lastAction: op.action, lastFilter: op.filter || op.pipeline, resultCount: Array.isArray(dataResult) ? dataResult.length : 1 };
                } else if (['updateMany', 'deleteMany'].includes(op.action)) {
                    delete SESSION_CONTEXT[sessionId];
                }
            } catch (queryError) {
                finalResults.push({ action: op.action, data: null, message: `Failed: ${queryError.message}` });
            }
        }

        const aiResponse = generateAgentResponse(finalResults, intentResults);

        return res.json({
            status: 'Success',
            response: aiResponse,
            results: finalResults,
            meta: { originalPrompt: prompt }
        });

    } catch (error) {
        console.error('Agent Error:', error);
        return res.status(500).json({ error: 'Something went wrong processing your request.', details: error.message || String(error) });
    }
};

module.exports = {
    handleAgentCommand,
    upload
};
