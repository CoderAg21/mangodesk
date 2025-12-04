// Backend/models/Employee.js
const mongoose = require('mongoose');

// We define a flexible schema to match your CSV data
const employeeSchema = new mongoose.Schema({
    employee_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    department: String,
    role: String,
    country: String,
    salary_usd: Number,
    performance_score: Number,
    work_hours_per_week: Number,
    remote_percentage: Number,
    // Synthetic fields you were calculating in index.js
    age: Number,
    gender: String,
    education: String,
    email: String
}, { 
    timestamps: true, // Adds createdAt and updatedAt automatically
    strict: false     // Allows us to add extra CSV fields without breaking
});

module.exports = mongoose.model('Employee', employeeSchema);