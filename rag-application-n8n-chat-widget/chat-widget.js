/**
 * Chat Widget - Embeddable Chat Bot Widget
 * Adds a chat interface to any website
 */

(function() {
    'use strict';

    const ChatWidget = {
        config: {
            webhookUrl: '',
            userId: '',
            isOpen: false
        },

        init: function(options) {
            this.config.webhookUrl = options.webhookUrl || '';
            this.config.userId = options.userId || 'anonymous_' + Date.now();
            
            this.createWidget();
            this.attachEventListeners();
        },

        createWidget: function() {
            // Create widget container
            const widget = document.createElement('div');
            widget.id = 'chat-widget-container';
            widget.innerHTML = `
                <div id="chat-widget-button" class="chat-widget-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                    </svg>
                </div>
                <div id="chat-widget-window" class="chat-widget-window">
                    <div class="chat-widget-header">
                        <h3>Chat Support</h3>
                        <button id="chat-widget-close" class="chat-widget-close">×</button>
                    </div>
                    <div id="chat-widget-messages" class="chat-widget-messages"></div>
                    <div class="chat-widget-input-container">
                        <input type="text" id="chat-widget-input" class="chat-widget-input" placeholder="Type your message...">
                        <button id="chat-widget-send" class="chat-widget-send">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(widget);
            this.injectStyles();
        },

        injectStyles: function() {
            const style = document.createElement('style');
            style.textContent = `
                #chat-widget-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 10000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }

                .chat-widget-button {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    color: white;
                }

                .chat-widget-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
                }

                .chat-widget-window {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 350px;
                    height: 500px;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                }

                .chat-widget-window.open {
                    display: flex;
                }

                .chat-widget-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .chat-widget-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 600;
                }

                .chat-widget-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.2s;
                }

                .chat-widget-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .chat-widget-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                    background: #f8f9fa;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .chat-message {
                    max-width: 80%;
                    padding: 0.75rem 1rem;
                    border-radius: 12px;
                    word-wrap: break-word;
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .chat-message.user {
                    align-self: flex-end;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .chat-message.bot {
                    align-self: flex-start;
                    background: white;
                    color: #333;
                    border: 1px solid #e0e0e0;
                    border-bottom-left-radius: 4px;
                }

                .chat-message-time {
                    font-size: 0.7rem;
                    opacity: 0.7;
                    margin-top: 0.25rem;
                }

                .chat-widget-input-container {
                    display: flex;
                    padding: 1rem;
                    background: white;
                    border-top: 1px solid #e0e0e0;
                    gap: 0.5rem;
                }

                .chat-widget-input {
                    flex: 1;
                    padding: 0.75rem;
                    border: 1px solid #e0e0e0;
                    border-radius: 24px;
                    outline: none;
                    font-size: 0.9rem;
                }

                .chat-widget-input:focus {
                    border-color: #667eea;
                }

                .chat-widget-send {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s;
                }

                .chat-widget-send:hover {
                    transform: scale(1.1);
                }

                .chat-widget-send:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .typing-indicator {
                    display: flex;
                    gap: 4px;
                    padding: 0.75rem 1rem;
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    width: fit-content;
                    align-self: flex-start;
                }

                .typing-indicator span {
                    width: 8px;
                    height: 8px;
                    background: #667eea;
                    border-radius: 50%;
                    animation: typing 1.4s infinite;
                }

                .typing-indicator span:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-indicator span:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes typing {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-10px);
                    }
                }

                @media (max-width: 480px) {
                    .chat-widget-window {
                        width: calc(100vw - 40px);
                        height: calc(100vh - 100px);
                        bottom: 80px;
                        right: 20px;
                    }
                }
            `;
            document.head.appendChild(style);
        },

        attachEventListeners: function() {
            const button = document.getElementById('chat-widget-button');
            const close = document.getElementById('chat-widget-close');
            const send = document.getElementById('chat-widget-send');
            const input = document.getElementById('chat-widget-input');

            button.addEventListener('click', () => this.toggleWidget());
            close.addEventListener('click', () => this.toggleWidget());
            send.addEventListener('click', () => this.sendMessage());
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        },

        toggleWidget: function() {
            const window = document.getElementById('chat-widget-window');
            this.config.isOpen = !this.config.isOpen;
            
            if (this.config.isOpen) {
                window.classList.add('open');
                document.getElementById('chat-widget-input').focus();
                // Send welcome message if chat is empty
                if (document.getElementById('chat-widget-messages').children.length === 0) {
                    this.addMessage('bot', 'Hello! How can I help you today?');
                }
            } else {
                window.classList.remove('open');
            }
        },

        sendMessage: function() {
            const input = document.getElementById('chat-widget-input');
            const message = input.value.trim();
            
            if (!message) return;

            // Add user message to chat
            this.addMessage('user', message);
            input.value = '';

            // Show typing indicator
            this.showTypingIndicator();

            // Send to webhook
            this.sendToWebhook(message);
        },

        sendToWebhook: async function(text) {
            try {
                const payload = {
                    text: text,
                    userId: this.config.userId
                };

                console.log('Sending payload:', payload);
                console.log('Webhook URL:', this.config.webhookUrl);

                const response = await fetch(this.config.webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });

                this.hideTypingIndicator();

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Webhook response data:', data);
                console.log('Response type:', typeof data);
                console.log('Has output field:', 'output' in data);
                
                // Handle response - check for 'output' field first (webhook response format)
                let botMessage = 'Thank you for your message!';
                
                if (data && typeof data === 'object') {
                    if (data.output !== undefined && data.output !== null) {
                        botMessage = String(data.output);
                    } else if (data.message !== undefined && data.message !== null) {
                        botMessage = String(data.message);
                    } else if (data.text !== undefined && data.text !== null) {
                        botMessage = String(data.text);
                    } else if (data.response !== undefined && data.response !== null) {
                        botMessage = String(data.response);
                    } else {
                        console.warn('Unexpected response format:', data);
                    }
                } else if (typeof data === 'string') {
                    botMessage = data;
                } else {
                    console.warn('Unexpected response type:', typeof data, data);
                }

                this.hideTypingIndicator();
                this.addMessage('bot', botMessage);

            } catch (error) {
                console.error('Error sending message:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                });
                this.hideTypingIndicator();
                this.addMessage('bot', 'Sorry, I encountered an error. Please try again later.');
            }
        },

        addMessage: function(type, text) {
            const messagesContainer = document.getElementById('chat-widget-messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${type}`;
            
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            messageDiv.innerHTML = `
                <div>${this.escapeHtml(text)}</div>
                <div class="chat-message-time">${time}</div>
            `;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        },

        showTypingIndicator: function() {
            const messagesContainer = document.getElementById('chat-widget-messages');
            const typingDiv = document.createElement('div');
            typingDiv.id = 'typing-indicator';
            typingDiv.className = 'typing-indicator';
            typingDiv.innerHTML = '<span></span><span></span><span></span>';
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        },

        hideTypingIndicator: function() {
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        },

        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    };

    // Make ChatWidget globally available
    window.ChatWidget = ChatWidget;
})();

