const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import Google Generative AI
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google Generative AI with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (if needed in future)
// const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// In-memory storage for sessions and FAQs
let sessions = {};
let faqs = [
  {
    id: 1,
    question: "What are your delivery hours?",
    answer: "We deliver from 9 AM to 8 PM, Monday through Sunday."
  },
  {
    id: 2,
    question: "How can I track my order?",
    answer: "You can track your order status in the 'My Orders' section of our app or website."
  },
  {
    id: 3,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, UPI, and digital wallets like PayPal."
  },
  {
    id: 4,
    question: "How do I cancel my order?",
    answer: "You can cancel your order from the 'My Orders' section before it's out for delivery."
  }
];

// Sample customer data
const customers = [
  {
    id: 1,
    name: "Madhuram Srinivasan",
    orders: [
      {
        id: "ORD-001",
        items: ["Butter Milk", "Idli"],
        purchaseDate: "2025-10-10",
        deliveryDate: "2025-10-10",
        amount: 120,
        paymentMode: "Credit Card"
      },
      {
        id: "ORD-005",
        items: ["Dosa", "Chutney", "Filter Coffee"],
        purchaseDate: "2025-10-12",
        deliveryDate: "2025-10-12",
        amount: 250,
        paymentMode: "UPI"
      }
    ]
  },
  {
    id: 2,
    name: "Priya Kumar",
    orders: [
      {
        id: "ORD-002",
        items: ["Masala Dosa", "Sambar", "Filter Coffee"],
        purchaseDate: "2025-10-08",
        deliveryDate: "2025-10-08",
        amount: 180,
        paymentMode: "Debit Card"
      }
    ]
  },
  {
    id: 3,
    name: "Rajesh Venkat",
    orders: [
      {
        id: "ORD-003",
        items: ["Pongal", "Vada", "Coconut Chutney"],
        purchaseDate: "2025-10-05",
        deliveryDate: "2025-10-05",
        amount: 150,
        paymentMode: "Cash on Delivery"
      },
      {
        id: "ORD-004",
        items: ["Poori", "Potato Curry", "Filter Coffee"],
        purchaseDate: "2025-10-11",
        deliveryDate: "2025-10-11",
        amount: 200,
        paymentMode: "UPI"
      }
    ]
  }
];

// Routes

// Get all customers
app.get('/api/customers', (req, res) => {
  res.json(customers);
});

// Get a specific customer by ID
app.get('/api/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

// Get all FAQs
app.get('/api/faqs', (req, res) => {
  res.json(faqs);
});

// Create a new chat session
app.post('/api/sessions', (req, res) => {
  const { customerId } = req.body;
  const sessionId = Date.now().toString();
  
  sessions[sessionId] = {
    id: sessionId,
    customerId: customerId,
    messages: [],
    createdAt: new Date()
  };
  
  res.json({ sessionId });
});

// Get chat history for a session
app.get('/api/sessions/:sessionId', (req, res) => {
  const session = sessions[req.params.sessionId];
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json(session);
});

// Function to generate AI response using Gemini
async function generateAIResponse(customer, message, conversationHistory) {
  try {
    // Create a prompt that includes customer context
    let prompt = `You are a customer support agent for a food delivery service. 
    Please respond to the customer's query based on their order history and context.
    
    Customer Name: ${customer.name}
    
    Order History:
    ${customer.orders.map(order => `
    - Order ID: ${order.id}
      Items: ${order.items.join(', ')}
      Purchase Date: ${order.purchaseDate}
      Delivery Date: ${order.deliveryDate}
      Amount: ₹${order.amount}
      Payment Mode: ${order.paymentMode}
    `).join('')}
    
    Conversation History:
    ${conversationHistory.map(msg => `${msg.sender}: ${msg.text}`).join('\n')}
    
    Current Query: ${message}
    
    Please provide a helpful and personalized response based on the customer's context. 
    If you don't have enough information to answer specifically, ask clarifying questions.
    Keep your response concise and helpful.`;

    console.log('Attempting to call Gemini API with model: gemini-2.0-flash');
    console.log('Prompt length:', prompt.length);

    // Initialize the model with the correct model name format
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Successfully received response from Gemini API');
    return text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    // Fallback to the original logic if Gemini fails
    return null;
  }
}

// Send a message in a chat session
app.post('/api/sessions/:sessionId/messages', async (req, res) => {
  const session = sessions[req.params.sessionId];
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const { message, sender } = req.body;
  
  // Add user message to session
  const userMessage = {
    id: Date.now().toString(),
    text: message,
    sender: sender,
    timestamp: new Date()
  };
  
  session.messages.push(userMessage);
  
  // Get customer information for contextual responses
  const customer = customers.find(c => c.id === session.customerId);
  const customerName = customer ? customer.name : 'customer';
  const orderHistory = customer ? customer.orders : [];
  
  // Try to generate AI response using Gemini
  let responseText = await generateAIResponse(customer, message, session.messages);
  
  // If Gemini fails, fall back to the original logic
  if (!responseText) {
    // Simple FAQ matching logic with customer context
    const lowerMessage = message.toLowerCase();
    const matchedFAQ = faqs.find(faq => 
      lowerMessage.includes(faq.question.toLowerCase().split(' ')[0]) ||
      faq.question.toLowerCase().includes(lowerMessage.split(' ')[0])
    );
    
    if (matchedFAQ) {
      responseText = matchedFAQ.answer;
    } else if (lowerMessage.includes('order') || lowerMessage.includes('delivery')) {
      if (orderHistory.length > 0) {
        // Provide context about their recent orders
        const recentOrder = orderHistory[orderHistory.length - 1];
        responseText = `I can see you have ${orderHistory.length} order(s) in your history. Your most recent order (${recentOrder.id}) included ${recentOrder.items.join(', ')} and was delivered on ${recentOrder.deliveryDate}. How can I help you with your orders?`;
      } else {
        responseText = "I can help you with order and delivery related queries. Could you please provide your order ID?";
      }
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('refund')) {
      if (orderHistory.length > 0) {
        const recentOrder = orderHistory[orderHistory.length - 1];
        responseText = `I see your most recent order (${recentOrder.id}) was paid using ${recentOrder.paymentMode}. For payment and refund related queries, I recommend checking your transaction history or contacting our billing department.`;
      } else {
        responseText = "For payment and refund related queries, I recommend checking your transaction history or contacting our billing department.";
      }
    } else if (lowerMessage.includes('cancel')) {
      responseText = "To cancel an order, please visit the 'My Orders' section in our app or website.";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      if (orderHistory.length > 0) {
        responseText = `Hello ${customerName}! I can see you have ${orderHistory.length} order(s) in your history. How can I assist you today regarding your orders?`;
      } else {
        responseText = `Hello ${customerName}! How can I assist you today?`;
      }
    } else if (lowerMessage.includes('thank')) {
      responseText = "You're welcome! Is there anything else I can help you with?";
    } else if (lowerMessage.includes('total') && lowerMessage.includes('amount') || lowerMessage.includes('spent')) {
      // Calculate total amount spent
      const totalSpent = orderHistory.reduce((sum, order) => sum + order.amount, 0);
      responseText = `Hello ${customerName}! I can see you have spent a total of ₹${totalSpent} across ${orderHistory.length} order(s). Your most recent order (${orderHistory[orderHistory.length - 1].id}) was for ₹${orderHistory[orderHistory.length - 1].amount}.`;
    } else {
      // Escalation scenario
      responseText = "I'm unable to address your query at the moment. Let me connect you with a human agent who can assist you better.";
    }
  }
  
  // Add AI response to session
  const aiMessage = {
    id: (Date.now() + 1).toString(),
    text: responseText,
    sender: 'AI',
    timestamp: new Date()
  };
  
  session.messages.push(aiMessage);
  
  res.json({
    userMessage,
    aiMessage
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});