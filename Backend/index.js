require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const mongoose = require('mongoose');
const { test_brain } = require('./test_brain');
const Employee = require('./models/employeeModel');
const { parseUserIntent } = require('./intentclassifier');
const { setGlobalDispatcher, ProxyAgent } = require("undici");
const session = require("express-session");
const passport = require("passport");
const passportSetup = require("./config/passport");

if (process.env.PROXY_URL) {
    console.log(`Using Proxy: ${process.env.PROXY_URL}`);
    const dispatcher = new ProxyAgent(process.env.PROXY_URL);
    setGlobalDispatcher(dispatcher);
}
const app = express();
app.use(express.json());
app.use(cors());


let isDataLoaded = false;

const MONGO_URI = 'mongodb://127.0.0.1:27017/mangoDesk';

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {secure:false}
}));

app.use(passport.initialize());
app.use(passport.session());
passportSetup(passport);
//Middlewares

//Logged in middleware




const csvFilePath = path.join(__dirname, 'data', 'employees.csv');
if (!fs.existsSync(csvFilePath)) {
  console.error(`❌ CRITICAL ERROR: 'employees.csv' not found at: ${csvFilePath}`);
  console.error("Please make sure the file is inside the 'Backend/data' folder as shown in your image.");
  process.exit(1);
}

console.log(`⏳ Loading CSV from: ${csvFilePath}`);

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
    console.log(`✅ Success! Loaded ${Employee.length} employees.`);
  });

app.get('/api/employees', (req, res) => {
  if (!isDataLoaded) {
    return res.status(503).json({ error: "Still loading data, please wait..." });
  }
  res.json(employeesData);
});




//-----------------Intent analyzing route ---------------->
app.post('/api/analyze-intent', async (req, res) => {
    try {
        // Debug Log to prove it received data
        console.log("Headers:", req.headers['content-type']);
        console.log("Body:", req.body);

        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required in body" });
        }

        console.log(`Analyzing Prompt: "${prompt}"`);

        // Call Gemini (via Proxy)
        const intentData = await parseUserIntent(prompt);

        if (intentData.error) {
            return res.status(500).json(intentData);
        }
        
        res.json(intentData);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});


//------------Login and Sign up Route------------------->
// 1. Redirect user to Google
app.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    // If they are NOT in the allowed list, they go here:
    failureRedirect: "http://localhost:3000/login?error=unauthorized", 
    
    // If they ARE in the list, they go here:
    successRedirect: "http://localhost:3000", 
  })
);

//Getting current user
app.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }
});


//  Logout
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect(process.env.CLIENT_URL);
  });
});


app.get ('/singup',(req,res)=>{
  app.send('Signup here')
})

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

