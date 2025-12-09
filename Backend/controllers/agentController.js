// const fs = require("fs");
// const path = require("path");
// const multer = require("multer");

// // NOTE: These services must be implemented to return results and intents as expected.
// const { classifyIntent } = require("../services/intentClassifier");
// const { translateIntent } = require("../services/intentToMongo");
// const { executeQuery } = require("../services/queryEngine");
// const Employee = require("../models/Employee"); // Assuming this is your Mongoose model

// // ------------------------------
// // 1. MULTER DISK STORAGE SETUP
// // ------------------------------
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const folderPath = path.join(__dirname, "../data");
//         if (!fs.existsSync(folderPath)) {
//             fs.mkdirSync(folderPath, { recursive: true });
//         }
//         cb(null, folderPath);
//     },
//     filename: (req, file, cb) => {
//         const timestamp = Date.now();
//         const safeName = file.originalname.replace(/\s+/g, "_");
//         cb(null, `${timestamp}-${safeName}`);
//     }
// });

// const upload = multer({ storage });

// // ----------------------------------
// // IN-MEMORY SESSION CONTEXT STORAGE
// // ----------------------------------
// const SESSION_CONTEXT = {};

// // ----------------------------------
// // 2. HELPER FUNCTIONS
// // ----------------------------------

// const safeNumber = v => (typeof v === 'number' && !Number.isNaN(v)) ? v : null;
// const fmtNumber = n => {
//     const num = safeNumber(n);
//     if (num == null) return 'N/A';
//     // Use toLocaleString for general numbers, limit to 2 decimal places
//     return Number(num).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
// };
// const fmtCurrency = n => {
//     const num = safeNumber(n);
//     if (num == null) return 'N/A';
//     return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// };
// const plural = (n, singular, pluralForm) => (n === 1 ? singular : (pluralForm || singular + 's'));

// /**
//  * 3. generateAgentResponse(results, intentResults)
//  *
//  * Produces a concise, human-friendly message describing what the agent did.
//  */
// const generateAgentResponse = (results = [], intentResults = []) => {
//     if (!results || results.length === 0) return "I completed the request, but there was no data returned from the database.";

//     const firstIntent = intentResults[0] || {};
//     const firstResult = results[0] || {};
//     const action = firstResult.action || 'unknown';

//     // Handle Chat/Error Intents immediately
//     if (firstIntent.intent === 'CHAT_RESPONSE') return firstIntent.response || "Okay, I've noted that.";
//     if (action === 'unknown') return firstResult.message || "I couldn't translate that into a database action. Could you rephrase?";

//     // --- Multi-Step Action Handling (More Humanoid) ---
//     if (results.length > 1) {
//         const parts = results.map(r => {
//             switch (r.action) {
//                 case 'insertMany':
//                 case 'create': {
//                     const arr = Array.isArray(r.data) ? r.data : [r.data].filter(Boolean);
//                     const names = arr.map(e => e?.name).filter(Boolean);
//                     const count = arr.length;
//                     if (count === 0) return 'tried to add records (no details)';
//                     return `**added ${count} ${plural(count, 'record')}**${names.length ? ` (${names.join(', ')})` : ''}`;
//                 }
//                 case 'updateMany': {
//                     const modified = r.data?.modifiedCount || 0;
//                     const names = Array.isArray(r.data?.matchedDocs) ? r.data.matchedDocs.map(e => e.name).filter(Boolean) : [];
//                     if (modified === 0) return 'performed an update (0 records changed)';
//                     return `**updated ${modified} ${plural(modified, 'record')}**`;
//                 }
//                 case 'deleteMany': {
//                     const deleted = r.data?.deletedCount || 0;
//                     return deleted ? `**removed ${deleted} ${plural(deleted, 'record')}**` : 'performed a deletion (0 records removed)';
//                 }
//                 case 'aggregate': {
//                     const rows = Array.isArray(r.data) ? r.data : [r.data].filter(Boolean);
//                     const metrics = rows.map(row => {
//                         const keys = Object.keys(row).filter(k => typeof row[k] === 'number');
//                         return keys.map(k => {
//                             const isCurrency = k.toLowerCase().includes('salary') || k.toLowerCase().includes('comp');
//                             // Fallback to the key name if _id and name are missing (e.g., $count)
//                             const label = row.name || row._id || k.replace(/_/g, ' '); 
//                             return `${label}: ${isCurrency ? fmtCurrency(row[k]) : fmtNumber(row[k])}`;
//                         }).join(', ');
//                     });
//                     return metrics.length ? `**calculated metrics** (${metrics.join(', ')})` : 'could not calculate metrics';
//                 }
//                 case 'find': {
//                     const count = Array.isArray(r.data) ? r.data.length : (r.data ? 1 : 0);
//                     return count ? `**retrieved ${count} ${plural(count, 'record')}**` : 'found no matching records';
//                 }
//                 default: return r.message || 'completed an action';
//             }
//         });
//         // Construct the final, natural-sounding multi-step summary
//         const final = parts.length === 1 ? parts[0] : parts.slice(0, -1).join(', ') + ' and ' + parts.slice(-1);
//         return `I've finished the sequence: I **${final}**.`;
//     }

//     // --- Single-Step Action Handling (More Humanoid) ---
//     switch (action) {
//         case 'find': {
//             const rows = Array.isArray(firstResult.data) ? firstResult.data : [firstResult.data].filter(Boolean);
//             const count = rows.length;

//             if (count === 0) return "I searched, but I didn't find any employees matching your criteria.";
//             if (count === 1) {
//                 const e = rows[0];
//                 return `I found **${e.name || 'one employee'}**${e.department ? ` in the **${e.department}** department` : ''}.`;
//             }
//             const names = rows.map(e => e.name).filter(Boolean).slice(0, 5); // Show up to 5 names
//             const nameList = names.length > 0 ? ` (e.g., ${names.join(', ')}${rows.length > 5 ? '...' : ''})` : '';
//             return `I found **${count}** employees matching that search${nameList}.`;
//         }
//         case 'aggregate': {
//             const rows = Array.isArray(firstResult.data) ? firstResult.data : [firstResult.data].filter(Boolean);
//             const metrics = rows.map(row => {
//                 const keys = Object.keys(row).filter(k => typeof row[k] === 'number');
//                 return keys.map(k => {
//                     const isCurrency = k.toLowerCase().includes('salary') || k.toLowerCase().includes('comp');
//                     const label = row.name || row._id || k.replace(/_/g, ' ');
//                     return `**${label}**: ${isCurrency ? fmtCurrency(row[k]) : fmtNumber(row[k])}`;
//                 }).join(', ');
//             });
//             return metrics.length ? `Here are the calculations you requested: ${metrics.join(', ')}.` : 'I aggregated the data, but the result was empty.';
//         }
//         case 'insertMany':
//         case 'create': {
//             const arr = Array.isArray(firstResult.data) ? firstResult.data : [firstResult.data].filter(Boolean);
//             const count = arr.length;
//             const names = arr.map(e => e?.name).filter(Boolean);
//             if (count === 0) return 'The creation command ran, but no records were inserted. Something might be wrong.';
//             if (count === 1) return `Successfully added **${names[0] || 'a new record'}** to the database.`;
//             return `I successfully added **${count} new records**${names.length ? `, including ${names.slice(0, 3).join(', ')}` : ''}.`;
//         }
//         case 'updateMany': {
//             const modified = firstResult.data?.modifiedCount || 0;
//             const names = Array.isArray(firstResult.data?.matchedDocs) ? firstResult.data.matchedDocs.map(e => e.name).filter(Boolean) : [];
//             if (modified > 0) return `I've successfully updated **${modified} ${plural(modified, 'record')}** in the database.`;
//             return 'No records were changed; either the filter matched nothing, or the values were already set.';
//         }
//         case 'deleteMany': {
//             const removed = firstResult.data?.deletedCount || 0;
//             return removed ? `I have removed **${removed} ${plural(removed, 'record')}** as requested.` : 'No records matched the criteria for deletion.';
//         }
//         default: return 'The database operation completed successfully. How else can I help?';
//     }
// };

// // ----------------------------------
// // 4. MAIN HANDLER
// // ----------------------------------
// const handleAgentCommand = async (req, res) => {
//     const { prompt, sessionId = 'default-session' } = req.body || {};
//     const file = req.file;

//     if (!prompt && !file) return res.status(400).json({ error: 'A prompt or file attachment must be provided.' });

//     try {
//         // NOTE: Destructure again here to avoid potential shadowing issues from the above check.
//         let { prompt: userPrompt, sessionId: currentSessionId = "default-session" } = req.body;
//         const attachedFile = req.file;

//         console.log(`📩 Prompt: "${userPrompt}", File: ${attachedFile ? attachedFile.filename : "None"}`);

//         // 2. PROCESS FILE (Saved via Multer)
//         let augmentedPrompt = userPrompt || "";

//         if (attachedFile) {
//             try {
//                 // Ensure a temporary file is deleted after use in a production environment!
//                 const fullPath = attachedFile.path;
//                 const fileContent = fs.readFileSync(fullPath, "utf8");

//                 augmentedPrompt += `
// [ATTACHED FILE (${attachedFile.originalname}) SAVED AT ${fullPath}]
// ${fileContent}

// [INSTRUCTION]: Analyze the above file based on the user's request.`;

//             } catch (err) {
//                 console.error("❌ File Read Error:", err);
//                 return res.status(500).json({ error: "Failed to read saved file." });
//             }
//         }

//         // 3. CONTEXT PREP
//         const context = SESSION_CONTEXT[currentSessionId] || {};
//         const intentResults = await classifyIntent(augmentedPrompt, JSON.stringify(context));
//         const firstIntent = intentResults[0] || {};

//         if (firstIntent.intent === 'ERROR') {
//             console.error("AI Classification Error:", firstIntent.message);
//             return res.status(500).json(firstIntent);
//         }

//         if (firstIntent.intent === 'AMBIGUOUS_QUERY') {
//             const humanOptions = (firstIntent.suggestions || []).map(opt =>
//                 opt.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
//             );
//             return res.json({
//                 status: 'Clarification Needed',
//                 response: `Your query is ambiguous. I'm not sure which field you mean. Could you clarify, perhaps by choosing one of these: ${humanOptions.join(', ')}?`,
//                 options: humanOptions,
//                 meta: { originalPrompt: userPrompt }
//             });
//         }

//         if (firstIntent.intent === 'CHAT_RESPONSE') {
//             return res.json({
//                 status: 'Processed',
//                 response: firstIntent.response || 'Understood.',
//                 results: [],
//                 meta: { originalPrompt: userPrompt }
//             });
//         }

//         // --- Execute Database Operations ---
//         const dbOperations = translateIntent(intentResults);
//         const finalResults = [];

//         for (const op of dbOperations) {
//             if (!op || op.action === 'unknown') {
//                 finalResults.push({ status: 'Unprocessed', message: op?.reason || 'unknown operation' });
//                 continue;
//             }

//             try {
//                 const dataResult = await executeQuery(op, Employee);

//                 // Preserve matched docs for humanoid response generation
//                 finalResults.push({ action: op.action, data: dataResult, filterOrPipelineUsed: op.filter || op.pipeline || op.data || {} });

//                 // Update Session Context
//                 if (['find', 'aggregate'].includes(op.action)) {
//                     SESSION_CONTEXT[currentSessionId] = {
//                         lastAction: op.action,
//                         lastFilter: op.filter || op.pipeline,
//                         resultCount: Array.isArray(dataResult) ? dataResult.length : (dataResult ? 1 : 0)
//                     };
//                 } else if (['updateMany', 'deleteMany', 'create', 'insertMany'].includes(op.action)) {
//                     // Reset context after modifying data
//                     delete SESSION_CONTEXT[currentSessionId];
//                 }
//             } catch (queryError) {
//                 // Attach error message to result list for multi-step failure reporting
//                 finalResults.push({ action: op.action, data: null, message: `Database query failed: ${queryError.message}` });
//             }
//         }

//         const aiResponse = generateAgentResponse(finalResults, intentResults);

//         return res.json({
//             status: 'Success',
//             response: aiResponse, // The final, conversational message
//             results: finalResults, // Raw results for frontend debugging/display
//             meta: { originalPrompt: userPrompt }
//         });

//     } catch (error) {
//         console.error('Agent Error:', error);
//         return res.status(500).json({ error: 'I encountered a major error while processing your request.', details: error.message || String(error) });
//     }
// };

// module.exports = {
//     handleAgentCommand,
//     upload
// };



const fs = require("fs");
const path = require("path");
const multer = require("multer");

// NOTE: These services must be implemented to return results and intents as expected.
const { classifyIntent } = require("../services/intentClassifier");
const { translateIntent } = require("../services/intentToMongo");
const { executeQuery } = require("../services/queryEngine");
// --- IMPORT NEW CSV ENGINE ---
const { executeCSVQuery } = require("../services/csvEngine"); 
const Employee = require("../models/Employee"); 

// ------------------------------
// 1. MULTER DISK STORAGE SETUP
// ------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = path.join(__dirname, "../data");
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        // Force CSV extension if it's a CSV file to ensure engine picks it up
        const ext = path.extname(file.originalname) || '.csv';
        const safeName = file.originalname.replace(/\s+/g, "_");
        cb(null, `${timestamp}-${safeName}`);
    }
});

const upload = multer({ storage });

// ----------------------------------
// IN-MEMORY SESSION CONTEXT STORAGE
// ----------------------------------
const SESSION_CONTEXT = {};

// ----------------------------------
// 2. HELPER FUNCTIONS
// ----------------------------------

const safeNumber = v => (typeof v === 'number' && !Number.isNaN(v)) ? v : null;
const fmtNumber = n => {
    const num = safeNumber(n);
    if (num == null) return 'N/A';
    return Number(num).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};
const fmtCurrency = n => {
    const num = safeNumber(n);
    if (num == null) return 'N/A';
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const plural = (n, singular, pluralForm) => (n === 1 ? singular : (pluralForm || singular + 's'));

/**
 * 3. generateAgentResponse(results, intentResults)
 */
const generateAgentResponse = (results = [], intentResults = []) => {
    if (!results || results.length === 0) return "I completed the request, but there was no data returned.";

    const firstIntent = intentResults[0] || {};
    // Check if we have CSV results mixed in
    const firstResult = results[0] || {};
    const action = firstResult.action || 'unknown';

    if (firstIntent.intent === 'CHAT_RESPONSE') return firstIntent.response || "Okay, I've noted that.";
    if (action === 'unknown') return firstResult.message || "I couldn't translate that into an action.";

    // --- Multi-Step Action Handling ---
    if (results.length > 1) {
        const parts = results.map(r => {
            const source = r.source === 'CSV' ? '(CSV)' : '(DB)'; // Distinguish source
            switch (r.action) {
                case 'insertMany':
                case 'create': {
                    const arr = Array.isArray(r.data) ? r.data : [r.data].filter(Boolean);
                    const names = arr.map(e => e?.name).filter(Boolean);
                    const count = arr.length;
                    if (count === 0) return `tried to add records ${source} (no details)`;
                    return `**added ${count} ${plural(count, 'record')} ${source}**`;
                }
                case 'updateMany': {
                    const modified = r.data?.modifiedCount || 0;
                    if (modified === 0) return `performed an update ${source} (0 changed)`;
                    return `**updated ${modified} ${plural(modified, 'record')} ${source}**`;
                }
                case 'deleteMany': {
                    const deleted = r.data?.deletedCount || 0;
                    return deleted ? `**removed ${deleted} ${plural(deleted, 'record')} ${source}**` : `performed a deletion ${source} (0 removed)`;
                }
                case 'find': {
                    const count = Array.isArray(r.data) ? r.data.length : (r.data ? 1 : 0);
                    return count ? `**retrieved ${count} records ${source}**` : `found no matching records ${source}`;
                }
                default: return r.message || 'completed an action';
            }
        });
        const final = parts.length === 1 ? parts[0] : parts.slice(0, -1).join(', ') + ' and ' + parts.slice(-1);
        return `I've finished the sequence: I **${final}**.`;
    }

    // --- Single-Step Action Handling (Unified) ---
    switch (action) {
        case 'find': {
            const rows = Array.isArray(firstResult.data) ? firstResult.data : [firstResult.data].filter(Boolean);
            const count = rows.length;
            const source = firstResult.source === 'CSV' ? 'CSV file' : 'database';
            if (count === 0) return `I searched the ${source}, but I didn't find any employees matching your criteria.`;
            if (count === 1) {
                const e = rows[0];
                return `I found **${e.name || 'one employee'}** in the ${source}${e.department ? ` (${e.department})` : ''}.`;
            }
            return `I found **${count}** employees in the ${source} matching that search.`;
        }
        case 'insertMany':
        case 'create': {
            const arr = Array.isArray(firstResult.data) ? firstResult.data : [firstResult.data].filter(Boolean);
            const count = arr.length;
            const source = firstResult.source === 'CSV' ? 'CSV file' : 'database';
            if (count === 0) return 'No records were inserted.';
            return `I successfully added **${count} new records** to the ${source}.`;
        }
        case 'updateMany': {
            const modified = firstResult.data?.modifiedCount || 0;
            const source = firstResult.source === 'CSV' ? 'CSV file' : 'database';
            if (modified > 0) return `I've successfully updated **${modified} ${plural(modified, 'record')}** in the ${source}.`;
            return `No records were changed in the ${source}.`;
        }
        case 'deleteMany': {
            const removed = firstResult.data?.deletedCount || 0;
            const source = firstResult.source === 'CSV' ? 'CSV file' : 'database';
            return removed ? `I have removed **${removed} ${plural(removed, 'record')}** from the ${source}.` : 'No records matched for deletion.';
        }
        default: return 'The operation completed successfully.';
    }
};

// ----------------------------------
// 4. MAIN HANDLER
// ----------------------------------
const handleAgentCommand = async (req, res) => {
    const { prompt, sessionId = 'default-session' } = req.body || {};
    const file = req.file;

    if (!prompt && !file) return res.status(400).json({ error: 'A prompt or file attachment must be provided.' });

    try {
        let { prompt: userPrompt, sessionId: currentSessionId = "default-session" } = req.body;
        const attachedFile = req.file;

        console.log(`📩 Prompt: "${userPrompt}", File: ${attachedFile ? attachedFile.filename : "None"}`);

        // 2. PROCESS FILE
        let augmentedPrompt = userPrompt || "";

        if (attachedFile) {
            try {
                const fullPath = attachedFile.path;
                const fileContent = fs.readFileSync(fullPath, "utf8");
                augmentedPrompt += `\n[ATTACHED FILE SAVED AT ${fullPath}]\n${fileContent}\n[INSTRUCTION]: Analyze the file.`;
            } catch (err) {
                console.error("❌ File Read Error:", err);
                return res.status(500).json({ error: "Failed to read saved file." });
            }
        }

        // 3. CONTEXT PREP & INTENT
        const context = SESSION_CONTEXT[currentSessionId] || {};
        const intentResults = await classifyIntent(augmentedPrompt, JSON.stringify(context));
        const firstIntent = intentResults[0] || {};

        if (firstIntent.intent === 'ERROR') return res.status(500).json(firstIntent);
        if (firstIntent.intent === 'CHAT_RESPONSE') return res.json({ status: 'Processed', response: firstIntent.response, results: [] });

        // --- Execute Operations ---
        const dbOperations = translateIntent(intentResults);
        const finalResults = [];

        for (const op of dbOperations) {
            if (!op || op.action === 'unknown') {
                finalResults.push({ status: 'Unprocessed', message: op?.reason || 'unknown operation' });
                continue;
            }

            // ----------------------------------------------------
            // A. Execute MongoDB Operation
            // ----------------------------------------------------
            try {
                const mongoResult = await executeQuery(op, Employee);
                if (mongoResult) {
                     // Add mongo result
                    finalResults.push({ 
                        source: 'MongoDB',
                        action: op.action, 
                        data: mongoResult, 
                        filterOrPipelineUsed: op.filter || op.pipeline 
                    });
                }
            } catch (mongoErr) {
                console.warn("MongoDB Query skipped or failed:", mongoErr.message);
            }

            // ----------------------------------------------------
            // B. Execute CSV Operation (Syncs manipulations)
            // ----------------------------------------------------
            try {
                // We pass the same operation object to the CSV Engine
                const csvResult = await executeCSVQuery(op);
                if (csvResult && !csvResult.message) {
                    finalResults.push({
                        source: 'CSV',
                        action: op.action,
                        data: csvResult,
                        filterOrPipelineUsed: op.filter || op.pipeline
                    });
                }
            } catch (csvErr) {
                console.warn("CSV Query skipped or failed:", csvErr.message);
            }
            
            // Update Context (Prioritize Mongo count if available, else CSV)
            if (['find', 'aggregate'].includes(op.action)) {
                SESSION_CONTEXT[currentSessionId] = {
                    lastAction: op.action,
                    lastFilter: op.filter || op.pipeline,
                    resultCount: finalResults.length
                };
            }
        }

        const aiResponse = generateAgentResponse(finalResults, intentResults);

        return res.json({
            status: 'Success',
            response: aiResponse,
            results: finalResults,
            meta: { originalPrompt: userPrompt }
        });

    } catch (error) {
        console.error('Agent Error:', error);
        return res.status(500).json({ error: 'Error processing request.', details: error.message });
    }
};

module.exports = {
    handleAgentCommand,
    upload
};