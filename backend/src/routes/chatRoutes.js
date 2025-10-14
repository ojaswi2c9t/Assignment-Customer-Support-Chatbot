const express = require('express');
const ChatController = require('../controllers/chatController');

const router = express.Router();

// Handle chat messages
router.post('/message', ChatController.handleMessage);

// Get conversation history
router.get('/history/:sessionId', ChatController.getHistory);

module.exports = router;