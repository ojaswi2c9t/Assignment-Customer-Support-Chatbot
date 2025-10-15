// API base URL - Using relative path for proxy
const API_BASE = '/api';

// Global variables
let currentSessionId = null;
let currentCustomerId = null;
let currentCustomer = null;

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const customersGrid = document.getElementById('customersGrid');
const endChatButton = document.getElementById('endChatButton');
const loadingIndicator = document.getElementById('loadingIndicator');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadCustomers();
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    endChatButton.addEventListener('click', endChat);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

// Load customers from the API
async function loadCustomers() {
    try {
        const response = await fetch(`${API_BASE}/customers`);
        const customers = await response.json();
        
        // Clear the grid
        customersGrid.innerHTML = '';
        
        // Create customer cards
        customers.forEach(customer => {
            const card = document.createElement('div');
            card.className = 'customer-card';
            card.innerHTML = `
                <h3>${customer.name}</h3>
                <div class="customer-info">
                    <p><strong>ID:</strong> ${customer.id}</p>
                    <div class="order-history">
                        <h4>Order History (${customer.orders.length} orders)</h4>
                        ${customer.orders.map(order => `
                            <div class="order-item">
                                <p><strong>${order.id}</strong> - ${order.items.join(', ')}</p>
                                <p>Purchased: ${order.purchaseDate} | Delivery: ${order.deliveryDate}</p>
                                <p>Amount: ₹${order.amount} | Payment: ${order.paymentMode}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <button class="chat-button" data-customer-id="${customer.id}">Chat as ${customer.name}</button>
            `;
            customersGrid.appendChild(card);
        });
        
        // Add event listeners to chat buttons
        document.querySelectorAll('.chat-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const customerId = parseInt(e.target.getAttribute('data-customer-id'));
                startChat(customerId);
            });
        });
    } catch (error) {
        console.error('Error loading customers:', error);
        customersGrid.innerHTML = '<p>Error loading customer data. Please try again.</p>';
    }
}

// Start a chat session with a customer
async function startChat(customerId) {
    try {
        // Show loading state on the chat button
        const chatButton = document.querySelector(`.chat-button[data-customer-id="${customerId}"]`);
        const originalText = chatButton.textContent;
        chatButton.textContent = 'Starting chat...';
        chatButton.disabled = true;
        
        // Get customer details
        const customerResponse = await fetch(`${API_BASE}/customers/${customerId}`);
        currentCustomer = await customerResponse.json();
        
        // Create chat session
        const response = await fetch(`${API_BASE}/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ customerId })
        });
        
        const data = await response.json();
        currentSessionId = data.sessionId;
        currentCustomerId = customerId;
        
        // Reset chat button
        chatButton.textContent = originalText;
        chatButton.disabled = false;
        
        // Update chat header with customer info
        const chatHeader = document.querySelector('.chat-header h2');
        chatHeader.textContent = `Support Chat - ${currentCustomer.name}`;
        
        // Show end chat button
        endChatButton.style.display = 'block';
        
        // Enable chat input
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.placeholder = 'Type your message...';
        messageInput.focus();
        
        // Clear chat messages
        chatMessages.innerHTML = '';
        
        // Add personalized welcome message
        if (currentCustomer.orders.length > 0) {
            const recentOrder = currentCustomer.orders[currentCustomer.orders.length - 1];
            addMessage('AI', `Hello ${currentCustomer.name}! I can see you have ${currentCustomer.orders.length} order(s) in your history. Your most recent order (${recentOrder.id}) included ${recentOrder.items.join(', ')} and was delivered on ${recentOrder.deliveryDate}. How can I help you today?`);
        } else {
            addMessage('AI', `Hello ${currentCustomer.name}! How can I assist you today?`);
        }
    } catch (error) {
        console.error('Error starting chat session:', error);
        addMessage('AI', 'Sorry, I\'m having trouble connecting. Please try again.');
        
        // Reset chat button in case of error
        const chatButton = document.querySelector(`.chat-button[data-customer-id="${customerId}"]`);
        if (chatButton) {
            chatButton.disabled = false;
            chatButton.textContent = `Chat as ${currentCustomer ? currentCustomer.name : 'Customer'}`;
        }
    }
}

// End the chat session
function endChat() {
    // Add visual feedback when clicking the exit button
    endChatButton.textContent = 'Exiting...';
    endChatButton.disabled = true;
    
    // Small delay to show the visual feedback
    setTimeout(() => {
        // Hide end chat button
        endChatButton.style.display = 'none';
        endChatButton.textContent = 'Exit';
        endChatButton.disabled = false;
        
        // Disable chat input
        messageInput.disabled = true;
        sendButton.disabled = true;
        messageInput.placeholder = 'Select a customer to start chatting...';
        
        // Reset chat header
        const chatHeader = document.querySelector('.chat-header h2');
        chatHeader.textContent = 'Support Chat';
        
        // Clear chat messages and show welcome message
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-content">
                    <p>Chat session exited. Please select a customer from the right panel to start a new chat.</p>
                </div>
            </div>
        `;
        
        // Reset global variables
        currentSessionId = null;
        currentCustomerId = null;
        currentCustomer = null;
    }, 300);
}

// Send a message to the chat
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !currentSessionId) return;
    
    // Add user message to UI
    addMessage('user', message);
    
    // Clear input
    messageInput.value = '';
    
    // Show loading indicator
    showLoadingIndicator();
    
    try {
        const response = await fetch(`${API_BASE}/sessions/${currentSessionId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                sender: 'user'
            })
        });
        
        // Hide loading indicator
        hideLoadingIndicator();
        
        const data = await response.json();
        
        // Add AI response to UI
        addMessage('AI', data.aiMessage.text);
    } catch (error) {
        console.error('Error sending message:', error);
        // Hide loading indicator
        hideLoadingIndicator();
        addMessage('AI', 'Sorry, I encountered an error processing your request. Please try again.');
    }
}

// Add a message to the chat UI
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender.toLowerCase()}-message`;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
            <small>${timestamp}</small>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show loading indicator
function showLoadingIndicator() {
    loadingIndicator.style.display = 'block';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide loading indicator
function hideLoadingIndicator() {
    loadingIndicator.style.display = 'none';
}