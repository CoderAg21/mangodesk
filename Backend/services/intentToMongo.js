// Backend/services/intentToMongo.js

/**
 * Translates the AI's "Intent Object" into a specific MongoDB Execution Operation.
 * * INPUT: 
 * { 
 * intent: "UPDATE_DB", 
 * collection: "employees", 
 * query: { name: "John" }, 
 * data: { salary: 50000 } 
 * }
 * * OUTPUT:
 * {
 * action: "updateOne",
 * collection: "employees",
 * filter: { name: "John" },
 * update: { $set: { salary: 50000 } }
 * }
 */

const translateIntent = (aiResult) => {
    const { intent, collection, query, data } = aiResult;

    // 1. Safety Check: Default to 'employees' collection to prevent accessing system DBs
    const targetCollection = collection || 'employees';

    // 2. Map Intents to Database Actions
    switch (intent) {
        case 'READ_DB':
            return {
                action: 'find',
                collection: targetCollection,
                filter: query || {} 
            };

        case 'UPDATE_DB':
            if (!data) {
                throw new Error("Update intent missing 'data' field.");
            }
            return {
                action: 'updateOne',
                collection: targetCollection,
                filter: query || {},
                update: { $set: data } // CRITICAL: Use $set so we don't overwrite the whole document
            };
        case 'WRITE_DB':
            if (!data) throw new Error("Create intent missing 'data' field.");
            return {
                action: 'create',
                collection: targetCollection,
                data: data
            };

        case 'DELETE_DB':
            const isGlobalWipeConfirmed = query && query.confirm_global_wipe === true;

            // Safety Block: If no filter is given AND the override keyword is missing, throw an error.
            if (!isGlobalWipeConfirmed && (!query || Object.keys(query).length === 0)) {
                throw new Error("Safety Error: Must specify a target (e.g., name or ID) to delete.");
            }
            
            return {
                action: 'deleteMany', // Use deleteMany for robustness
                collection: targetCollection, 
                // If confirmed, filter is empty {} to delete everything. Otherwise, use the filter.
                filter: isGlobalWipeConfirmed ? {} : query 
            };
        
        default:
            return {
                action: 'unknown',
                reason: `Intent '${intent}' is not yet supported.`
            };
    }
};

module.exports = { translateIntent };