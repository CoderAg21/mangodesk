const express = require('express');
const router = express.Router();

const {
    upload,
    handleAgentCommand
} = require("../controllers/agentController");

// route with multer file upload
router.post('/command', upload.single('file'), handleAgentCommand);

module.exports = router;

