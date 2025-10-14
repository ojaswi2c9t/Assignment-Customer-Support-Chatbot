const Session = require('../models/SessionSchema');
const Message = require('../models/MessageSchema');

class DatabaseService {
  // Create a new session
  async createSession(userId) {
    try {
      const session = new Session({
        userId,
        conversationHistory: []
      });
      return await session.save();
    } catch (error) {
      throw new Error(`Error creating session: ${error.message}`);
    }
  }

  // Get a session by ID
  async getSession(sessionId) {
    try {
      return await Session.findById(sessionId).populate('conversationHistory');
    } catch (error) {
      throw new Error(`Error getting session: ${error.message}`);
    }
  }

  // Update a session
  async updateSession(sessionId, updateData) {
    try {
      return await Session.findByIdAndUpdate(sessionId, updateData, { new: true });
    } catch (error) {
      throw new Error(`Error updating session: ${error.message}`);
    }
  }

  // End a session
  async endSession(sessionId) {
    try {
      return await Session.findByIdAndUpdate(
        sessionId, 
        { isActive: false, endTime: new Date() }, 
        { new: true }
      );
    } catch (error) {
      throw new Error(`Error ending session: ${error.message}`);
    }
  }

  // Add a message to a session
  async addMessage(sessionId, content, sender) {
    try {
      // Create the message
      const message = new Message({
        sessionId,
        content,
        sender
      });
      const savedMessage = await message.save();

      // Add message to session's conversation history
      await Session.findByIdAndUpdate(
        sessionId,
        { $push: { conversationHistory: savedMessage._id } }
      );

      return savedMessage;
    } catch (error) {
      throw new Error(`Error adding message: ${error.message}`);
    }
  }

  // Get all messages for a session
  async getMessages(sessionId) {
    try {
      const session = await Session.findById(sessionId).populate('conversationHistory');
      return session ? session.conversationHistory : [];
    } catch (error) {
      throw new Error(`Error getting messages: ${error.message}`);
    }
  }
}

module.exports = new DatabaseService();