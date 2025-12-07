// Backend/services/intentToMongo.js - FINALIZED FIX for Update Operators

/**
 * Translates the AI's "Intent Object" into a specific MongoDB Execution Operation.
 * INPUT: Array of AI Intent Objects
 * OUTPUT: Array of Executable MongoDB Operation Objects
 */

const translateIntent = (aiResult) => {
    // CRITICAL: We now iterate over a potential array of AI results
    const operations = Array.isArray(aiResult) ? aiResult : [aiResult];
    const mongoOperations = [];

    for (const { intent, collection, query, data, pipeline } of operations) {
        // 1. Safety Check: Default to 'employees' collection
        const targetCollection = collection || 'employees';

        // 2. Map Intents to Database Actions
        switch (intent) {
            case 'READ_DB':
                mongoOperations.push({ action: 'find', collection: targetCollection, filter: query || {} });
                break;

            case 'AGGREGATE_DB':
                if (!pipeline || pipeline.length === 0) {
                    throw new Error("Aggregation intent missing 'pipeline' stages.");
                }
                mongoOperations.push({ action: 'aggregate', collection: targetCollection, pipeline: pipeline });
                break;

            case 'UPDATE_DB':
                if (!data) throw new Error("Update intent missing 'data' field.");
                
                // CRITICAL FIX: Check if the AI output contains a top-level MongoDB operator (like $set, $inc, $mul, etc.)
                const isOperatorPresent = Object.keys(data).some(key => key.startsWith('$'));
                
                // If the AI provided the operator (e.g., {"$mul": {...}}), use it directly.
                // Otherwise, wrap the data in $set for simple field replacements.
                const updateObject = isOperatorPresent ? data : { $set: data };

                mongoOperations.push({
                    action: 'updateMany', // Use updateMany for batch/mass updates
                    collection: targetCollection,
                    filter: query || {},
                    update: updateObject 
                });
                break;

            case 'WRITE_DB':
                if (!data) throw new Error("Create intent missing 'data' field.");
                
                // Handle both single object ('create') or array of objects ('insertMany')
                const action = Array.isArray(data) ? 'insertMany' : 'create';
                mongoOperations.push({ action, collection: targetCollection, data });
                break;

            case 'DELETE_DB':
                const isGlobalWipeConfirmed = query && query.confirm_global_wipe === true;

                // Safety Block
                if (!isGlobalWipeConfirmed && (!query || Object.keys(query).length === 0)) {
                    throw new Error("Safety Error: Must specify a target (e.g., name or ID) to delete.");
                }
                
                mongoOperations.push({
                    action: 'deleteMany', // Use deleteMany for robustness
                    collection: targetCollection, 
                    filter: isGlobalWipeConfirmed ? {} : query 
                });
                break;
            
            default:
                mongoOperations.push({ action: 'unknown', reason: `Intent '${intent}' is not yet supported.` });
                break;
        }
    }
    // Return the array of translated operations
    return mongoOperations;
};

module.exports = { translateIntent };