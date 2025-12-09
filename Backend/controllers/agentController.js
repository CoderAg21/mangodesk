// controllers/agentController.js
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { classifyIntent } = require("../services/intentClassifier");
const { translateIntent } = require("../services/intentToMongo");
const { executeQuery } = require("../services/queryEngine");
const Employee = require("../models/Employee");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folderPath = path.join(__dirname, "../data");
        if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/\s+/g, "_");
        cb(null, `${timestamp}-${safeName}`);
    }
});

const upload = multer({ storage });
const SESSION_CONTEXT = {};

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

const summarizeNames = (docs = [], limit = 10) => {
    const names = docs.map(d => (d && (d.name || d.employee_id || d._id)) ? (d.name ? d.name : (d.employee_id || d._id)) : null).filter(Boolean);
    if (names.length === 0) return '';
    if (names.length <= limit) return names.join(', ');
    return `${names.slice(0, limit).join(', ')}${names.length > limit ? ', ...' : ''}`;
};

const generateAgentResponse = (results = [], intentResults = []) => {
    if (!results || results.length === 0) return "I completed the request, but there was no data returned.";

    const firstIntent = intentResults[0] || {};
    const firstResult = results.find(r => r.action && r.action !== 'unknown') || results[0] || {};
    const action = firstResult.action || 'unknown';

    if (firstIntent.intent === 'CHAT_RESPONSE') return firstIntent.response || "Okay, I've noted that.";
    if (firstIntent.intent === 'NON_DB_QUERY') return "I'm here to work with your employee database. I can't answer general knowledge or math questions.";
    if (action === 'unknown') return firstResult.message || "I couldn't translate that into an action. Could you rephrase?";

    if (results.length > 1) {
        const parts = results.map((r, idx) => {
            const src = r.source || 'database';
            if (r.action === 'find') {
                const count = Array.isArray(r.data) ? r.data.length : (r.data ? 1 : 0);
                const names = Array.isArray(r.matchedDocs) && r.matchedDocs.length ? summarizeNames(r.matchedDocs, 20) : (Array.isArray(r.data) ? summarizeNames(r.data, 20) : '');
                if (count === 0) return `Step ${idx + 1}: I searched the ${src} and found 0 records.`;
                return `Step ${idx + 1}: Retrieved ${count} ${plural(count, 'record')} from the ${src}${names ? ` — names/ids: ${names}` : ''}.`;
            }
            if (r.action === 'aggregate') {
                const rows = Array.isArray(r.data) ? r.data : (r.data ? [r.data] : []);
                if (rows.length === 0) return `Step ${idx + 1}: Aggregation on ${src} returned no data.`;
                const metricParts = rows.map(row => {
                    const numericKeys = Object.keys(row).filter(k => typeof row[k] === 'number');
                    if (numericKeys.length === 0) {
                        const nameLabel = row.name || row._id || JSON.stringify(row);
                        return `${nameLabel}: N/A`;
                    }
                    return numericKeys.map(k => {
                        const isCurrency = k.toLowerCase().includes('salary') || k.toLowerCase().includes('bonus') || k.toLowerCase().includes('cost') || k.toLowerCase().includes('avg');
                        const label = row.name || row._id || k;
                        return `${label}: ${isCurrency ? fmtCurrency(row[k]) : fmtNumber(row[k])}`;
                    }).join(', ');
                });
                return `Step ${idx + 1}: Calculated metrics from ${src}: ${metricParts.join('; ')}`;
            }
            if (r.action === 'create' || r.action === 'insertMany') {
                const arr = Array.isArray(r.data) ? r.data : (r.data ? [r.data] : []);
                if (arr.length === 0) return `Step ${idx + 1}: Creation ran but no records were returned.`;
                const createdList = arr.map(d => d.name ? `${d.name} (${d.employee_id || 'no-id'})` : (d.employee_id || 'created')).slice(0, 20);
                return `Step ${idx + 1}: Added ${arr.length} ${plural(arr.length, 'record')} — ${createdList.join(', ')}`;
            }
            if (r.action === 'updateMany') {
                const modified = (r.data && (r.data.modifiedCount ?? r.data.nModified ?? r.data.modified)) || 0;
                const matched = (r.data && (r.data.matchedCount ?? r.data.n ?? r.data.matched)) || 0;
                const names = Array.isArray(r.matchedDocs) && r.matchedDocs.length ? summarizeNames(r.matchedDocs, 20) : '';
                if (modified === 0) return `Step ${idx + 1}: Performed update on ${src} (0 changed)${names ? ` — matched: ${names}` : ''}`;
                return `Step ${idx + 1}: Updated ${modified} ${plural(modified, 'record')}${names ? ` — names/ids: ${names}` : ''}`;
            }
            if (r.action === 'deleteMany') {
                const deleted = (r.data && (r.data.deletedCount ?? r.data.n ?? r.data.deleted)) || 0;
                const names = Array.isArray(r.matchedDocs) && r.matchedDocs.length ? summarizeNames(r.matchedDocs, 20) : '';
                if (deleted === 0) return `Step ${idx + 1}: Deletion ran on ${src} (0 removed)${names ? ` — matched: ${names}` : ''}`;
                return `Step ${idx + 1}: Deleted ${deleted} ${plural(deleted, 'record')}${names ? ` — names/ids: ${names}` : ''}`;
            }
            return `Step ${idx + 1}: Completed ${r.action} on ${src}.`;
        });
        const header = `I've completed a sequence of ${results.length} operation${results.length > 1 ? 's' : ''}.`;
        return `${header} ${parts.join(' ')}`;
    }

    if (action === 'find') {
        const rows = Array.isArray(firstResult.data) ? firstResult.data : (firstResult.data ? [firstResult.data] : []);
        const count = rows.length;
        const src = firstResult.source || 'database';
        if (count === 0) return `I searched the ${src} and found no matching employees.`;
        if (count === 1) {
            const e = rows[0];
            return `Here is the employee you asked for: ${e.name || e.employee_id || 'Unknown'}${e.employee_id ? ` (ID: ${e.employee_id})` : ''}${e.department ? ` — ${e.department}` : ''}.`;
        }
        const names = summarizeNames(rows, 100);
        return `Here are the ${count} employees I found in the ${src}: ${names}.`;
    }

    if (action === 'aggregate') {
        const rows = Array.isArray(firstResult.data) ? firstResult.data : (firstResult.data ? [firstResult.data] : []);
        if (rows.length === 0) return 'Aggregation returned no valid data.';
        const metricParts = rows.map(row => {
            const numericKeys = Object.keys(row).filter(k => typeof row[k] === 'number');
            if (numericKeys.length === 0) {
                const label = row.name || row._id || JSON.stringify(row);
                return `${label}: N/A`;
            }
            return numericKeys.map(k => {
                const isCurrency = k.toLowerCase().includes('salary') || k.toLowerCase().includes('bonus') || k.toLowerCase().includes('cost') || k.toLowerCase().includes('avg');
                const label = row.name || row._id || k;
                return `${label}: ${isCurrency ? fmtCurrency(row[k]) : fmtNumber(row[k])}`;
            }).join(', ');
        });
        return `Here are the calculations you requested: ${metricParts.join('; ')}`;
    }

    if (action === 'create' || action === 'insertMany') {
        const arr = Array.isArray(firstResult.data) ? firstResult.data : (firstResult.data ? [firstResult.data] : []);
        if (arr.length === 0) return 'No records were inserted.';
        const created = arr.map(d => d.name ? `${d.name}${d.employee_id ? ` (ID: ${d.employee_id})` : ''}` : (d.employee_id || 'created'));
        if (created.length === 1) return `Successfully added ${created[0]}.`;
        return `Successfully added ${arr.length} records: ${created.slice(0, 20).join(', ')}${created.length > 20 ? ', ...' : ''}.`;
    }

    if (action === 'updateMany') {
        const modified = (firstResult.data && (firstResult.data.modifiedCount ?? firstResult.data.nModified ?? firstResult.data.modified)) || 0;
        const matchedDocs = Array.isArray(firstResult.matchedDocs) ? firstResult.matchedDocs : [];
        const names = summarizeNames(matchedDocs, 50);
        if (modified === 0) return `Performed update (0 changed)${names ? ` — matched: ${names}` : ''}.`;
        return `Updated ${modified} ${plural(modified, 'record')}${names ? ` — names/ids: ${names}` : ''}.`;
    }

    if (action === 'deleteMany') {
        const removed = (firstResult.data && (firstResult.data.deletedCount ?? firstResult.data.n ?? firstResult.data.deleted)) || 0;
        const matchedDocs = Array.isArray(firstResult.matchedDocs) ? firstResult.matchedDocs : [];
        const names = summarizeNames(matchedDocs, 50);
        if (removed === 0) return `Deletion executed (0 removed)${names ? ` — matched: ${names}` : ''}.`;
        return `Deleted ${removed} ${plural(removed, 'record')}${names ? ` — names/ids: ${names}` : ''}.`;
    }

    return 'The database operation completed successfully.';
};

const handleAgentCommand = async (req, res) => {
    const { prompt, sessionId = 'default-session', confirmation = 'false' } = req.body || {};
    const file = req.file;
    const isConfirmed = confirmation === 'true';

    if (!prompt && !file) return res.status(400).json({ error: 'A prompt or file attachment must be provided.' });

    try {
        let { prompt: userPrompt, sessionId: currentSessionId = "default-session" } = req.body;
        const attachedFile = req.file;

        if (userPrompt && userPrompt.toLowerCase().includes('confirm delete') && SESSION_CONTEXT[currentSessionId]?.pendingAction === 'DELETE_ALL') {
            userPrompt = SESSION_CONTEXT[currentSessionId].originalPrompt;
            delete SESSION_CONTEXT[currentSessionId].pendingAction;
            return handleAgentCommand({ body: { prompt: userPrompt, sessionId: currentSessionId, confirmation: 'true' }, file: attachedFile, params: req.params, query: req.query }, res);
        }

        let augmentedPrompt = userPrompt || "";
        if (attachedFile) {
            try {
                const fullPath = attachedFile.path;
                const fileContent = fs.readFileSync(fullPath, "utf8");
                augmentedPrompt += `\n[ATTACHED FILE SAVED AT ${fullPath}]\n${fileContent}\n[INSTRUCTION]: Analyze the file.`;
            } catch (err) {
                return res.status(500).json({ error: "Failed to read saved file." });
            }
        }

        const context = SESSION_CONTEXT[currentSessionId] || {};
        const intentResults = await classifyIntent(augmentedPrompt, JSON.stringify(context));
        const firstIntent = intentResults[0] || {};

        if (firstIntent.intent === 'ERROR') return res.status(500).json(firstIntent);
        if (firstIntent.intent === 'NON_DB_QUERY') {
            return res.json({ status: 'Non-DB', response: generateAgentResponse([], intentResults) });
        }
        if (firstIntent.intent === 'AMBIGUOUS_QUERY') {
            const opts = firstIntent.suggestions || [];
            return res.json({
                status: 'Clarification Needed',
                response: `Your query is ambiguous. Please clarify by choosing one of these fields: ${opts.join(', ')}`,
                options: opts
            });
        }

        if (firstIntent.intent === 'DELETE_ALL' && !isConfirmed) {
            SESSION_CONTEXT[currentSessionId] = { pendingAction: 'DELETE_ALL', originalPrompt: userPrompt };
            return res.json({
                status: 'Confirmation Required',
                response: 'WARNING: You are attempting to delete the entire employee database. Reply with "confirm delete" to proceed.',
                meta: { requiresConfirmation: true }
            });
        }

        const dbOperations = translateIntent(intentResults);
        const finalResults = [];

        for (const op of dbOperations) {
            if (!op || op.action === 'unknown') {
                finalResults.push({ action: 'unknown', data: null, message: op?.reason || 'unknown operation' });
                continue;
            }

            if (op.action === 'deleteMany' && op.filter && Object.keys(op.filter).length > 0) {
                const checkResults = await Employee.find(op.filter).limit(200).lean();
                if (checkResults && checkResults.length > 1) {
                    const candidates = checkResults.map(e => ({ name: e.name, employee_id: e.employee_id, department: e.department }));
                    SESSION_CONTEXT[currentSessionId] = { pendingAction: 'DELETE_AMBIGUOUS', filter: op.filter, candidates, originalPrompt: userPrompt };
                    return res.json({
                        status: 'Clarification Needed',
                        response: `I found ${candidates.length} employees matching that deletion filter. Please specify which one(s) by Employee ID or exact name.`,
                        candidates
                    });
                }
                if (checkResults && checkResults.length === 1) {
                    const matchedDoc = checkResults[0];
                    try {
                        const delRes = await executeQuery(op, Employee);
                        finalResults.push({ source: 'database', action: op.action, data: delRes, matchedDocs: [matchedDoc], filterOrPipelineUsed: op.filter || op.pipeline });
                    } catch (err) {
                        finalResults.push({ source: 'database', action: op.action, data: null, message: `Delete failed: ${err.message}`, matchedDocs: [matchedDoc], filterOrPipelineUsed: op.filter || op.pipeline });
                    }
                    continue;
                }
            }

            if (op.action === 'updateMany' && op.filter && Object.keys(op.filter).length > 0) {
                const matchedDocs = await Employee.find(op.filter).limit(200).lean();
                try {
                    const updateRes = await executeQuery(op, Employee);
                    finalResults.push({ source: 'database', action: op.action, data: updateRes, matchedDocs, filterOrPipelineUsed: op.filter || op.pipeline });
                } catch (err) {
                    finalResults.push({ source: 'database', action: op.action, data: null, message: `Update failed: ${err.message}`, matchedDocs, filterOrPipelineUsed: op.filter || op.pipeline });
                }
                continue;
            }

            if (['find', 'aggregate', 'create', 'insertMany', 'deleteMany'].includes(op.action)) {
                try {
                    const resData = await executeQuery(op, Employee, op.projection);
                    let matchedDocs = [];
                    if (op.action === 'find' && Array.isArray(resData)) matchedDocs = resData;
                    if ((op.action === 'create' || op.action === 'insertMany') && resData) matchedDocs = Array.isArray(resData) ? resData : [resData];
                    if (op.action === 'aggregate') matchedDocs = Array.isArray(resData) ? resData : (resData ? [resData] : []);
                    finalResults.push({ source: 'database', action: op.action, data: resData, matchedDocs, filterOrPipelineUsed: op.filter || op.pipeline });
                } catch (err) {
                    finalResults.push({ source: 'database', action: op.action, data: null, message: `DB failed: ${err.message}`, filterOrPipelineUsed: op.filter || op.pipeline });
                }
                continue;
            }

            try {
                const resData = await executeQuery(op, Employee, op.projection);
                finalResults.push({ source: 'database', action: op.action, data: resData, filterOrPipelineUsed: op.filter || op.pipeline });
            } catch (err) {
                finalResults.push({ source: 'database', action: op.action, data: null, message: `Execution failed: ${err.message}` });
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
        return res.status(500).json({ error: 'I encountered a major error while processing your request.', details: error.message || String(error) });
    }
};

module.exports = {
    handleAgentCommand,
    upload
};
