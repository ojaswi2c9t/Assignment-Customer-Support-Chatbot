const llmService = require('../services/llmService');
const databaseService = require('../services/databaseService');

class ChatController {
  // Handle incoming chat messages
  static async handleMessage(req, res) {
    try {
      const { message, sessionId } = req.body;
      console.log('Received message:', message, 'Session ID:', sessionId);
      
      // Get or create session
      let session;
      if (sessionId) {
        session = await databaseService.getSession(sessionId);
        if (!session || !session.isActive) {
          console.log('Session not found or inactive:', sessionId);
          return res.status(404).json({ error: 'Session not found or inactive' });
        }
      } else {
        // Create new session
        session = await databaseService.createSession('user123'); // In a real app, this would be the actual user ID
        console.log('Created new session:', session._id);
      }
      
      // Add user message to database
      const userMessage = await databaseService.addMessage(session._id, message, 'user');
      console.log('Added user message to database:', userMessage._id);
      
      // Check if we should escalate to a human agent
      if (llmService.shouldEscalate(message)) {
        const escalationMessage = "I understand you have a complex issue. Let me connect you with a human support agent who can better assist you.";
        console.log('Escalating to human agent');
        
        // Add bot message to database
        const botMessage = await databaseService.addMessage(session._id, escalationMessage, 'bot');
        
        return res.status(200).json({
          response: escalationMessage,
          sessionId: session._id,
          escalated: true
        });
      }
      
      // Get conversation history for context
      const history = await databaseService.getMessages(session._id);
      console.log('Retrieved conversation history, message count:', history.length);
      
      // Generate response using LLM service
      const botResponseText = await llmService.generateResponse(
        message, 
        history.map(msg => ({
          content: msg.content,
          sender: msg.sender
        }))
      );
      console.log('Generated bot response:', botResponseText);
      
      // Add bot message to database
      const botMessage = await databaseService.addMessage(session._id, botResponseText, 'bot');
      
      res.status(200).json({
        response: botResponseText,
        sessionId: session._id,
        escalated: false
      });
    } catch (error) {
      console.error('Error handling message:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }

  // Get conversation history
  static async getHistory(req, res) {
    try {
      const { sessionId } = req.params;
      console.log('Retrieving history for session:', sessionId);
      
      const session = await databaseService.getSession(sessionId);
      if (!session) {
        console.log('Session not found:', sessionId);
        return res.status(404).json({ error: 'Session not found' });
      }
      
      const messages = await databaseService.getMessages(sessionId);
      console.log('Found messages:', messages.length);
      
      res.status(200).json({
        messages: messages.map(msg => ({
          id: msg._id,
          sessionId: msg.sessionId,
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.createdAt
        })),
        sessionId
      });
    } catch (error) {
      console.error('Error fetching history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = ChatController;