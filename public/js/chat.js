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
        this.pendingMessages = [];
        this.joined = false;
        this.chatClosed = false;

        // Remove existing old widget to prevent duplicate UI
        const oldWidget = document.getElementById('liveChatWidget');
        if (oldWidget) oldWidget.remove();

        this.initUI();
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    initUI() {
        this.container = document.createElement('div');
        this.container.className = 'chat-widget';

        this.window = document.createElement('div');
        this.window.className = 'chat-window';

        this.window.innerHTML = `
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="chat-avatar"><i class="fas fa-user-tie"></i></div>
                    <div>
                        <h3 class="chat-title">Safari Support</h3>
                        <div class="chat-status" id="chatConnStatus"><span class="status-dot"></span> Connecting...</div>
                    </div>
                </div>
                <button class="chat-close" type="button" aria-label="Close chat"><i class="fas fa-times"></i></button>
            </div>
            <div class="chat-body" id="chatBody">
                <div class="chat-message system">Welcome to Tanzania Safari Magic! How can we help you plan your dream safari today?</div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chatInput" class="chat-input" placeholder="Type a message..." autocomplete="off" maxlength="2000">
                <button class="chat-send" id="chatSend" type="button" aria-label="Send message"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;

        this.container.appendChild(this.window);
        document.body.appendChild(this.container);

        this.input = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('chatSend');
        this.body = document.getElementById('chatBody');
        this.statusEl = document.getElementById('chatConnStatus');

        this.window.querySelector('.chat-close').onclick = () => this.toggleChat();
        this.sendBtn.onclick = () => this.sendMessage();
        this.input.onkeypress = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#headerLiveChatBtn, #openLiveChatBtn');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleChat();
            }
        });

        const menu = document.querySelector('.social-float-menu');
        if (menu) menu.style.display = '';
    }

    setStatus(text, online = false) {
        if (!this.statusEl) return;
        this.statusEl.innerHTML = `<span class="status-dot"${online ? '' : ' style="background:#999"'}></span> ${this.escapeHtml(text)}`;
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.window.classList.add('active');
            if (!this.socket) this.connectSocket();
            setTimeout(() => this.input.focus(), 300);
            this.scrollToBottom();
            this.hasUnread = false;
            this.clearUnreadBadge();
        } else {
            this.window.classList.remove('active');
        }
    }

    clearUnreadBadge() {
        const headerBtn = document.getElementById('headerLiveChatBtn');
        if (headerBtn) {
            headerBtn.style.boxShadow = '';
            const badge = headerBtn.querySelector('span[style*="background:red"]');
            if (badge) badge.remove();
        }
    }

    connectSocket() {
        if (typeof io === 'undefined') {
            console.error('Socket.IO is not loaded');
            this.setStatus('Offline — chat unavailable');
            return;
        }

        this.socket = io({
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            this.setStatus('Online — We reply instantly', true);
            this.joined = false;
            this.socket.emit('join_chat', {
                chatId: this.chatId,
                pageUrl: window.location.href,
                userAgent: navigator.userAgent
            });
        });

        this.socket.on('disconnect', () => {
            this.joined = false;
            this.setStatus('Reconnecting...');
        });

        this.socket.on('connect_error', () => {
            this.setStatus('Connection issue...');
        });

        this.socket.on('chat_joined', (data) => {
            this.joined = true;
            this.chatClosed = false;
            if (data.chatId) this.chatId = data.chatId;

            if (data.chat && data.chat.messages && data.chat.messages.length > 0) {
                this.body.innerHTML = '<div class="chat-message system">Welcome to Tanzania Safari Magic! How can we help you plan your dream safari today?</div>';
                data.chat.messages.forEach(msg => {
                    this.appendMessage(
                        msg.message,
                        msg.sender === 'user' || msg.sender === 'client' ? 'user' : 'agent',
                        msg.timestamp
                    );
                });
            }

            if (data.chat && data.chat.status === 'closed') {
                this.chatClosed = true;
                this.appendMessage('This conversation has been closed. Open a new chat to continue.', 'system', new Date().toISOString());
            }

            this.flushPending();
        });

        this.socket.on('new_message', (data) => {
            if (!data || !data.msg) return;
            if (data.msg.sender !== 'user' && data.msg.sender !== 'client') {
                this.appendMessage(data.msg.message, 'agent', data.msg.timestamp);

                if (!this.isOpen) {
                    this.hasUnread = true;
                    const headerBtn = document.getElementById('headerLiveChatBtn');
                    if (headerBtn && !headerBtn.querySelector('span[style*="background:red"]')) {
                        headerBtn.style.boxShadow = '0 0 0 0 rgba(255, 111, 0, 0.7)';
                        headerBtn.insertAdjacentHTML(
                            'beforeend',
                            '<span style="position:absolute;top:0;right:0;width:12px;height:12px;background:red;border-radius:50%;border:2px solid white"></span>'
                        );
                    }
                }
            }
        });

        this.socket.on('chat_closed', () => {
            this.chatClosed = true;
            this.appendMessage('An agent closed this conversation. Refresh or open chat again to start a new one.', 'system', new Date().toISOString());
        });

        this.socket.on('chat_error', (data) => {
            console.warn('Chat error:', data?.message);
            this.setStatus(data?.message || 'Chat error');
        });
    }

    flushPending() {
        if (!this.socket || !this.socket.connected || !this.joined) return;
        while (this.pendingMessages.length > 0) {
            const text = this.pendingMessages.shift();
            this.socket.emit('send_message', {
                chatId: this.chatId,
                sender: 'user',
                message: text
            });
        }
    }

    sendMessage() {
        const text = this.input.value.trim();
        if (!text || this.chatClosed) return;

        this.input.value = '';
        this.appendMessage(text, 'user', new Date().toISOString());

        if (this.socket && this.socket.connected && this.joined) {
            this.socket.emit('send_message', {
                chatId: this.chatId,
                sender: 'user',
                message: text
            });
        } else {
            this.pendingMessages.push(text);
            if (!this.socket) this.connectSocket();
        }
    }

    appendMessage(text, sender, timestamp) {
        const div = document.createElement('div');
        div.className = `chat-message ${sender}`;

        const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        div.innerHTML = `
            ${this.escapeHtml(text)}
            <span class="message-time">${timeStr}</span>
        `;

        this.body.appendChild(div);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.body.scrollTop = this.body.scrollHeight;
    }
}

function initLiveChatWidget() {
    if (window.liveChat) return;

    if (!document.querySelector('link[href="/css/chat.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/chat.css';
        document.head.appendChild(link);
    }

    window.liveChat = new LiveChat();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveChatWidget);
} else {
    initLiveChatWidget();
}
