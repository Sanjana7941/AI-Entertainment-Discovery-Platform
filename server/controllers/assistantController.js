const AiService = require('../services/aiService');

// @desc    Process conversational chat with CineMind AI Assistant
// @route   POST /api/assistant/chat
// @access  Public (Enhanced if authenticated)
const chatWithAssistant = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please send a non-empty query or prompt.'
      });
    }

    const response = await AiService.processChat(message, req.user || null, history);
    res.json(response);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  chatWithAssistant
};
