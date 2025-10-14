const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class GeminiService {
  constructor() {
    // Check if API key is provided
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found in environment variables. LLM features will be disabled.');
    }
    
    this.genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
    this.model = this.genAI ? this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) : null;
    
    // Load FAQ data for reference
    this.faqData = require('../utils/faqData');
  }

  // Format conversation history for Gemini
  formatHistory(history) {
    return history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
  }

  // Generate a response using Gemini
  async generateResponse(query, history = []) {
    // If Gemini is not configured, throw an error that will be caught by the LLM service
    if (!this.model) {
      throw new Error('Gemini API key not configured. Please check your .env file.');
    }
    
    try {
      // Build the context with FAQ data
      const faqContext = this.faqData.map(faq => 
        `Q: ${faq.question}\nA: ${faq.answer}`
      ).join('\n\n');
      
      // Create the system prompt
      const systemPrompt = `
You are an AI customer support assistant for our company. 
Use the following FAQ information to answer customer questions accurately:

${faqContext}

If a customer asks about a topic not covered in the FAQs, provide a helpful general response and suggest they contact human support for complex issues.
If a customer explicitly requests to speak with a human agent, acknowledge their request and simulate connecting them to a human.
Maintain a friendly, professional tone throughout the conversation.
`;
      
      // Format the conversation history
      const formattedHistory = this.formatHistory(history);
      
      // Create the chat session with history
      const chat = this.model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.7,
        },
      });
      
      console.log('Sending request to Gemini API');
      
      // Send the message to Gemini
      const result = await chat.sendMessage(`${systemPrompt}\n\nCustomer: ${query}`);
      const response = await result.response;
      const text = response.text();
      
      console.log('Received response from Gemini API');
      
      return text.trim();
    } catch (error) {
      console.error('Error generating response with Gemini:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }
  
  // Summarize a conversation
  async summarizeConversation(messages) {
    // If Gemini is not configured, return a default message
    if (!this.model) {
      return "Conversation summary unavailable - Gemini API not configured";
    }
    
    try {
      const conversationText = messages.map(msg => 
        `${msg.sender === 'user' ? 'Customer' : 'Agent'}: ${msg.content}`
      ).join('\n');
      
      const prompt = `
Please provide a brief summary of the following customer support conversation:
${conversationText}

Summary:
`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.trim();
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      return "Conversation summary unavailable due to an error";
    }
  }
  
  // Suggest next actions based on conversation
  async suggestNextActions(messages) {
    // If Gemini is not configured, return a default message
    if (!this.model) {
      return "Next action suggestions unavailable - Gemini API not configured";
    }
    
    try {
      const conversationText = messages.map(msg => 
        `${msg.sender === 'user' ? 'Customer' : 'Agent'}: ${msg.content}`
      ).join('\n');
      
      const prompt = `
Based on the following customer support conversation, suggest what actions the support agent should take next:
${conversationText}

Next actions:
`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.trim();
    } catch (error) {
      console.error('Error suggesting next actions:', error);
      return "Next action suggestions unavailable due to an error";
    }
  }
}

module.exports = new GeminiService();