const express = require('express');
const router = express.Router();
const { chatWithAssistant } = require('../controllers/assistantController');
const { optionalAuth } = require('../middleware/auth');

router.post('/chat', optionalAuth, chatWithAssistant);

module.exports = router;
