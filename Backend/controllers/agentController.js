// controllers/agentController.js
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { classifyIntent } = require("../services/intentClassifier");
const { translateIntent } = require("../services/intentToMongo");
const { executeQuery } = require("../services/queryEngine");
const { executeCSVQuery } = require("../services/csvEngine");
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

// --- INTELLIGENT SCHEMA MAPPING ---
const SCHEMA_MAP = {
    // Identity
    'id': 'employee_id', 'emp_id': 'employee_id', 'employee id': 'employee_id',
    'full name': 'name', 'fullname': 'name',
    'dept': 'department', 'division': 'department', 'unit': 'department',
    'job': 'role', 'title': 'role', 'position': 'role', 'designation': 'role',
    'nation': 'country', 'region': 'country',
    'location': 'office_location', 'office': 'office_location', 'place': 'office_location', 'city': 'office_location',
    // Dates
    'joined': 'hire_date', 'hired': 'hire_date', 'start date': 'hire_date', 'joining': 'hire_date',
    'left': 'termination_date', 'fired': 'termination_date', 'quit': 'termination_date', 'exit': 'termination_date',
    // Compensation
    'salary': 'salary_usd', 'pay': 'salary_usd', 'wage': 'salary_usd', 'income': 'salary_usd', 'ctc': 'salary_usd',
    'bonus': 'bonus_usd', 'incentive': 'bonus_usd', 'commission': 'bonus_usd',
    'stock': 'stock_options', 'stocks': 'stock_options', 'equity': 'stock_options', 'shares': 'stock_options',
    // Performance & Metrics
    'score': 'performance_score', 'rating': 'performance_score', 'performance': 'performance_score',
    'promotion': 'promotion_count', 'promotions': 'promotion_count', 'promoted': 'promotion_count',
    'project': 'project_count', 'projects': 'project_count',
    'deal': 'deals_closed', 'deals': 'deals_closed', 'sales': 'deals_closed', 'closed': 'deals_closed',
    'deal size': 'avg_deal_size_usd', 'avg deal': 'avg_deal_size_usd',
    'revenue': 'client_revenue_usd', 'generated': 'client_revenue_usd',
    'satisfaction': 'customer_satisfaction', 'csat': 'customer_satisfaction',
    'hours': 'work_hours_per_week', 'work hours': 'work_hours_per_week',
    'remote': 'remote_percentage', 'wfh': 'remote_percentage', 'hybrid': 'remote_percentage'
};

const normalizeKey = (key) => {
    if (!key || typeof key !== 'string') return key;
    const cleanKey = key.toLowerCase().replace(/_/g, ' ').trim();
    return SCHEMA_MAP[cleanKey] || SCHEMA_MAP[key.toLowerCase()] || key;
};

// Recursively translates synonyms
const smartNormalize = (obj) => {
    if (Array.isArray(obj)) return obj.map(smartNormalize);
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const normalizedKey = key.startsWith('$') ? key : normalizeKey(key);
            let value = obj[key];
            
            if (typeof value === 'string' && value.startsWith('$') && value.length > 1) {
                const potentialField = value.substring(1);
                if (!['sum', 'avg', 'min', 'max', 'push', 'addToSet', 'match', 'group'].includes(potentialField)) {
                    const mappedField = normalizeKey(potentialField);
                    if (mappedField !== potentialField) value = '$' + mappedField;
                }
            } else {
                value = smartNormalize(value);
            }
            acc[normalizedKey] = value;
            return acc;
        }, {});
    }
    return obj;
};

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
    const displayResults = results.filter(r => r.source !== 'CSV');
    const effectiveResults = displayResults.length > 0 ? displayResults : results;

    if (!effectiveResults || effectiveResults.length === 0) return "I completed the request, but there was no data returned.";

    const firstIntent = intentResults[0] || {};
    const firstResult = effectiveResults.find(r => r.action && r.action !== 'unknown') || effectiveResults[0] || {};
    const action = firstResult.action || 'unknown';

    if (firstIntent.intent === 'CHAT_RESPONSE') return firstIntent.response || "Okay, I've noted that.";
    if (firstIntent.intent === 'NON_DB_QUERY') return "I'm here to work with your employee database. I can't answer general knowledge or math questions.";
    if (action === 'unknown') return firstResult.message || "I couldn't translate that into an action. Could you rephrase?";

    if (effectiveResults.length > 1) {
        const parts = effectiveResults.map((r, idx) => {
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
        const header = `I've completed a sequence of ${effectiveResults.length} operation${effectiveResults.length > 1 ? 's' : ''}.`;
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

        console.log(`\n🔹 [Agent] New Request | Session: ${currentSessionId}`);
        console.log(`🔹 [Agent] Prompt: "${userPrompt}"`);
        if (attachedFile) console.log(`🔹 [Agent] File Attached: ${attachedFile.originalname}`);

        if (userPrompt && userPrompt.toLowerCase().includes('confirm delete') && SESSION_CONTEXT[currentSessionId]?.pendingAction === 'DELETE_ALL') {
            console.log("🔸 [Agent] Delete Confirmation Received.");
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
                console.error("❌ [Agent] File Read Error:", err);
                return res.status(500).json({ error: "Failed to read saved file." });
            }
        }

        const context = SESSION_CONTEXT[currentSessionId] || {};
        const intentResults = await classifyIntent(augmentedPrompt, JSON.stringify(context));
        const firstIntent = intentResults[0] || {};

        console.log("🔹 [Agent] Classified Intent:", firstIntent.intent);

        if (firstIntent.intent === 'ERROR') return res.status(500).json(firstIntent);
        if (firstIntent.intent === 'NON_DB_QUERY') {
            return res.json({ status: 'Non-DB', response: generateAgentResponse([], intentResults) });
        }
        
        // --- FIXED AMBIGUOUS QUERY HANDLING ---
        if (firstIntent.intent === 'AMBIGUOUS_QUERY') {
            console.log("🔸 [Agent] Ambiguous Query Detected.");
            // SAFETY FIX: Ensure 'opts' is always an array
            let opts = Array.isArray(firstIntent.suggestions) ? firstIntent.suggestions : [];
            if (opts.length === 0 && firstIntent.suggestions) {
                 // Try to force it into an array if it came back as a string
                 opts = [String(firstIntent.suggestions)];
            }

            return res.json({
                status: 'Clarification Needed',
                response: `Your query is ambiguous. Please clarify by choosing one of these fields: ${opts.join(', ')}`,
                options: opts
            });
        }

        if (firstIntent.intent === 'DELETE_ALL' && !isConfirmed) {
            console.log("⚠️ [Agent] DELETE_ALL triggered without confirmation.");
            SESSION_CONTEXT[currentSessionId] = { pendingAction: 'DELETE_ALL', originalPrompt: userPrompt };
            return res.json({
                status: 'Confirmation Required',
                response: 'WARNING: You are attempting to delete the entire employee database. Reply with "confirm delete" to proceed.',
                meta: { requiresConfirmation: true }
            });
        }

        const dbOperations = translateIntent(intentResults);
        console.log(`🔹 [Agent] Generated ${dbOperations.length} Operation(s)`);

        const finalResults = [];

        for (const op of dbOperations) {
            if (!op || op.action === 'unknown') {
                console.warn("⚠️ [Agent] Unknown Operation Encountered");
                finalResults.push({ action: 'unknown', data: null, message: op?.reason || 'unknown operation' });
                continue;
            }

            console.log(`🔸 [Agent] Processing Op: ${op.action}`);
            console.log(`   - Raw Filter:`, JSON.stringify(op.filter));

            // Normalize schema terms
            if (op.filter) op.filter = smartNormalize(op.filter);
            if (op.data) op.data = smartNormalize(op.data);
            if (op.projection) op.projection = smartNormalize(op.projection);
            if (op.pipeline) op.pipeline = smartNormalize(op.pipeline);

            console.log(`   - Normalized Filter:`, JSON.stringify(op.filter));

            // Special Case: Ambiguous Delete Check
            if (op.action === 'deleteMany' && op.filter && Object.keys(op.filter).length > 0) {
                const checkResults = await Employee.find(op.filter).limit(200).lean();
                if (checkResults && checkResults.length > 1) {
                    console.log(`🔸 [Agent] Ambiguous Delete: Found ${checkResults.length} matches.`);
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
                        console.log("   - MongoDB Delete Success");
                        finalResults.push({ source: 'database', action: op.action, data: delRes, matchedDocs: [matchedDoc], filterOrPipelineUsed: op.filter || op.pipeline });

                        try {
                            const csvData = await executeCSVQuery(op);
                            if (csvData && !csvData.message) {
                                console.log("   - CSV Delete Success");
                                finalResults.push({ source: 'CSV', action: op.action, data: csvData, matchedDocs: [matchedDoc], filterOrPipelineUsed: op.filter });
                            }
                        } catch (csvErr) { console.warn("❌ [Agent] CSV Error:", csvErr.message); }

                    } catch (err) {
                        console.error("❌ [Agent] Delete Failed:", err.message);
                        finalResults.push({ source: 'database', action: op.action, data: null, message: `Delete failed: ${err.message}`, matchedDocs: [matchedDoc], filterOrPipelineUsed: op.filter || op.pipeline });
                    }
                    continue;
                }
            }

            // Special Case: Update with Filter Check
            if (op.action === 'updateMany' && op.filter && Object.keys(op.filter).length > 0) {
                const matchedDocs = await Employee.find(op.filter).limit(200).lean();
                try {
                    const updateRes = await executeQuery(op, Employee);
                    console.log("   - MongoDB Update Success");
                    finalResults.push({ source: 'database', action: op.action, data: updateRes, matchedDocs, filterOrPipelineUsed: op.filter || op.pipeline });

                    try {
                        const csvData = await executeCSVQuery(op);
                        if (csvData && !csvData.message) {
                            console.log("   - CSV Update Success");
                            finalResults.push({ source: 'CSV', action: op.action, data: csvData, matchedDocs, filterOrPipelineUsed: op.filter });
                        }
                    } catch (csvErr) { console.warn("❌ [Agent] CSV Error:", csvErr.message); }

                } catch (err) {
                    console.error("❌ [Agent] Update Failed:", err.message);
                    finalResults.push({ source: 'database', action: op.action, data: null, message: `Update failed: ${err.message}`, matchedDocs, filterOrPipelineUsed: op.filter || op.pipeline });
                }
                continue;
            }

            // General Mongo Operations
            if (['find', 'aggregate', 'create', 'insertMany', 'deleteMany'].includes(op.action)) {
                try {
                    const resData = await executeQuery(op, Employee, op.projection);
                    let matchedDocs = [];
                    if (op.action === 'find' && Array.isArray(resData)) matchedDocs = resData;
                    if ((op.action === 'create' || op.action === 'insertMany') && resData) matchedDocs = Array.isArray(resData) ? resData : [resData];
                    if (op.action === 'aggregate') matchedDocs = Array.isArray(resData) ? resData : (resData ? [resData] : []);
                    
                    console.log(`   - MongoDB ${op.action} Success. Count: ${Array.isArray(resData) ? resData.length : 1}`);
                    finalResults.push({ source: 'database', action: op.action, data: resData, matchedDocs, filterOrPipelineUsed: op.filter || op.pipeline });

                    try {
                        const csvData = await executeCSVQuery(op);
                        if (csvData && !csvData.message) {
                            console.log(`   - CSV ${op.action} Success`);
                            finalResults.push({ source: 'CSV', action: op.action, data: csvData, matchedDocs: (op.action === 'find' ? csvData : []), filterOrPipelineUsed: op.filter || op.pipeline });
                        }
                    } catch (csvErr) { console.warn("❌ [Agent] CSV Error:", csvErr.message); }

                } catch (err) {
                    console.error(`❌ [Agent] MongoDB ${op.action} Failed:`, err.message);
                    finalResults.push({ source: 'database', action: op.action, data: null, message: `DB failed: ${err.message}`, filterOrPipelineUsed: op.filter || op.pipeline });
                }
                continue;
            }

            // Fallback
            try {
                const resData = await executeQuery(op, Employee, op.projection);
                console.log("   - MongoDB Fallback Exec Success");
                finalResults.push({ source: 'database', action: op.action, data: resData, filterOrPipelineUsed: op.filter || op.pipeline });
                
                try {
                    const csvData = await executeCSVQuery(op);
                    if (csvData && !csvData.message) {
                        console.log("   - CSV Fallback Exec Success");
                        finalResults.push({ source: 'CSV', action: op.action, data: csvData, filterOrPipelineUsed: op.filter || op.pipeline });
                    }
                } catch (csvErr) { console.warn("❌ [Agent] CSV Error:", csvErr.message); }

            } catch (err) {
                console.error("❌ [Agent] Fallback Exec Failed:", err.message);
                finalResults.push({ source: 'database', action: op.action, data: null, message: `Execution failed: ${err.message}` });
            }
        }

        const aiResponse = generateAgentResponse(finalResults, intentResults);
        console.log("🔹 [Agent] Final AI Response:", aiResponse);
        console.log("🔹 [Agent] Final Results Array Length:", finalResults.length);

        console.log({ status: 'Success',
            response: aiResponse,
            results: finalResults,
            meta: { originalPrompt: userPrompt }})

        return res.json({
            status: 'Success',
            response: aiResponse,
            results: finalResults,
            meta: { originalPrompt: userPrompt }
        });

    } catch (error) {
        console.error("❌ [Agent] Critical Error:", error);
        return res.status(500).json({ error: 'I encountered a major error while processing your request.', details: error.message || String(error) });
    }
};

module.exports = {
    handleAgentCommand,
    upload
};