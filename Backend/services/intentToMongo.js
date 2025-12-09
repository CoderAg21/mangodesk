// services/intentToMongo.js
const translateIntent = (aiResult) => {
    const operations = Array.isArray(aiResult) ? aiResult : [aiResult];
    const mongoOperations = [];

    for (const rawOp of operations) {
        const { intent, collection, query, filter, data, pipeline, projection } = rawOp || {};
        const targetCollection = collection || 'employees';
        const effectiveFilter = query || filter || {};

        switch (intent) {
            case 'READ_DB':
                mongoOperations.push({ action: 'find', collection: targetCollection, filter: effectiveFilter, projection });
                break;

            case 'AGGREGATE_DB':
                if (!pipeline || pipeline.length === 0) throw new Error("Aggregation missing 'pipeline'.");
                mongoOperations.push({ action: 'aggregate', collection: targetCollection, pipeline, projection });
                break;

            case 'UPDATE_DB':
                if (!data) throw new Error("Update missing 'data' field.");
                const updateObject = Object.keys(data).some(k => k.startsWith('$')) ? data : { $set: data };
                mongoOperations.push({ action: 'updateMany', collection: targetCollection, filter: effectiveFilter || {}, update: updateObject, projection });
                break;

            case 'WRITE_DB':
                if (!data) throw new Error("Create missing 'data' field.");
                mongoOperations.push({ action: Array.isArray(data) ? 'insertMany' : 'create', collection: targetCollection, data, projection });
                break;

            case 'DELETE_DB':
                if (!effectiveFilter || Object.keys(effectiveFilter).length === 0) throw new Error("Safety: Specify a filter to delete.");
                mongoOperations.push({ action: 'deleteMany', collection: targetCollection, filter: effectiveFilter, projection });
                break;

            case 'DELETE_ALL':
                throw new Error("DELETE_ALL requires controller confirmation.");

            case 'AMBIGUOUS_QUERY':
            case 'NON_DB_QUERY':
            case 'CHAT_RESPONSE':
                break;

            default:
                mongoOperations.push({ action: 'unknown', reason: `Intent '${intent}' not supported.` });
                break;
        }
    }
    return mongoOperations;
};

module.exports = { translateIntent };
