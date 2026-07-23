/**
 * Corporate Live Chat Widget
 * Dynamically creates UI and connects to Socket.IO backend.
 */
class LiveChat {
    constructor() {
        this.socket = null;
        this.chatId = localStorage.getItem('safari_chat_id');
        if (!this.chatId) {
            this.chatId = 'chat_' + Math.random().toString(36).substring(2, 10);
            localStorage.setItem('safari_chat_id', this.chatId);
        }
        this.isOpen = false;
        this.hasUnread = false;
        
        // Remove existing old widget to prevent duplicate UI
        const oldWidget = document.getElementById('liveChatWidget');
        if (oldWidget) oldWidget.remove();
        
        this.initUI();
    }

    initUI() {
        // Create widget container
        this.container = document.createElement('div');
        this.container.className = 'chat-widget';

        // Chat Window
        this.window = document.createElement('div');
        this.window.className = 'chat-window';
        
        this.window.innerHTML = `
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="chat-avatar"><i class="fas fa-user-tie"></i></div>
                    <div>
                        <h3 class="chat-title">Safari Support</h3>
                        <div class="chat-status"><span class="status-dot"></span> Online - We reply instantly</div>
                    </div>
                </div>
                <button class="chat-close" onclick="window.liveChat.toggleChat()"><i class="fas fa-times"></i></button>
            </div>
            <div class="chat-body" id="chatBody">
                <div class="chat-message system">Welcome to Tanzania Safari Magic! How can we help you plan your dream safari today?</div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chatInput" class="chat-input" placeholder="Type a message..." autocomplete="off">
                <button class="chat-send" id="chatSend"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;

        this.container.appendChild(this.window);
        document.body.appendChild(this.container);

        // Events
        this.input = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('chatSend');
        this.body = document.getElementById('chatBody');

        this.sendBtn.onclick = () => this.sendMessage();
        this.input.onkeypress = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };

        // Link to the header chat button
        this.btn = document.getElementById('headerLiveChatBtn');
        const menu = document.querySelector('.social-float-menu');
        if (menu) menu.style.display = ''; // Restore the social float menu if it was hidden

        // Also still support the old openLiveChatBtn if it exists in social float
        const oldBtn = document.getElementById('openLiveChatBtn');
        if (oldBtn) {
            oldBtn.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                if (!this.isOpen) this.toggleChat();
            });
        }

        if (this.btn) {
            this.btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleChat();
            });
        }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.window.classList.add('active');
            
            if (!this.socket) this.connectSocket();
            setTimeout(() => this.input.focus(), 300);
            this.scrollToBottom();
            
            // Remove unread state
            this.hasUnread = false;
        } else {
            this.window.classList.remove('active');
        }
    }

    connectSocket() {
        if (typeof io === 'undefined') {
            console.error('Socket.IO is not loaded');
            return;
        }

        this.socket = io();

        this.socket.on('connect', () => {
            this.socket.emit('join_chat', { chatId: this.chatId });
        });

        this.socket.on('chat_joined', (data) => {
            if (data.chat && data.chat.messages && data.chat.messages.length > 0) {
                // Clear and render history
                this.body.innerHTML = '<div class="chat-message system">Welcome to Tanzania Safari Magic! How can we help you plan your dream safari today?</div>';
                data.chat.messages.forEach(msg => {
                    this.appendMessage(msg.message, msg.sender === 'user' || msg.sender === 'client' ? 'user' : 'agent', msg.timestamp);
                });
            }
        });

        this.socket.on('new_message', (data) => {
            if (data.msg.sender !== 'user' && data.msg.sender !== 'client') {
                this.appendMessage(data.msg.message, 'agent', data.msg.timestamp);
                
                if (!this.isOpen) {
                    this.hasUnread = true;
                    // Add some corporate pulse effect
                    this.btn.style.boxShadow = '0 0 0 0 rgba(255, 111, 0, 0.7)';
                    this.btn.innerHTML = '<i class="fas fa-comment-dots"></i><span style="position:absolute;top:0;right:0;width:12px;height:12px;background:red;border-radius:50%;border:2px solid white"></span>';
                }
            }
        });
    }

    sendMessage() {
        const text = this.input.value.trim();
        if (!text) return;
        
        this.input.value = '';
        
        // Optimistic UI update
        this.appendMessage(text, 'user', new Date().toISOString());

        if (this.socket && this.socket.connected) {
            this.socket.emit('send_message', {
                chatId: this.chatId,
                sender: 'user', // Match backend if it expects 'user' or 'client', backend code has no strict check, but previous UI used 'client'. I will use 'client' to be safe with previous code.
                message: text
            });
        }
    }

    appendMessage(text, sender, timestamp) {
        const div = document.createElement('div');
        div.className = `chat-message ${sender}`;
        
        const timeStr = new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        div.innerHTML = `
            ${text}
            <span class="message-time">${timeStr}</span>
        `;
        
        this.body.appendChild(div);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.body.scrollTop = this.body.scrollHeight;
    }
}

// Initialization function
function initLiveChatWidget() {
    // Inject CSS if not already there
    if (!document.querySelector('link[href="/css/chat.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/chat.css';
        document.head.appendChild(link);
    }

    window.liveChat = new LiveChat();
}

// Load on DOM ready or immediately if already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveChatWidget);
} else {
    initLiveChatWidget();
}
