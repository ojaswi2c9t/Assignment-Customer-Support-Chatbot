class Message {
  constructor(id, sessionId, content, sender, timestamp) {
    this.id = id;
    this.sessionId = sessionId;
    this.content = content;
    this.sender = sender; // 'user' or 'bot'
    this.timestamp = timestamp;
  }

  // Convert message to JSON format
  toJSON() {
    return {
      id: this.id,
      sessionId: this.sessionId,
      content: this.content,
      sender: this.sender,
      timestamp: this.timestamp
    };
  }
}

module.exports = Message;