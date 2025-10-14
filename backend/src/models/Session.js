class Session {
  constructor(id, userId, startTime, endTime, isActive) {
    this.id = id;
    this.userId = userId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.isActive = isActive;
    this.conversationHistory = [];
  }

  // Add a message to the conversation history
  addMessage(message) {
    this.conversationHistory.push(message);
  }

  // Get the conversation history
  getHistory() {
    return this.conversationHistory;
  }

  // End the session
  endSession() {
    this.isActive = false;
    this.endTime = new Date();
  }
}

module.exports = Session;