const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const mongoose = require('mongoose');
const { runTests } = require('./test_brain'); 
const Employee = require('./models/employeeModel'); 
const { parseUserIntent } = require('./intentclassifier');
// const { setGlobalDispatcher, ProxyAgent } = require("undici");
const session = require("express-session");
const passport = require("passport");
const passportSetup = require("./config/passport");
const csv = require('csv-parser');
const moment = require('moment'); 

// // Proxy Configuration
// if (process.env.PROXY_URL) {
//     console.log(`Using Proxy: ${process.env.PROXY_URL}`);
//     const dispatcher = new ProxyAgent(process.env.PROXY_URL);
//     setGlobalDispatcher(dispatcher);
// }

const app = express();
app.use(express.json());
const PORT = 5000;

app.use(cors({
    origin: "http://localhost:3000", 
    methods: "GET,POST,PUT,DELETE",
    credentials: true, 
}));

const MONGO_URI = 'mongodb://127.0.0.1:27017/mangoDesk';

// Session Setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret_key_123", 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true only if using HTTPS
  })
);

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passportSetup(passport);

// ------------------- DATA HELPER ------------------- //
const calculateTenure = (hireDate, termDate) => {
  const start = moment(hireDate, ['M/D/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']);
  if (!start.isValid()) return 0;
  
  let end = moment();
  if (termDate && termDate !== '######' && termDate.trim() !== '') {
    const term = moment(termDate, ['M/D/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']);
    if (term.isValid()) end = term;
  }
  return parseFloat(end.diff(start, 'years', true).toFixed(1));
};


// 1. Get Employees (Reads CSV on request)
app.get('/api/employees', (req, res) => {
  const results = [];
  const csvFilePath = path.join(__dirname, 'data', 'employees.csv');

  if (!fs.existsSync(csvFilePath)) {
      return res.status(500).json({ error: "CSV file not found" });
  }

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

// 2. Intent Analysis - CORRECTED
app.post('/api/analyze-intent', upload.single('file'), async (req, res) => {
    try {
        // Multer parses the form data.
        // Text fields (like 'prompt') are available in req.body.
        // The file object (if uploaded) is available in req.file.
        const { prompt } = req.body;
        const uploadedFile = req.file; // This holds the file (if one was sent)
        const result = runTests(prompt);
        console.log(result)

        console.log("Received Prompt for Intent Analysis:", prompt);
        console.log("Received File:", uploadedFile ? uploadedFile.originalname : 'No file attached');

        if (!prompt && !uploadedFile) {
            return res.status(400).json({ error: "Prompt or file attachment is required" });
        }
        
        // If you were to pass the file content to Gemini, you would need to read 
        // uploadedFile.buffer (since we used memory storage).

        console.log(`Analyzing Prompt: "${prompt}"`);
        const intentData = await parseUserIntent(prompt); // Calls Gemini

        if (intentData.error) return res.status(500).json(intentData);
        res.json(intentData);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});
// 3. Auth Routes (Google)
app.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login?error=unauthorized", 
    successRedirect: "http://localhost:3000", 
  })
);

app.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("http://localhost:3000"); // Redirect to frontend
  });
});

// 4. Test Route
app.get('/signup', (req, res) => { // Fixed typo 'singup'
  res.send('Signup here');
});

// ------------------- SERVER START ------------------- //
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(" DB Error:", err));


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:5000`);
});