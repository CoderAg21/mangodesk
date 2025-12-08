const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require("passport");
const agentRoutes = require('./routes/agentRoutes');  
const passportSetup = require("./config/passport");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mangodesk';

// --- Middleware Configuration ---
app.use(express.json()); // To parse JSON bodies
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));

// Session and Auth Setup (Passport)
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

// Google Authentication Routes
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