const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    employee_id: { type: String, unique: true },
    name: String,
    department: String,
    role: String,
    country: String,
    office_location: String,
    
    // Dates
    hire_date: Date,
    termination_date: { type: Date, default: null }, // Handle nulls if they are still employed
    
    // Financials
    salary_usd: Number,
    bonus_usd: Number,
    stock_options: Number,
    
    // Metrics
    performance_score: Number,
    promotion_count: Number,
    project_count: Number,
    
    // Sales Specific
    deals_closed: Number,
    avg_deal_size_usd: Number,
    client_revenue_usd: Number,
    
    // HR Metrics
    customer_satisfaction: Number,
    work_hours_per_week: Number,
    remote_percentage: Number
});

module.exports = mongoose.model('Employee', employeeSchema);