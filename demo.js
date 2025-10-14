/*
 * Demo Script for AI Customer Support Bot
 * 
 * This script demonstrates how to interact with the chatbot API
 * and showcases its main features.
 */

const axios = require('axios');

// Base URL for the API (adjust if running on a different port)
const BASE_URL = 'http://localhost:3000/api/chat';

// Demo conversation
async function runDemo() {
  console.log('🚀 Starting AI Customer Support Bot Demo\n');
  
  try {
    // First message - password reset inquiry
    console.log('👤 Customer: How do I reset my password?');
    let response = await sendMessage('How do I reset my password?');
    console.log(`🤖 Bot: ${response.data.response}\n`);
    
    // Second message - follow up on shipping
    console.log('👤 Customer: What about shipping times?');
    response = await sendMessage(response.data.sessionId, 'What about shipping times?');
    console.log(`🤖 Bot: ${response.data.response}\n`);
    
    // Third message - request for human agent
    console.log('👤 Customer: I want to talk to a human agent');
    response = await sendMessage(response.data.sessionId, 'I want to talk to a human agent');
    console.log(`🤖 Bot: ${response.data.response}`);
    if (response.data.escalated) {
      console.log('🔄 Conversation escalated to human agent\n');
    }
    
    // Fourth message - complex billing issue
    console.log('👤 Customer: I was charged twice for my subscription');
    response = await sendMessage(null, 'I was charged twice for my subscription');
    console.log(`🤖 Bot: ${response.data.response}`);
    if (response.data.escalated) {
      console.log('🔄 Conversation escalated to human agent\n');
    }
    
    console.log('✅ Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Function to send a message to the chatbot
async function sendMessage(sessionId, message) {
  try {
    const response = await axios.post(`${BASE_URL}/message`, {
      message: message,
      sessionId: sessionId
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }
}

// Run the demo
if (require.main === module) {
  runDemo();
}

module.exports = { runDemo, sendMessage };