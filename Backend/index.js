const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allows your React app to fetch from port 5000

// Route to serve CSV data as JSON
app.get('/api/employees', (req, res) => {
  const results = [];
  const csvFilePath = path.join(__dirname, 'data', 'employees.csv');

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => {
      // CSV parsers read everything as strings. 
      // We must parse numbers so your Dashboard math works.
      const formattedData = {
        ...data,
        age: parseInt(data.age) || 0,
        performance_score: parseFloat(data.performance_score) || 0,
        salary_usd: parseFloat(data.salary_usd) || 0,
        bonus_usd: parseFloat(data.bonus_usd) || 0,
        remote_percentage: parseInt(data.remote_percentage) || 0,
        experience_years: parseInt(data.experience_years) || 0,
        promotion_count: parseInt(data.promotion_count) || 0,
        // Ensure dates are strings or handle them as needed
        hire_date: data.hire_date, 
        termination_date: data.termination_date === '' ? null : data.termination_date
      };
      results.push(formattedData);
    })
    .on('end', () => {
      res.json(results);
    })
    .on('error', (err) => {
      console.error("Error reading CSV:", err);
      res.status(500).json({ error: "Failed to read data" });
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});