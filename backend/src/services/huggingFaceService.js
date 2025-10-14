const axios = require('axios');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

class HuggingFaceService {
  constructor() {
    this.apiKey = process.env.HUGGING_FACE_API_KEY;
    this.apiUrl = 'https://api-inference.huggingface.co/models';
    
    // Check if API key is provided
    if (!this.apiKey) {
      console.warn('HUGGING_FACE_API_KEY not found in environment variables. Hugging Face features will be disabled.');
    }
  }

  // Generate a response using Hugging Face
  async generateResponse(query, history = []) {
    // If Hugging Face is not configured, throw an error
    if (!this.apiKey) {
      throw new Error('Hugging Face API key not configured. Please check your .env file.');
    }
    
    try {
      // Build the context with FAQ data
      const faqData = require('../utils/faqData');
      const faqContext = faqData.map(faq => 
        `Q: ${faq.question}\nA: ${faq.answer}`
      ).join('\n\n');
      
      // Create the prompt with conversation history
      let prompt = `You are an AI customer support assistant for our company. 
Use the following FAQ information to answer customer questions accurately:

${faqContext}

Customer: ${query}
Support Assistant:`;
      
      // If there's conversation history, include it in the prompt
      if (history.length > 0) {
        const historyText = history.map(msg => 
          `${msg.sender === 'user' ? 'Customer' : 'Support Assistant'}: ${msg.content}`
        ).join('\n');
        
        prompt = `You are an AI customer support assistant for our company. 
Use the following FAQ information to answer customer questions accurately:

${faqContext}

Previous conversation:
${historyText}

Customer: ${query}
Support Assistant:`;
      }
      
      console.log('Sending request to Hugging Face API');
      
      // Call the Hugging Face API
      const response = await axios.post(
        `${this.apiUrl}/google/gemma-2-2b-it`, // Using a more reliable text generation model
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Received response from Hugging Face API');
      
      // Extract the generated text from the response
      if (response.data && response.data[0] && response.data[0].generated_text) {
        return response.data[0].generated_text.trim();
      } else {
        throw new Error('Unexpected response format from Hugging Face API');
      }
    } catch (error) {
      console.error('Error generating response with Hugging Face:', error);
      if (error.response) {
        console.error('Hugging Face API response status:', error.response.status);
        console.error('Hugging Face API response data:', error.response.data);
      }
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }
}

module.exports = new HuggingFaceService();