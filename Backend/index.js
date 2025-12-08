const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const moment = require('moment'); // Required for date handling
const fs = require('fs');         // Required for file system operations (CSV read)
const csv = require('csv-parser'); // Assuming 'csv-parser' is used for CSV parsing

const agentRoutes = require('./routes/agentRoutes');
const passportSetup = require("./config/passport");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mangodesk';
const csvFilePath = path.join(__dirname, 'data', 'employees.csv'); // Define CSV path

// --- Helper Functions ---

/**
 * Calculates the tenure in years between a hire date and a termination date (or today).
 * @param {string} hireDate - The hire date string.
 * @param {string} termDate - The optional termination date string.
 * @returns {number} Tenure in years.
 */
const calculateTenure = (hireDate, termDate) => {
    const start = moment(hireDate, ['M/D/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']);
    
    let end = moment(); // Default end date is today
    if (termDate && termDate !== '######' && termDate.trim() !== '') {
        const term = moment(termDate, ['M/D/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']);
        if (term.isValid()) end = term;
    }

    // Ensure both dates are valid before calculating difference
    if (!start.isValid() || !end.isValid()) return 0;
    
    // Calculate difference in years (true for floating point result)
    return end.diff(start, 'years', true); 
};


// --- Middleware Configuration ---
app.use(express.json()); // To parse JSON bodies
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));


app.use(session({
    secret: process.env.SESSION_SECRET || "fallback_secret_key_123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, 
}));

app.use(passport.initialize());
app.use(passport.session());
passportSetup(passport);

// --- ROUTES ---

// AI Agent Route (Handles data queries and file uploads via multer middleware inside agentRoutes)
app.use('/api/brain', agentRoutes); 

// Contact Form Route
app.use('/api/contact', contactRoutes);


// Route: Get Employees from CSV (Example legacy route)
app.get('/api/employees', (req, res) => {
    const results = [];
    // Check for the file existence before attempting to read
    if (!fs.existsSync(csvFilePath)) {
        return res.status(500).json({ error: "CSV file not found at expected path." });
    }
    
    fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (data) => {
            // Data type casting and cleaning
            const salary = parseFloat(data.salary_usd) || 0;
            const bonus = parseFloat(data.bonus_usd) || 0;
            const stock = parseFloat(data.stock_options) || 0;
            const terminationDate = data.termination_date === '######' ? null : data.termination_date;

            results.push({
                id: data.employee_id,
                name: data.name,
                department: data.department || 'Unknown',
                role: data.role || 'Unknown',
                country: data.country || 'Unknown',
                office: data.office_location || 'Remote',
                hire_date: data.hire_date,
                termination_date: terminationDate,
                tenure_years: calculateTenure(data.hire_date, terminationDate),
                salary_usd: salary,
                bonus_usd: bonus,
                stock_options: stock,
                total_comp: salary + bonus + stock,
                performance_score: parseFloat(data.performance_score) || 0,
                promotion_count: parseInt(data.promotion_count) || 0,
                project_count: parseInt(data.project_count) || 0,
                work_hours: parseFloat(data.work_hours) || 0,
                remote_percentage: parseInt(data.remote_percentage) || 0,
                deals_closed: parseInt(data.deals_closed) || 0,
                avg_deal_size: parseFloat(data.avg_deal_size) || 0,
                client_reviews: parseFloat(data.client_reviews) || 0,
                customer_satisfaction: parseFloat(data.customer_satisfaction) || 0,
            });
        })
        .on('end', () => res.json(results))
        .on('error', (err) => {
            console.error("Error reading CSV:", err);
            res.status(500).json({ error: "Failed to read data from CSV" });
        });
});


// Routes: Google Authentication
app.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/google/callback",
    passport.authenticate("google", {
        failureRedirect: "http://localhost:3000/login?error=unauthorized",
        successRedirect: "http://localhost:3000",
    })
);

app.get("/login/success", (req, res) => {
    if (req.user) res.status(200).json({ success: true, user: req.user });
    else res.status(401).json({ success: false, message: "Not authenticated" });
});

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("http://localhost:3000/login"); 
    });
});


// --- Server & Database Connection ---

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("DB Error:", err));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});