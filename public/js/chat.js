/**
 * Corporate Live Chat Widget
 * Pre-chat name/email gate + Socket.IO realtime messaging.
 */
function t(key, vars) {
    if (window.TSM_i18n && typeof window.TSM_i18n.t === 'function') return window.TSM_i18n.t(key, vars);
    return key;
}

class LiveChat {
    constructor() {
        this.socket = null;
        this.chatId = localStorage.getItem('safari_chat_id');
        if (!this.chatId) {
            this.chatId = 'chat_' + Math.random().toString(36).substring(2, 10);
            localStorage.setItem('safari_chat_id', this.chatId);
        }
        this.visitorName = localStorage.getItem('safari_chat_name') || '';
        this.visitorEmail = localStorage.getItem('safari_chat_email') || '';
        this.isOpen = false;
        this.hasUnread = false;
        this.pendingMessages = [];
        this.joined = false;
        this.chatClosed = false;
        this.seenMessageIds = new Set();

        const oldWidget = document.getElementById('liveChatWidget');
        if (oldWidget) oldWidget.remove();

        this.initUI();
        document.addEventListener('tsm:languagechange', () => this.applyI18n());
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

    hasVisitorInfo() {
        return !!(this.visitorName && this.visitorEmail);
    }

    applyI18n() {
        if (!this.window) return;
        const title = this.window.querySelector('.chat-title');
        if (title) title.textContent = t('chat.title');
        const closeBtn = this.window.querySelector('.chat-close');
        if (closeBtn) closeBtn.setAttribute('aria-label', t('chat.close'));
        const intro = this.window.querySelector('.chat-preform-intro');
        if (intro) intro.textContent = t('chat.intro');
        if (this.nameInput) this.nameInput.placeholder = t('chat.namePlaceholder');
        if (this.emailInput) this.emailInput.placeholder = t('chat.emailPlaceholder');
        if (this.startBtn) this.startBtn.textContent = t('chat.start');
        if (this.input) this.input.placeholder = t('chat.messagePlaceholder');
        if (this.sendBtn) this.sendBtn.setAttribute('aria-label', t('chat.sendAria'));
        const welcome = this.body && this.body.querySelector('.chat-message.system');
        if (welcome && !this.joined) welcome.textContent = t('chat.welcome');
        if (this.statusEl && !this.socket) {
            this.setStatus(t('chat.online'));
        }
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
                        <h3 class="chat-title">${t('chat.title')}</h3>
                        <div class="chat-status" id="chatConnStatus"><span class="status-dot" style="background:#999"></span> ${t('chat.online')}</div>
                    </div>
                </div>
                <button class="chat-close" type="button" aria-label="${t('chat.close')}"><i class="fas fa-times"></i></button>
            </div>
            <div class="chat-preform" id="chatPreForm">
                <p class="chat-preform-intro">${t('chat.intro')}</p>
                <input type="text" id="chatVisitorName" class="chat-input" placeholder="${t('chat.namePlaceholder')}" maxlength="100" autocomplete="name">
                <input type="email" id="chatVisitorEmail" class="chat-input" placeholder="${t('chat.emailPlaceholder')}" maxlength="255" autocomplete="email">
                <button type="button" class="chat-send chat-preform-btn" id="chatStartBtn">${t('chat.start')}</button>
            </div>
            <div class="chat-body" id="chatBody" style="display:none">
                <div class="chat-message system">${t('chat.welcome')}</div>
            </div>
            <div class="chat-input-area" id="chatInputArea" style="display:none">
                <input type="text" id="chatInput" class="chat-input" placeholder="${t('chat.messagePlaceholder')}" autocomplete="off" maxlength="2000">
                <button class="chat-send" id="chatSend" type="button" aria-label="${t('chat.sendAria')}"><i class="fas fa-paper-plane"></i></button>
            </div>
        `;

        this.container.appendChild(this.window);
        document.body.appendChild(this.container);

        this.preForm = document.getElementById('chatPreForm');
        this.nameInput = document.getElementById('chatVisitorName');
        this.emailInput = document.getElementById('chatVisitorEmail');
        this.startBtn = document.getElementById('chatStartBtn');
        this.input = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('chatSend');
        this.body = document.getElementById('chatBody');
        this.inputArea = document.getElementById('chatInputArea');
        this.statusEl = document.getElementById('chatConnStatus');

        if (this.visitorName) this.nameInput.value = this.visitorName;
        if (this.visitorEmail) this.emailInput.value = this.visitorEmail;

        this.window.querySelector('.chat-close').onclick = () => this.toggleChat();
        this.startBtn.onclick = () => this.startChat();
        this.sendBtn.onclick = () => this.sendMessage();
        this.input.onkeypress = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };
        this.emailInput.onkeypress = (e) => {
            if (e.key === 'Enter') this.startChat();
        };

        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#headerLiveChatBtn, #openLiveChatBtn');
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleChat();
            }
        });

        if (this.hasVisitorInfo()) {
            this.showChatUI();
        }
    }

    showChatUI() {
        if (this.preForm) this.preForm.style.display = 'none';
        if (this.body) this.body.style.display = '';
        if (this.inputArea) this.inputArea.style.display = '';
    }

    showPreForm() {
        if (this.preForm) this.preForm.style.display = '';
        if (this.body) this.body.style.display = 'none';
        if (this.inputArea) this.inputArea.style.display = 'none';
    }

    startChat() {
        const name = (this.nameInput.value || '').trim();
        const email = (this.emailInput.value || '').trim();
        if (!name || !email) {
            this.setStatus('Name and email are required');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.setStatus('Please enter a valid email');
            return;
        }

        this.visitorName = name;
        this.visitorEmail = email;
        localStorage.setItem('safari_chat_name', name);
        localStorage.setItem('safari_chat_email', email);

        this.showChatUI();
        if (!this.socket) this.connectSocket();
        else if (this.socket.connected) this.emitJoin();
        setTimeout(() => this.input.focus(), 200);
    }

    setStatus(text, online = false) {
        if (!this.statusEl) return;
        this.statusEl.innerHTML = `<span class="status-dot"${online ? '' : ' style="background:#999"'}></span> ${this.escapeHtml(text)}`;
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.window.classList.add('active');
            document.body.classList.add('chat-open');
            if (this.hasVisitorInfo()) {
                this.showChatUI();
                if (!this.socket) this.connectSocket();
                setTimeout(() => this.input?.focus(), 300);
            } else {
                this.showPreForm();
                setTimeout(() => this.nameInput?.focus(), 300);
            }
            this.scrollToBottom();
            this.hasUnread = false;
            this.clearUnreadBadge();
        } else {
            this.window.classList.remove('active');
            document.body.classList.remove('chat-open');
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

    emitJoin() {
        this.joined = false;
        this.socket.emit('join_chat', {
            chatId: this.chatId,
            visitorName: this.visitorName,
            visitorEmail: this.visitorEmail,
            pageUrl: window.location.href,
            userAgent: navigator.userAgent
        });
    }

    connectSocket() {
        if (typeof io === 'undefined') {
            console.error('Socket.IO is not loaded');
            this.setStatus(t('chat.offline'));
            return;
        }
        if (!this.hasVisitorInfo()) return;

        this.socket = io({
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 15,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            this.setStatus(t('chat.onlineInstant'), true);
            this.emitJoin();
        });

        this.socket.on('disconnect', () => {
            this.joined = false;
            this.setStatus(t('chat.connecting'));
        });

        this.socket.on('connect_error', () => {
            this.setStatus(t('chat.connecting'));
        });

        this.socket.on('chat_joined', (data) => {
            this.joined = true;
            this.chatClosed = false;
            if (data.chatId) {
                this.chatId = data.chatId;
                localStorage.setItem('safari_chat_id', this.chatId);
            }

            if (data.chat && data.chat.messages && data.chat.messages.length > 0) {
                this.body.innerHTML = `<div class="chat-message system">${t('chat.welcome')}</div>`;
                this.seenMessageIds.clear();
                data.chat.messages.forEach(msg => this.handleIncoming(msg, true));
            }

            if (data.chat && data.chat.status === 'closed') {
                this.chatClosed = true;
                this.appendMessage(t('chat.closed'), 'system', new Date().toISOString());
            }

            this.flushPending();
        });

        this.socket.on('new_message', (data) => {
            if (!data || !data.msg) return;
            this.handleIncoming(data.msg, false);
        });

        this.socket.on('chat_closed', () => {
            this.chatClosed = true;
            this.appendMessage(t('chat.closed'), 'system', new Date().toISOString());
        });

        this.socket.on('chat_error', (data) => {
            console.warn('Chat error:', data?.message);
            this.setStatus(data?.message || t('chat.offline'));
        });
    }

    handleIncoming(msg, fromHistory) {
        if (!msg) return;
        const id = msg.id != null ? String(msg.id) : null;
        if (id && this.seenMessageIds.has(id)) return;
        if (id) this.seenMessageIds.add(id);

        const sender = msg.sender === 'user' || msg.sender === 'client' ? 'user' : (msg.sender === 'admin' ? 'agent' : 'agent');

        // Skip echoing our own outbound messages when not from history (optimistic UI already showed them)
        if (!fromHistory && sender === 'user') return;

        this.appendMessage(msg.message, sender, msg.timestamp);

        if (!fromHistory && sender === 'agent' && !this.isOpen) {
            this.hasUnread = true;
            const headerBtn = document.getElementById('headerLiveChatBtn');
            if (headerBtn && !headerBtn.querySelector('span[style*="background:red"]')) {
                headerBtn.insertAdjacentHTML(
                    'beforeend',
                    '<span style="position:absolute;top:0;right:0;width:12px;height:12px;background:red;border-radius:50%;border:2px solid white"></span>'
                );
            }
        }
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
        if (!text || this.chatClosed || !this.hasVisitorInfo()) return;

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
        const timeStr = new Date(timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        div.innerHTML = `${this.escapeHtml(text)}<span class="message-time">${timeStr}</span>`;
        this.body.appendChild(div);
        this.scrollToBottom();
    }

    scrollToBottom() {
        if (this.body) this.body.scrollTop = this.body.scrollHeight;
    }
}

function initLiveChatWidget() {
    if (window.liveChat) return;

    if (!document.querySelector('link[href="/css/chat.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/chat.css?v=3';
        document.head.appendChild(link);
    }

    window.liveChat = new LiveChat();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveChatWidget);
} else {
    initLiveChatWidget();
}
