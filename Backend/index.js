const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const moment = require('moment'); // You might need to install moment: npm install moment

const app = express();
const PORT = 5000;

app.use(cors());

// Helper to calculate tenure in years
const calculateTenure = (hireDate, termDate) => {
  const start = moment(hireDate, ['M/D/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']);
  if (!start.isValid()) return 0;
  
  // If termDate is invalid, empty, or '######', assume current date
  let end = moment();
  if (termDate && termDate !== '######' && termDate.trim() !== '') {
    const term = moment(termDate, ['M/D/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']);
    if (term.isValid()) end = term;
  }

  return parseFloat(end.diff(start, 'years', true).toFixed(1));
};

app.get('/api/employees', (req, res) => {
  const results = [];
  const csvFilePath = path.join(__dirname, 'data', 'employees.csv');

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => {
      // Parse Numbers
      const salary = parseFloat(data.salary_usd) || 0;
      const bonus = parseFloat(data.bonus_usd) || 0;
      const stock = parseFloat(data.stock_options) || 0;
      
      const formattedData = {
        id: data.employee_id,
        name: data.name,
        department: data.department || 'Unknown',
        role: data.role || 'Unknown',
        country: data.country || 'Unknown',
        office: data.office_location || 'Remote',
        
        // Dates & Tenure
        hire_date: data.hire_date,
        termination_date: data.termination_date === '######' ? null : data.termination_date,
        tenure_years: calculateTenure(data.hire_date, data.termination_date),
        
        // Financials
        salary_usd: salary,
        bonus_usd: bonus,
        stock_options: stock,
        total_comp: salary + bonus + stock,
        
        // Performance & Work Stats
        performance_score: parseFloat(data.performance_score) || 0,
        promotion_count: parseInt(data.promotion_count) || 0,
        project_count: parseInt(data.project_count) || 0,
        work_hours: parseFloat(data.work_hours) || 0,
        remote_percentage: parseInt(data.remote_percentage) || 0,
        
        // Sales/Client Stats
        deals_closed: parseInt(data.deals_closed) || 0,
        avg_deal_size: parseFloat(data.avg_deal_size) || 0,
        client_reviews: parseFloat(data.client_reviews) || 0,
        customer_satisfaction: parseFloat(data.customer_satisfaction) || 0,
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