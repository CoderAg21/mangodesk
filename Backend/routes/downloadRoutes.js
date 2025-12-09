const express = require("express");
const path = require("path");

const router = express.Router();

router.get("/employees", (req, res) => {
    const filePath = path.join(__dirname, "..", "data", "employees.csv");
    res.download(filePath, (err) => {
        if (err) {
            return res.status(500).json({ message: "File download failed", error: err });
        }
    });
});

module.exports = router;
