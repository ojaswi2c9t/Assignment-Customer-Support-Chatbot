const geminiService = require('./geminiService');
const huggingFaceService = require('./huggingFaceService');
const faqData = require('../utils/faqData');

class LLMService {
  constructor() {
    // Load FAQ data
    this.faqData = faqData;
    // Track failed attempts per session
    this.failedAttempts = new Map();
  }

  // Find the best matching FAQ for a given query (as a fallback)
  findBestFAQMatch(query) {
    console.log('Attempting FAQ matching for query:', query);
    // Simple keyword matching (would be replaced with embeddings in a real implementation)
    const lowerQuery = query.toLowerCase();
    
    // First, try exact matching
    for (const faq of this.faqData) {
      const lowerQuestion = faq.question.toLowerCase();
      
      // Check for exact match or containment
      if (lowerQuery.includes(lowerQuestion) || lowerQuestion.includes(lowerQuery)) {
        console.log('Found exact FAQ match:', faq.question);
        return faq;
      }
    }
    
    // If no exact match, try keyword-based matching with improved algorithm
    const queryWords = new Set(lowerQuery.split(/\s+/).filter(word => word.length > 2)); // Filter out short words
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const faq of this.faqData) {
      const lowerQuestion = faq.question.toLowerCase();
      const questionWords = new Set(lowerQuestion.split(/\s+/).filter(word => word.length > 2));
      
      // Calculate overlap score
      const commonWords = [...queryWords].filter(word => questionWords.has(word));
      const score = commonWords.length / Math.max(queryWords.size, questionWords.size);
      
      // Also check if query words are contained in the question
      let containmentScore = 0;
      for (const queryWord of queryWords) {
        if (lowerQuestion.includes(queryWord)) {
          containmentScore += 1;
        }
      }
      const combinedScore = Math.max(score, containmentScore / queryWords.size);
      
      // If this is the best match so far and has some overlap
      if (combinedScore > bestScore && combinedScore > 0.2) { // Lowered threshold for better matching
        bestScore = combinedScore;
        bestMatch = faq;
      }
    }
    
    if (bestMatch) {
      console.log('Found keyword-based FAQ match:', bestMatch.question, 'Score:', bestScore);
      return bestMatch;
    }
    
    // Last resort: check if any FAQ question contains significant parts of the query
    for (const faq of this.faqData) {
      const lowerQuestion = faq.question.toLowerCase();
      let matchCount = 0;
      
      for (const queryWord of queryWords) {
        if (lowerQuestion.includes(queryWord)) {
          matchCount++;
        }
      }
      
      // If at least half of the query words are in the question
      if (matchCount >= Math.ceil(queryWords.size / 2) && queryWords.size > 0) {
        console.log('Found containment-based FAQ match:', faq.question);
        return faq;
      }
    }
    
    console.log('No FAQ match found for query:', query);
    return null;
  }

  // Simple similarity calculation (would be replaced with proper NLP in a real implementation)
  calculateSimilarity(str1, str2) {
    // Convert strings to sets of words
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    
    // Calculate intersection and union
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    // Return Jaccard similarity
    return intersection.size / union.size;
  }

  // Generate a response based on the query and conversation history
  async generateResponse(query, history = []) {
    try {
      // Try to generate a response using Gemini
      console.log('Attempting to generate response with Gemini');
      const response = await geminiService.generateResponse(query, history);
      
      // Reset failed attempts counter for this session since we got a response
      const sessionId = history.length > 0 ? history[0].sessionId : null;
      if (sessionId) {
        this.failedAttempts.set(sessionId, 0);
      }
      
      return response;
    } catch (geminiError) {
      console.error('Gemini service failed:', geminiError.message);
      
      // Try Hugging Face as a fallback
      try {
        console.log('Falling back to Hugging Face API');
        const response = await huggingFaceService.generateResponse(query, history);
        
        // Reset failed attempts counter for this session since we got a response
        const sessionId = history.length > 0 ? history[0].sessionId : null;
        if (sessionId) {
          this.failedAttempts.set(sessionId, 0);
        }
        
        return response;
      } catch (huggingFaceError) {
        console.error('Hugging Face service failed:', huggingFaceError.message);
        
        // Fallback to FAQ matching if both OpenAI and Hugging Face fail
        const faqMatch = this.findBestFAQMatch(query);
        
        if (faqMatch) {
          // Reset failed attempts counter for this session since we found a match
          const sessionId = history.length > 0 ? history[0].sessionId : null;
          if (sessionId) {
            this.failedAttempts.set(sessionId, 0);
          }
          return faqMatch.answer;
        }
        
        // Increment failed attempts counter
        const sessionId = history.length > 0 ? history[0].sessionId : null;
        if (sessionId) {
          const attempts = this.failedAttempts.get(sessionId) || 0;
          this.failedAttempts.set(sessionId, attempts + 1);
          console.log(`Failed attempts for session ${sessionId}: ${attempts + 1}`);
        }
        
        // If no FAQ match, provide a generic response based on conversation history
        if (history.length > 0) {
          // Simple context-aware response
          return "Based on our conversation, I understand you have questions about our services. Is there anything specific I can help you with?";
        }
        
        // Generic fallback response
        return "I'm an AI customer support assistant. I can help answer questions about our products and services. What can I help you with today?";
      }
    }
  }

  // Determine if we should escalate to a human agent
  shouldEscalate(query, sessionId = null) {
    // Escalate if user explicitly requests human agent
    if (query.toLowerCase().includes('human') || 
        query.toLowerCase().includes('agent') ||
        query.toLowerCase().includes('representative') ||
        query.toLowerCase().includes('talk to someone')) {
      console.log('Escalation triggered: explicit request for human agent');
      return true;
    }
    
    // Escalate if we've failed to provide satisfactory answers multiple times
    if (sessionId) {
      const attempts = this.failedAttempts.get(sessionId) || 0;
      if (attempts >= 3) {
        console.log('Escalation triggered: too many failed attempts');
        return true;
      }
    }
    
    // Escalate for certain complex topics
    const escalationKeywords = [
      'refund', 'billing', 'cancel', 'complaint', 'dispute',
      'urgent', 'immediately', 'asap', 'emergency'
    ];
    const lowerQuery = query.toLowerCase();
    
    for (const keyword of escalationKeywords) {
      if (lowerQuery.includes(keyword)) {
        console.log('Escalation triggered: complex topic detected');
        return true;
      }
    }
    
    // Escalate negative sentiment queries
    const negativeKeywords = [
      'angry', 'frustrated', 'upset', 'annoyed', 'disappointed',
      'hate', 'terrible', 'awful', 'horrible', 'useless'
    ];
    
    for (const keyword of negativeKeywords) {
      if (lowerQuery.includes(keyword)) {
        console.log('Escalation triggered: negative sentiment detected');
        return true;
      }
    }
    
    return false;
  }
  
  // Reset failed attempts counter for a session
  resetFailedAttempts(sessionId) {
    this.failedAttempts.delete(sessionId);
  }
  
  // Summarize a conversation
  async summarizeConversation(messages) {
    try {
      return await geminiService.summarizeConversation(messages);
    } catch (geminiError) {
      try {
        // Try to summarize with Hugging Face (you would need to implement this)
        return "Conversation summary unavailable";
      } catch (huggingFaceError) {
        return "Conversation summary unavailable";
      }
    }
  }
  
  // Suggest next actions based on conversation
  async suggestNextActions(messages) {
    try {
      return await geminiService.suggestNextActions(messages);
    } catch (geminiError) {
      try {
        // Try to suggest actions with Hugging Face (you would need to implement this)
        return "Next action suggestions unavailable";
      } catch (huggingFaceError) {
        return "Next action suggestions unavailable";
      }
    }
  }
}

module.exports = new LLMService();