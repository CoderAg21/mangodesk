// Backend/services/queryEngine.js

/**
 * Executes the translated operation against the MongoDB Model.
 * INPUT: 
 * operation: { action: 'find', filter: {...} }
 * Model: Mongoose Model (Employee)
 */
const executeQuery = async (operation, Model) => {
    const { action, filter, update } = operation;

    try {
        switch (action) {
            case 'find':
                // Return top 20 results to avoid overloading the AI
                return await Model.find(filter).limit(20);

            case 'updateOne':
                // Returns { acknowledged: true, modifiedCount: 1 }
                return await Model.updateOne(filter, update);

            default:
                throw new Error(`Execution Action '${action}' not supported.`);
        }
    } catch (error) {
        console.error("Query Execution Error:", error);
        throw error;
    }
};

module.exports = { executeQuery };