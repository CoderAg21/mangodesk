// Backend/services/queryEngine.js - FIX for Employee ID Validation

/**
 * Executes the translated operation against the MongoDB Model.
 * INPUT: 
 * operation: { action: 'find', filter: {...} } or { action: 'aggregate', pipeline: [...] }
 * Model: Mongoose Model (Employee)
 */
const executeQuery = async (operation, Model) => {
    const { action, filter, update, pipeline } = operation;

    // Helper function to create a random ID
    const generateEmployeeId = (data) => data.employee_id || `EMP-${Math.floor(Math.random() * 900000 + 100000)}`;

    try {
        switch (action) {
            case 'find':
                // Return top 20 results to avoid overloading the response
                return await Model.find(filter).limit(20);

            case 'aggregate':
                return await Model.aggregate(pipeline); 
                
            case 'updateMany':
                return await Model.updateMany(filter, update);

            case 'insertMany': // MODIFIED: Handle batch creation
                // 1. Ensure every employee document has an employee_id
                const docsToInsertBatch = operation.data.map(doc => ({
                    ...doc,
                    employee_id: generateEmployeeId(doc) // Apply ID generation to each document
                }));
                
                // 2. Insert the prepared batch
                return await Model.insertMany(docsToInsertBatch); 
            
            case 'create':
                // MODIFIED: Use the helper function for single creation too
                const docToInsert = {
                    ...operation.data,
                    employee_id: generateEmployeeId(operation.data)
                };
                return await Model.create(docToInsert);

            case 'deleteMany':
                return await Model.deleteMany(filter);
                
            default:
                throw new Error(`Execution Action '${action}' not supported.`);
        }
    } catch (error) {
        console.error("Query Execution Error:", error);
        throw error;
    }
};

module.exports = { executeQuery };