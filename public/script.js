document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const sendButton = document.getElementById('send-button');

    let chatHistory = [
        { role: 'system', content: 'You are a helpful AI assistant. Always provide concise and accurate answers.' }
    ];

    const addMessage = (content, type = 'user') => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerText = content;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        scrollToBottom();
        return messageDiv;
    };

    const addTypingIndicator = () => {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'message ai-message typing-indicator-container';
        indicatorDiv.id = 'typing-indicator';
        
        indicatorDiv.innerHTML = `
            <div class="message-content typing-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        
        chatMessages.appendChild(indicatorDiv);
        scrollToBottom();
    };

    const removeTypingIndicator = () => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    };

    const scrollToBottom = () => {
        chatMessages.parentElement.scrollTop = chatMessages.parentElement.scrollHeight;
    };

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        if (!message) return;
        
        chatHistory.push({ role: 'user', content: message });
        
        messageInput.value = '';
        messageInput.disabled = true;
        sendButton.disabled = true;
        
        addMessage(message, 'user');
        addTypingIndicator();
        
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: chatHistory })
            });
            
            const data = await response.json();
            
            removeTypingIndicator();
            
            if (!response.ok) {
                addMessage(data.error || 'Server error occurred', 'error');
                chatHistory.pop(); 
            } else {
                addMessage(data.response, 'ai');
                chatHistory.push({ role: 'assistant', content: data.response });
            }
        } catch (error) {
            removeTypingIndicator();
            addMessage('Network Error. Ensure the backend is running.', 'error');
            chatHistory.pop();
            console.error('Fetch error:', error);
        } finally {
            messageInput.disabled = false;
            sendButton.disabled = false;
            messageInput.focus();
        }
    });

    addMessage("Hello! I'm your AI assistant. How can I help you today?", "system");
});
