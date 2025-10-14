const request = require('supertest');
const app = require('../src/server');

describe('Chat API', () => {
  it('should respond to the root endpoint', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);
    
    expect(res.body.message).toBe('AI Customer Support Bot API');
  });

  it('should handle a chat message', async () => {
    const res = await request(app)
      .post('/api/chat/message')
      .send({
        message: 'Hello, how can I reset my password?',
        sessionId: null
      })
      .expect(200);
    
    expect(res.body).toHaveProperty('response');
    expect(res.body).toHaveProperty('sessionId');
  });

  it('should get conversation history', async () => {
    // First, send a message to create a session
    const messageRes = await request(app)
      .post('/api/chat/message')
      .send({
        message: 'Test message for history',
        sessionId: null
      })
      .expect(200);
    
    // Then, get the history
    const historyRes = await request(app)
      .get(`/api/chat/history/${messageRes.body.sessionId}`)
      .expect(200);
    
    expect(historyRes.body).toHaveProperty('messages');
    expect(historyRes.body).toHaveProperty('sessionId');
    expect(historyRes.body.sessionId).toBe(messageRes.body.sessionId);
  });
});