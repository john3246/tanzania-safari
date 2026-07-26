/**
 * Live Chat Widget — floating button + Socket.IO client
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
        this._clickBound = false;

        const oldWidget = document.getElementById('liveChatWidget');
        if (oldWidget) oldWidget.remove();

        this.initUI();
        this.bindTriggers();
    }

    initUI() {
        this.container = document.createElement('div');
        this.container.className = 'chat-widget';
        this.container.id = 'liveChatRoot';

        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'chat-button';
        this.button.id = 'openLiveChatBtn';
        this.button.setAttribute('aria-label', 'Open live chat');
        this.button.title = 'Live Chat';
        this.button.innerHTML = `
            <i class="fas fa-comments" aria-hidden="true"></i>
            <span class="chat-unread-badge" id="chatUnreadBadge" hidden>1</span>
        `;

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'chat-tooltip';
        this.tooltip.textContent = 'Chat with us';
        this.tooltip.id = 'chatTooltip';

        this.window = document.createElement('div');
        this.window.className = 'chat-window';
        this.window.setAttribute('role', 'dialog');
        this.window.setAttribute('aria-label', 'Live chat support');

        this.window.innerHTML = `
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="chat-avatar"><i class="fas fa-user-tie"></i></div>
                    <div>
                        <h3 class="chat-title">Safari Support</h3>
                        <div class="chat-status"><span class="status-dot"></span> Online — we reply quickly</div>
                    </div>
                </div>
                <button type="button" class="chat-close" id="closeLiveChatBtn" aria-label="Close chat"><i class="fas fa-times"></i></button>
            </div>
            <div class="chat-body" id="chatBody">
                <div class="chat-message system">Welcome to Tanzania Safari Magic! How can we help you plan your dream safari today?</div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chatInput" class="chat-input" placeholder="Type a message..." autocomplete="off" maxlength="2000">
                <button type="button" class="chat-send" id="chatSend" aria-label="Send message"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;

        this.container.appendChild(this.window);
        this.container.appendChild(this.tooltip);
        this.container.appendChild(this.button);
        document.body.appendChild(this.container);

        this.input = this.window.querySelector('#chatInput');
        this.sendBtn = this.window.querySelector('#chatSend');
        this.body = this.window.querySelector('#chatBody');
        this.unreadBadge = this.button.querySelector('#chatUnreadBadge');
        this.closeBtn = this.window.querySelector('#closeLiveChatBtn');

        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleChat();
        });
        this.closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleChat(false);
        });
    }

    bindTriggers() {
        if (this._clickBound) return;
        this._clickBound = true;

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#headerLiveChatBtn, #openLiveChatBtn');
            if (!btn) return;
            if (btn.id === 'openLiveChatBtn') return; // handled on button itself
            e.preventDefault();
            e.stopPropagation();
            this.toggleChat(true);
        });
    }

    toggleChat(forceOpen) {
        const next = typeof forceOpen === 'boolean' ? forceOpen : !this.isOpen;
        this.isOpen = next;

        if (this.isOpen) {
            this.window.classList.add('active');
            this.button.classList.add('open');
            if (this.tooltip) this.tooltip.style.opacity = '0';
            if (!this.socket) this.connectSocket();
            setTimeout(() => this.input && this.input.focus(), 250);
            this.scrollToBottom();
            this.hasUnread = false;
            this.updateUnreadUI();
        } else {
            this.window.classList.remove('active');
            this.button.classList.remove('open');
            if (this.tooltip) this.tooltip.style.opacity = '';
        }
    }

    connectSocket() {
        if (typeof io === 'undefined') {
            this.appendMessage('Chat is temporarily offline. Please use WhatsApp or our contact form.', 'system', new Date().toISOString());
            return;
        }

        this.socket = io({
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            this.socket.emit('join_chat', { chatId: this.chatId });
        });

        this.socket.on('chat_joined', (data) => {
            if (data.chat && data.chat.messages && data.chat.messages.length > 0) {
                this.body.innerHTML = '<div class="chat-message system">Welcome to Tanzania Safari Magic! How can we help you plan your dream safari today?</div>';
                data.chat.messages.forEach((msg) => {
                    const sender = (msg.sender === 'user' || msg.sender === 'client') ? 'user' : (msg.sender === 'system' ? 'system' : 'agent');
                    this.appendMessage(msg.message, sender, msg.timestamp);
                });
            }
        });

        this.socket.on('new_message', (data) => {
            if (!data || !data.msg) return;
            const sender = data.msg.sender;
            if (sender === 'user' || sender === 'client') return;

            this.appendMessage(data.msg.message, sender === 'system' ? 'system' : 'agent', data.msg.timestamp);

            if (!this.isOpen) {
                this.hasUnread = true;
                this.updateUnreadUI();
                const headerBtn = document.getElementById('headerLiveChatBtn');
                if (headerBtn) {
                    headerBtn.classList.add('has-unread');
                }
            }
        });

        this.socket.on('connect_error', () => {
            // Keep UI usable; message send will show offline hint
        });
    }

    updateUnreadUI() {
        if (!this.unreadBadge) return;
        if (this.hasUnread) {
            this.unreadBadge.hidden = false;
            this.button.classList.add('has-unread');
        } else {
            this.unreadBadge.hidden = true;
            this.button.classList.remove('has-unread');
            const headerBtn = document.getElementById('headerLiveChatBtn');
            if (headerBtn) headerBtn.classList.remove('has-unread');
        }
    }

    sendMessage() {
        const text = this.input.value.trim();
        if (!text) return;

        this.input.value = '';
        this.appendMessage(text, 'user', new Date().toISOString());

        if (this.socket && this.socket.connected) {
            this.socket.emit('send_message', {
                chatId: this.chatId,
                sender: 'user',
                message: text
            });
        } else if (!this.socket) {
            this.connectSocket();
            setTimeout(() => {
                if (this.socket && this.socket.connected) {
                    this.socket.emit('send_message', {
                        chatId: this.chatId,
                        sender: 'user',
                        message: text
                    });
                } else {
                    this.appendMessage('Message not delivered. Please try again or contact us on WhatsApp.', 'system', new Date().toISOString());
                }
            }, 1200);
        } else {
            this.appendMessage('Reconnecting… your message will send when online.', 'system', new Date().toISOString());
        }
    }

    appendMessage(text, sender, timestamp) {
        const div = document.createElement('div');
        div.className = `chat-message ${sender}`;
        const timeStr = new Date(timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const safe = this.escapeHtml(text);
        div.innerHTML = `${safe}<span class="message-time">${timeStr}</span>`;
        this.body.appendChild(div);
        this.scrollToBottom();
    }

    escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    scrollToBottom() {
        if (this.body) this.body.scrollTop = this.body.scrollHeight;
    }
}

function initLiveChatWidget() {
    if (window.liveChat) return;

    if (!document.querySelector('link[href*="/css/chat.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/chat.css?v=4';
        document.head.appendChild(link);
    }

    window.liveChat = new LiveChat();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveChatWidget);
} else {
    initLiveChatWidget();
}
