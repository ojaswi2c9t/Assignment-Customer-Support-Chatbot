// In-memory database simulation
class InMemoryDatabase {
  constructor() {
    this.sessions = new Map();
    this.messages = new Map();
  }

  // Create a new session
  createSession(session) {
    this.sessions.set(session.id, session);
    return session;
  }

  // Get a session by ID
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  // Update a session
  updateSession(sessionId, sessionData) {
    const session = this.sessions.get(sessionId);
    if (session) {
      Object.assign(session, sessionData);
      return session;
    }
    return null;
  }

  // Delete a session
  deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
  }

  // Add a message
  addMessage(message) {
    if (!this.messages.has(message.sessionId)) {
      this.messages.set(message.sessionId, []);
    }
    this.messages.get(message.sessionId).push(message);
    return message;
  }

  // Get messages for a session
  getMessages(sessionId) {
    return this.messages.get(sessionId) || [];
  }

  // Clear all data
  clear() {
    this.sessions.clear();
    this.messages.clear();
  }
}

// Singleton instance
const db = new InMemoryDatabase();
module.exports = db;