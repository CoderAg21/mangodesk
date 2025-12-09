// services/queryEngine.js
const executeQuery = async (operation, Model, projection = null) => {
    const { action, filter, update, pipeline, data } = operation || {};

    const generateEmployeeId = (doc) => doc?.employee_id || `EMP-${Math.floor(Math.random() * 900000 + 100000)}`;

    try {
        switch (action) {
            case 'find': {
                const q = filter || {};
                const query = Model.find(q).limit(200);
                if (projection && typeof projection === 'object') query.select(projection);
                return await query.lean();
            }

            case 'aggregate': {
                const p = Array.isArray(pipeline) ? pipeline : [];
                return await Model.aggregate(p);
            }

            case 'updateMany': {
                return await Model.updateMany(filter || {}, update || {});
            }

            case 'insertMany': {
                const docs = (Array.isArray(data) ? data : []).map(doc => ({ ...doc, employee_id: generateEmployeeId(doc) }));
                return await Model.insertMany(docs);
            }

            case 'create': {
                const doc = { ...data, employee_id: generateEmployeeId(data || {}) };
                return await Model.create(doc);
            }

            case 'deleteMany': {
                return await Model.deleteMany(filter || {});
            }

            default:
                throw new Error(`Action '${action}' not supported.`);
        }
    } catch (error) {
        throw error;
    }
};

module.exports = { executeQuery };
