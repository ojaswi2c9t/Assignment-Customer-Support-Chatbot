# Unthinkable Support Chatbot

This project simulates an AI-powered customer support chatbot. It includes a backend API with REST endpoints and a frontend interface with a chatbot and customer profiles.

# DEMO VEDIO : https://drive.google.com/file/d/1JaBijSPPi79Ol9XpGHUs-fA8O9QQpWwq/view?usp=sharing

## Features

- RESTful API backend built with Node.js and Express
- Frontend with chat interface and customer profile cards
- Contextual memory to retain conversation history
- FAQ handling with escalation simulation
- Session tracking for customer interactions

## Project Structure

```
├── backend/
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── ...                # Other backend files
├── frontend/
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Styling
│   ├── script.js          # Frontend logic
│   └── ...                # Other frontend files
└── README.md              # This file
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```
   
   Or for development with auto-reload:
   ```
   npm run dev
   ```

### Frontend Setup

The frontend is built with vanilla HTML, CSS, and JavaScript. To run the frontend with API proxy support:

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

### Running Both Servers

To start both servers simultaneously:

```
npm run dev
```

This will start both the backend and frontend servers concurrently.

## API Endpoints

- `GET /api/customers` - Get all customers (http://localhost:3002/api/customers)
- `GET /api/customers/:id` - Get a specific customer
- `GET /api/faqs` - Get all FAQs
- `POST /api/sessions` - Create a new chat session
- `GET /api/sessions/:sessionId` - Get chat history
- `POST /api/sessions/:sessionId/messages` - Send a message

## Usage

1. Start both the backend and frontend servers
2. Open your browser and navigate to `http://localhost:3000`
3. Select a customer card from the right panel
4. Click "Chat as [Customer Name]" to start a conversation
5. Type your message and press Enter or click Send

## Documentation

- [Full README](./README.md)
- [Demo Instructions](./DEMO.md)
- [Prompt Documentation](./PROMPTS.md)
- [Architecture](./architecture.md)
- [Project Summary](./SUMMARY.md)

## License

MIT License
