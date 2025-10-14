const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function fullTest() {
  console.log('=== Full System Test ===\n');
  
  // 1. Check if .env file exists and has required variables
  console.log('1. Checking .env file...');
  const envPath = path.join(__dirname, 'backend', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('   .env file found');
    if (envContent.includes('PORT=')) {
      const portMatch = envContent.match(/PORT=(\d+)/);
      const port = portMatch ? portMatch[1] : '3000';
      console.log('   PORT found:', port);
    } else {
      console.log('   PORT not found in .env');
    }
  } else {
    console.log('   .env file not found');
  }
  
  // 2. Try to connect to the backend API
  console.log('\n2. Testing backend API connection...');
  try {
    const rootResponse = await axios.get('http://localhost:3002/');
    console.log('   Root endpoint accessible:', rootResponse.data.message);
  } catch (error) {
    console.log('   Root endpoint not accessible:', error.message);
    return;
  }
  
  // 3. Test sending a message to the chat endpoint
  console.log('\n3. Testing chat message endpoint...');
  try {
    const messageResponse = await axios.post('http://localhost:3002/api/chat/message', {
      message: 'How do I reset my password?',
      sessionId: null
    });
    console.log('   Message endpoint response:');
    console.log('   - Response:', messageResponse.data.response);
    console.log('   - Session ID:', messageResponse.data.sessionId);
    console.log('   - Escalated:', messageResponse.data.escalated);
  } catch (error) {
    console.log('   Message endpoint failed:', error.message);
    if (error.response) {
      console.log('   Response status:', error.response.status);
      console.log('   Response data:', error.response.data);
    }
    return;
  }
  
  // 4. Test getting conversation history
  console.log('\n4. Testing conversation history endpoint...');
  try {
    // First get a session ID from the previous test
    const messageResponse = await axios.post('http://localhost:3002/api/chat/message', {
      message: 'How do I reset my password?',
      sessionId: null
    });
    
    const sessionId = messageResponse.data.sessionId;
    const historyResponse = await axios.get(`http://localhost:3002/api/chat/history/${sessionId}`);
    console.log('   History endpoint response:');
    console.log('   - Message count:', historyResponse.data.messages.length);
    console.log('   - Session ID:', historyResponse.data.sessionId);
  } catch (error) {
    console.log('   History endpoint failed:', error.message);
    if (error.response) {
      console.log('   Response status:', error.response.status);
      console.log('   Response data:', error.response.data);
    }
    return;
  }
  
  console.log('\n=== Test completed successfully! ===');
}

fullTest();