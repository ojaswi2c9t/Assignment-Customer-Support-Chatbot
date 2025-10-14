# AI Customer Support Bot - Backend

This is the backend API for the AI Customer Support Bot.

## Features

- RESTful API for chat interactions
- Session management for conversation context
- FAQ-based response generation with OpenAI integration
- Escalation to human agents when needed
- MongoDB for data persistence

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with your configuration:
   ```
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key_here
   MONGODB_URI=your_mongodb_connection_string_here
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Or start the production server:
   ```
   npm start
   ```

## API Endpoints

### Chat

- `POST /api/chat/message` - Send a message to the chatbot
  - Request body: `{ "message": "Your message", "sessionId": "optional-session-id" }`
  - Response: `{ "response": "Bot response", "sessionId": "session-id" }`

- `GET /api/chat/history/:sessionId` - Get conversation history
  - Response: `{ "messages": [array of messages], "sessionId": "session-id" }`

## Project Structure

```
src/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── models/          # Data models and schemas
├── routes/          # API route definitions
├── services/        # Business logic (LLM, database)
├── utils/           # Utility functions and data
└── server.js        # Main server file
```

## Development

This project uses:
- Node.js with Express for the web server
- MongoDB with Mongoose for data persistence
- OpenAI API for LLM integration

## LLM Integration

The bot uses OpenAI's GPT models for generating responses. The system includes a fallback mechanism that uses FAQ matching when the LLM is unavailable.

### System Prompt

```
You are an AI customer support assistant for our company. 
Use the following FAQ information to answer customer questions accurately:

[FAQ content will be inserted here]

If a customer asks about a topic not covered in the FAQs, provide a helpful general response and suggest they contact human support for complex issues.
If a customer explicitly requests to speak with a human agent, acknowledge their request and simulate connecting them to a human.
Maintain a friendly, professional tone throughout the conversation.
```

## Database Schema

### Session
```javascript
{
  userId: String,
  startTime: Date,
  endTime: Date,
  isActive: Boolean,
  conversationHistory: [ObjectId] // References to Message documents
}
```

### Message
```javascript
{
  sessionId: ObjectId, // Reference to Session
  content: String,
  sender: String, // 'user' or 'bot'
  timestamp: Date
}
```

## Testing

Run the backend tests:
```
npm test
```

## Deployment

1. Set up a MongoDB database (MongoDB Atlas recommended)
2. Deploy to a Node.js hosting service
3. Configure environment variables in your deployment environment