# AI Customer Support Bot

An intelligent customer support chatbot that simulates real customer service interactions using AI. This project demonstrates how to build a complete chatbot solution with contextual memory, escalation handling, and LLM integration.

## Features

- **Natural Language Processing**: Understands and responds to customer queries
- **Contextual Memory**: Maintains conversation history for personalized interactions
- **Escalation Simulation**: Automatically detects when to transfer to human agents
- **FAQ Integration**: Uses a knowledge base for common questions
- **RESTful API**: Backend with full CRUD operations
- **Web Interface**: Clean, responsive chat interface
- **Database Storage**: Persists sessions and conversation history

## Project Structure

```
aicustomerbot/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Data models and schemas
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic (LLM, database)
│   │   ├── utils/           # Utility functions and data
│   │   └── server.js        # Main server file
│   ├── package.json         # Backend dependencies
│   └── README.md            # Backend documentation
├── frontend/
│   ├── index.html           # Main HTML file
│   ├── styles.css           # Styling
│   └── script.js            # Frontend logic
└── README.md                # This file
```

## Technical Implementation

### Backend (Node.js + Express)

The backend provides a RESTful API with the following endpoints:

- `POST /api/chat/message` - Send a message to the chatbot
- `GET /api/chat/history/:sessionId` - Get conversation history

Key components:
- **MongoDB Integration**: For persistent storage of sessions and messages
- **OpenAI API**: For generating intelligent responses
- **Session Management**: Tracks conversation context
- **Escalation Logic**: Determines when to transfer to human agents

### Frontend (Vanilla JavaScript)

A responsive chat interface with:
- Real-time messaging
- Typing indicators
- Session tracking
- Mobile-friendly design

### LLM Integration

The bot uses OpenAI's GPT models for:
- Generating contextual responses
- Conversation summarization
- Next action suggestions

The system includes a fallback mechanism that uses FAQ matching when the LLM is unavailable.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```env
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key_here
   MONGODB_URI=your_mongodb_connection_string_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

The frontend is a static website that can be served by any web server. For development:

1. Serve the frontend files using any HTTP server:
   ```bash
   npx serve ../frontend
   ```

2. Or simply open `frontend/index.html` in a browser

## API Documentation

### Send Message

```http
POST /api/chat/message
Content-Type: application/json

{
  "message": "How do I reset my password?",
  "sessionId": "optional-session-id"
}
```

Response:
```json
{
  "response": "To reset your password, go to the login page and click on 'Forgot Password'...",
  "sessionId": "session-id",
  "escalated": false
}
```

### Get Conversation History

```http
GET /api/chat/history/:sessionId
```

Response:
```json
{
  "messages": [
    {
      "id": "message-id",
      "sessionId": "session-id",
      "content": "How do I reset my password?",
      "sender": "user",
      "timestamp": "2023-01-01T00:00:00.000Z"
    }
  ],
  "sessionId": "session-id"
}
```

## LLM Prompts

### System Prompt

```
You are an AI customer support assistant for our company. 
Use the following FAQ information to answer customer questions accurately:

[FAQ content will be inserted here]

If a customer asks about a topic not covered in the FAQs, provide a helpful general response and suggest they contact human support for complex issues.
If a customer explicitly requests to speak with a human agent, acknowledge their request and simulate connecting them to a human.
Maintain a friendly, professional tone throughout the conversation.
```

### Escalation Detection

The system automatically escalates conversations based on:
- Explicit requests for human agents
- Multiple failed response attempts
- Complex topics (billing, refunds, cancellations)
- Negative sentiment detection

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

## Development

### Adding New FAQs

Add new FAQ entries to `backend/src/utils/faqData.js`:
```javascript
{
  question: "New question here?",
  answer: "New answer here."
}
```

### Customizing Escalation Logic

Modify the `shouldEscalate` method in `backend/src/services/llmService.js` to adjust escalation triggers.

## Testing

Run the backend tests:
```bash
cd backend
npm test
```

## Deployment

1. Set up a MongoDB database (MongoDB Atlas recommended)
2. Deploy the backend to a Node.js hosting service (Heroku, Vercel, etc.)
3. Serve the frontend files from a CDN or web server
4. Configure environment variables in your deployment environment

## Future Enhancements

- User authentication and personalized experiences
- Multi-language support
- Voice-to-text integration
- Analytics dashboard for conversation metrics
- Integration with ticketing systems
- Advanced sentiment analysis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.