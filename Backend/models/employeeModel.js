const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    employee_id: { 
        type: String, 
        unique: true // Good practice: Ensure IDs are unique
    },
    name: String,
    department: String,
    role: String,
    country: String,
    office_location: String,
    
    // CHANGE 1: Use Date type for better querying (sorting, ranges)
    hire_date: Date, 
    termination_date: Date, 
    
    salary_usd: Number,
    bonus_usd: Number,
    stock_options: Number,
    
    // CHANGE 2: Mongoose uses 'Number' for decimals, not 'Float'
    performance_score: Number, 
    
    promotion_count: Number,
    project_count: Number,
    deals_closed: Number,
    avg_deal_size_usd: Number,
    client_revenue_usd: Number,
    
    // CHANGE 2: Fixed here as well
    customer_satisfaction: Number, 
    
    work_hours_per_week: Number,
    remote_percentage: Number
});

const employeeModel = mongoose.model("Employee", employeeSchema);
module.exports = employeeModel;