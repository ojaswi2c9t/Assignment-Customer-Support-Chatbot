const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const connectDB = require('./config/db');
const chatRoutes = require('./routes/chatRoutes');

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AI Customer Support Bot API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;