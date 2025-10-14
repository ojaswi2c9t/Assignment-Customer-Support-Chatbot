class ChatApp {
    constructor() {
        this.sessionId = null;
        this.chatHistory = document.getElementById('chatHistory');
        this.messageInput = document.getElementById('messageInput');
        this.chatForm = document.getElementById('chatForm');
        this.sessionIdElement = document.getElementById('sessionId');
        
        console.log('ChatApp initialized');
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        console.log('Event listeners initialized');
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const message = this.messageInput.value.trim();
        console.log('Handling submit for message:', message);
        
        if (!message) {
            console.log('Empty message, ignoring');
            return;
        }
        
        // Add user message to chat
        this.addMessageToChat(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        
        // Show typing indicator
        const typingIndicator = this.showTypingIndicator();
        
        try {
            // Send message to backend
            console.log('Sending message to backend');
            const response = await this.sendMessageToBackend(message);
            console.log('Received response from backend:', response);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingIndicator);
            
            // Add bot response to chat
            this.addMessageToChat(response.response, 'bot', response.escalated);
            
            // Update session ID
            if (response.sessionId) {
                this.sessionId = response.sessionId;
                this.sessionIdElement.textContent = this.sessionId;
                console.log('Updated session ID:', this.sessionId);
            }
        } catch (error) {
            // Remove typing indicator
            this.removeTypingIndicator(typingIndicator);
            
            // Show error message
            this.addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot', true);
            console.error('Error sending message:', error);
        }
    }
    
    async sendMessageToBackend(message) {
        console.log('Sending request to backend URL: http://localhost:3002/api/chat/message');
        // Updated to point to the correct backend URL (port 3002)
        const response = await fetch('http://localhost:3002/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                sessionId: this.sessionId
            })
        });
        
        console.log('Backend response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Backend response data:', data);
        return data;
    }
    
    addMessageToChat(content, sender, isEscalated = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        if (isEscalated) {
            messageDiv.classList.add('escalation-message');
        }
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">${this.escapeHtml(content)}</div>
            <div class="message-time">${timeString}</div>
        `;
        
        this.chatHistory.appendChild(messageDiv);
        
        // Scroll to bottom
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message');
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.chatHistory.appendChild(typingDiv);
        
        // Scroll to bottom
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
        
        return typingDiv;
    }
    
    removeTypingIndicator(typingIndicator) {
        if (typingIndicator && typingIndicator.parentNode) {
            typingIndicator.parentNode.removeChild(typingIndicator);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the chat app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ChatApp');
    new ChatApp();
});