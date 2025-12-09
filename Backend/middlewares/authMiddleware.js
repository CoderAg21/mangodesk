const ensureAuthenticated = (req, res, next) => {
   
    if (req.isAuthenticated()) {
        return next();
    }
    
    res.status(401).json({ error: "Unauthorized access. Please log in." });
};

module.exports = { ensureAuthenticated };