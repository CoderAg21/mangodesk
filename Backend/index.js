const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
app.use(cors());

const agentRoutes = require('./routes/agentRoutes');

// --- DATABASE CONNECTION ---
// If you have a cloud URI (Atlas), put it in .env. Otherwise use local.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mangodesk';

mongoose.connect(MONGO_URI)
  .then(() => console.log(' MongoDB Connected Successfully'))
  .catch(err => console.error(' MongoDB Connection Error:', err));

let employeesData = [];
let isDataLoaded = false;

// Helper arrays for synthetic data
const educationLevels = ['B.Tech', 'M.Tech', 'PhD', 'MBA', 'B.Sc'];
const genders = ['Male', 'Female'];
const currentYear = new Date().getFullYear();

// --- CRITICAL FIX: POINT TO THE 'data' FOLDER ---
const csvFilePath = path.join(__dirname, 'data', 'employees.csv');

// Check if file exists before crashing
if (!fs.existsSync(csvFilePath)) {
  console.error(` CRITICAL ERROR: 'employees.csv' not found at: ${csvFilePath}`);
  console.error("Please make sure the file is inside the 'Backend/data' folder as shown in your image.");
  process.exit(1);
}

console.log(` Loading CSV from: ${csvFilePath}`);

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (row) => {
    try {
      // Calculate missing fields
      const hireYear = row.hire_date ? new Date(row.hire_date).getFullYear() : 2020;
      const age = (currentYear - hireYear) + 22 + Math.floor(Math.random() * 10);
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const education = educationLevels[Math.floor(Math.random() * educationLevels.length)];
      const leaves = Math.floor(Math.random() * 25);

      employeesData.push({
        ...row,
        salary_usd: parseInt(row.salary_usd) || 0,
        bonus_usd: parseInt(row.bonus_usd) || 0,
        performance_score: parseFloat(row.performance_score) || 3.0,
        promotion_count: parseInt(row.promotion_count) || 0,
        remote_percentage: parseInt(row.remote_percentage) || 0,
        age: age,
        gender: gender,
        education: education,
        leaves_taken: leaves,
        experience_years: currentYear - hireYear
      });
    } catch (err) {
      // Skip bad rows quietly
    }
  })
  .on('end', () => {
    isDataLoaded = true;
    console.log(` Success! Loaded ${employeesData.length} employees.`);
  });

app.get('/api/employees', (req, res) => {
  if (!isDataLoaded) {
    return res.status(503).json({ error: "Still loading data, please wait..." });
  }
  res.json(employeesData);
});

app.use('/api/brain', agentRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));