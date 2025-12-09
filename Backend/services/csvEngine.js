// services/csvEngine.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// --- Helper: Parse CSV to JSON Array ---
const readCSV = (filePath) => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((header, index) => {
                // simple type conversion
                let val = values[index] ? values[index].trim() : '';
                if (!isNaN(val) && val !== '') val = Number(val);
                obj[header] = val;
            });
            return obj;
        });
    } catch (err) {
        console.error("CSV Read Error:", err);
        return [];
    }
};

// --- Helper: Write JSON Array to CSV ---
const writeCSV = (filePath, data) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row => headers.map(fieldName => row[fieldName]).join(','))
    ].join('\n');
    fs.writeFileSync(filePath, csvContent, 'utf8');
};

// --- Helper: Basic MongoDB Filter Matcher for JS Objects ---
const matchesFilter = (item, filter) => {
    if (!filter || Object.keys(filter).length === 0) return true;
    
    return Object.keys(filter).every(key => {
        const filterVal = filter[key];
        const itemVal = item[key];

        // Handle Operators like $gt, $lt
        if (typeof filterVal === 'object' && filterVal !== null) {
            if (filterVal.$gt !== undefined) return itemVal > filterVal.$gt;
            if (filterVal.$gte !== undefined) return itemVal >= filterVal.$gte;
            if (filterVal.$lt !== undefined) return itemVal < filterVal.$lt;
            if (filterVal.$lte !== undefined) return itemVal <= filterVal.$lte;
            if (filterVal.$ne !== undefined) return itemVal !== filterVal.$ne;
            if (filterVal.$in !== undefined) return filterVal.$in.includes(itemVal);
            return false;
        }
        // Exact match
        return String(itemVal).toLowerCase() === String(filterVal).toLowerCase();
    });
};

// --- Main Execution Function ---
const executeCSVQuery = async (operation) => {
    // 1. Find the most recent CSV file or specific file
    if (!fs.existsSync(DATA_DIR)) return { message: "Data directory not found." };
    
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.csv'));
    if (files.length === 0) return { message: "No CSV files found to manipulate." };
    
    // Default to the last modified file for context
    const latestFile = files.map(name => ({
        name,
        time: fs.statSync(path.join(DATA_DIR, name)).mtime.getTime()
    })).sort((a, b) => b.time - a.time)[0].name;

    const filePath = path.join(DATA_DIR, latestFile);
    let data = readCSV(filePath);
    let result = null;

    switch (operation.action) {
        case 'find':
            result = data.filter(item => matchesFilter(item, operation.filter));
            break;

        case 'insertMany':
        case 'create':
            const newItems = Array.isArray(operation.data) ? operation.data : [operation.data];
            data.push(...newItems);
            writeCSV(filePath, data);
            result = newItems;
            break;

        case 'updateMany':
            let modifiedCount = 0;
            const matchedDocs = [];
            data = data.map(item => {
                if (matchesFilter(item, operation.filter)) {
                    // Update fields
                    const updates = operation.update || operation.data || {};
                    Object.keys(updates).forEach(k => {
                        // Handle $set if present, otherwise direct
                        const val = updates[k]; // Simplified (doesn't handle complex MongoDB update ops)
                        if (k !== '$set') item[k] = val;
                    });
                    if (updates.$set) {
                        Object.keys(updates.$set).forEach(sk => item[sk] = updates.$set[sk]);
                    }
                    modifiedCount++;
                    matchedDocs.push(item);
                }
                return item;
            });
            if (modifiedCount > 0) writeCSV(filePath, data);
            result = { modifiedCount, matchedDocs };
            break;

        case 'deleteMany':
            const initialLen = data.length;
            data = data.filter(item => !matchesFilter(item, operation.filter));
            const deletedCount = initialLen - data.length;
            if (deletedCount > 0) writeCSV(filePath, data);
            result = { deletedCount };
            break;

        case 'aggregate':
            // Very basic aggregation (only supports simple filtering for now)
            // Real aggregation on CSV requires a heavier engine, filtering is safe fallback
            const pipelineMatch = operation.pipeline?.find(p => p.$match)?.$match;
            result = data.filter(item => matchesFilter(item, pipelineMatch || {}));
            break;

        default:
            return { message: "Action not supported for CSV." };
    }

    return result;
};

module.exports = { executeCSVQuery };