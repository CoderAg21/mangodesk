// Backend/routes/agentRoutes.js
const express = require('express');
const router = express.Router();
const { handleAgentCommand } = require('../controllers/agentController');

// Define the POST route for the AI agent command
router.post('/command', handleAgentCommand);

module.exports = router;