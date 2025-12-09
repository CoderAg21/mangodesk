// Backend/services/intentToMongo.js - MODIFIED for DELETE_ALL

/**
 * Translates the AI's "Intent Object" into a specific MongoDB Execution Operation.
 * INPUT: Array of AI Intent Objects
 * OUTPUT: Array of Executable MongoDB Operation Objects
 */

const translateIntent = (aiResult) => {
    const operations = Array.isArray(aiResult) ? aiResult : [aiResult];
    const mongoOperations = [];

    for (const { intent, collection, query, data, pipeline } of operations) {
        const targetCollection = collection || 'employees';

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
                
                const isOperatorPresent = Object.keys(data).some(key => key.startsWith('$'));
                const updateObject = isOperatorPresent ? data : { $set: data };

                mongoOperations.push({
                    action: 'updateMany',
                    collection: targetCollection,
                    filter: query || {},
                    update: updateObject 
                });
                break;

            case 'WRITE_DB':
                if (!data) throw new Error("Create intent missing 'data' field.");
                
                const action = Array.isArray(data) ? 'insertMany' : 'create';
                mongoOperations.push({ action, collection: targetCollection, data });
                break;

            case 'DELETE_DB':
                // Check if the query is too broad (no query provided)
                if (!query || Object.keys(query).length === 0) {
                    throw new Error("Safety Error: Must specify a filter to delete.");
                }
                
                mongoOperations.push({
                    action: 'deleteMany',
                    collection: targetCollection, 
                    filter: query 
                });
                break;
            
            case 'DELETE_ALL':
                // DELETE_ALL bypasses filter check and is handled by the controller for confirmation.
                // It is left blank here because the controller modifies the intent to DELETE_DB after confirmation.
                // If it somehow reached here without confirmation, it's an error.
                throw new Error("DELETE_ALL intent requires confirmation handling in the controller.");

            case 'AMBIGUOUS_QUERY':
            case 'NON_DB_QUERY':
            case 'CHAT_RESPONSE':
                // These are informational intents handled directly by the controller, skip translation.
                break;

            default:
                mongoOperations.push({ action: 'unknown', reason: `Intent '${intent}' is not yet supported.` });
                break;
        }
    }
    return mongoOperations;
};

module.exports = { translateIntent };