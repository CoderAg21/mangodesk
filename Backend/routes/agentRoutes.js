const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleAgentCommand } = require('../controllers/agentController');

// Configure Multer to store files in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// Route Definition:
// 1. URL: /command
// 2. Middleware: upload.single('file') <- Parses FormData, creates req.body & req.file
// 3. Controller: handleAgentCommand <- Executes logic
router.post('/command', upload.single('file'), handleAgentCommand);

module.exports = router;