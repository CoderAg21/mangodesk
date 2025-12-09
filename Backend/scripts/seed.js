require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const Employee = require('../models/Employee');

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mangodesk';

mongoose.connect(MONGO_URI)
  .then(() => console.log(' Connected to MongoDB for Seeding'))
  .catch(err => {
    console.error(' DB Connection Error:', err);
    process.exit(1);
  });

const results = [];
const csvFilePath = path.join(__dirname, '../data', 'employees.csv');

// Synthetic Data Helpers
const educationLevels = ['B.Tech', 'M.Tech', 'PhD', 'MBA', 'B.Sc'];
const genders = ['Male', 'Female'];
const currentYear = new Date().getFullYear();

// Helper function to generate a unique Employee ID (matching queryEngine logic)
const generateEmployeeId = (data) => data.employee_id || `EMP-${Math.floor(Math.random() * 900000 + 100000)}`;

console.log(` Reading CSV from: ${csvFilePath}`);

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    // Generate the same synthetic data as your original app
    const hireYear = row.hire_date ? new Date(row.hire_date).getFullYear() : 2020;
    
    const employeeData = {
      ...row,
      // CRITICAL FIX: Ensure every employee has an ID, using a new ID if not present in the CSV row
      employee_id: generateEmployeeId(row),
      
      // Ensure numbers are numbers
      salary_usd: parseInt(row.salary_usd) || 0,
      bonus_usd: parseInt(row.bonus_usd) || 0,
      performance_score: parseFloat(row.performance_score) || 3.0,
      promotion_count: parseInt(row.promotion_count) || 0,
      remote_percentage: parseInt(row.remote_percentage) || 0,
      
      // Add Synthetic Fields
      age: (currentYear - hireYear) + 22 + Math.floor(Math.random() * 10),
      gender: genders[Math.floor(Math.random() * genders.length)],
      education: educationLevels[Math.floor(Math.random() * educationLevels.length)],
      experience_years: currentYear - hireYear
    };

    results.push(employeeData);
  })
  .on('end', async () => {
    try {
      console.log(` Parsed ${results.length} employees. Inserting into MongoDB...`);
      
      // Clear existing data to avoid duplicates
      await Employee.deleteMany({});
      console.log('🧹 Cleared old data.');

      // Insert new data
      await Employee.insertMany(results);
      console.log(' Database successfully seeded!');
      
      process.exit(0);
    } catch (error) {
      console.error(' Seeding Failed:', error);
      process.exit(1);
    }
  });