const express = require('express');
const router = express.Router();
const { handleAgentCommand,getUserHistory, upload } = require('../controllers/agentController');
const { ensureAuthenticated } = require('../middlewares/authMiddleware');

// route with multer file upload
router.post('/command',ensureAuthenticated, upload.single('file'), handleAgentCommand);

router.get('/history', ensureAuthenticated, getUserHistory);

module.exports = router;

