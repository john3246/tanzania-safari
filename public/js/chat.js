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
            this.chatId = this.generateChatId();
            localStorage.setItem('safari_chat_id', this.chatId);
        }
        this.visitorName = localStorage.getItem('safari_chat_name') || '';
        this.visitorEmail = localStorage.getItem('safari_chat_email') || '';
        this.isOpen = false;
        this.hasUnread = false;
        this.pendingMessages = [];
        this.joined = false;
        this.chatClosed = localStorage.getItem('safari_chat_closed') === '1';
        this.seenMessageIds = new Set();
        this.starting = false;

        const oldWidget = document.getElementById('liveChatWidget');
        if (oldWidget) oldWidget.remove();

        this.initUI();
        document.addEventListener('tsm:languagechange', () => this.applyI18n());
    }

    generateChatId() {
        return 'chat_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).slice(-4);
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
        if (this.newBtn) this.newBtn.textContent = t('chat.newConversation');
        if (this.fab) this.fab.setAttribute('aria-label', t('chat.title'));
        const welcome = this.body && this.body.querySelector('.chat-message.system');
        if (welcome && !this.joined) welcome.textContent = t('chat.welcome');
        if (this.statusEl && !this.socket) {
            this.setStatus(t('chat.online'));
        }
    }

    initUI() {
        this.container = document.createElement('div');
        this.container.className = 'chat-widget';
        this.container.id = 'liveChatWidget';

        this.fab = document.createElement('button');
        this.fab.type = 'button';
        this.fab.className = 'chat-button';
        this.fab.id = 'chatFabBtn';
        this.fab.setAttribute('aria-label', t('chat.title'));
        this.fab.innerHTML = '<i class="fas fa-comments" aria-hidden="true"></i>';

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
            <form class="chat-preform" id="chatPreForm" novalidate>
                <p class="chat-preform-intro">${t('chat.intro')}</p>
                <input type="text" id="chatVisitorName" class="chat-input" placeholder="${t('chat.namePlaceholder')}" maxlength="100" autocomplete="name" required>
                <input type="email" id="chatVisitorEmail" class="chat-input" placeholder="${t('chat.emailPlaceholder')}" maxlength="255" autocomplete="email" required>
                <button type="submit" class="chat-preform-btn" id="chatStartBtn">${t('chat.start')}</button>
            </form>
            <div class="chat-body" id="chatBody" style="display:none">
                <div class="chat-message system">${t('chat.welcome')}</div>
            </div>
            <div class="chat-input-area" id="chatInputArea" style="display:none">
                <input type="text" id="chatInput" class="chat-input" placeholder="${t('chat.messagePlaceholder')}" autocomplete="off" maxlength="2000">
                <button class="chat-send" id="chatSend" type="button" aria-label="${t('chat.sendAria')}"><i class="fas fa-paper-plane"></i></button>
            </div>
            <div class="chat-new-wrap" id="chatNewWrap">
                <button type="button" class="chat-preform-btn" id="chatNewBtn">${t('chat.newConversation')}</button>
            </div>
        `;

        this.container.appendChild(this.window);
        this.container.appendChild(this.fab);
        document.body.appendChild(this.container);
        this.window.setAttribute('aria-hidden', 'true');

        this.preForm = document.getElementById('chatPreForm');
        this.nameInput = document.getElementById('chatVisitorName');
        this.emailInput = document.getElementById('chatVisitorEmail');
        this.startBtn = document.getElementById('chatStartBtn');
        this.input = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('chatSend');
        this.body = document.getElementById('chatBody');
        this.inputArea = document.getElementById('chatInputArea');
        this.statusEl = document.getElementById('chatConnStatus');
        this.newBtn = document.getElementById('chatNewBtn');
        this.newWrap = document.getElementById('chatNewWrap');

        if (this.visitorName) this.nameInput.value = this.visitorName;
        if (this.visitorEmail) this.emailInput.value = this.visitorEmail;

        this.window.querySelector('.chat-close').onclick = () => this.toggleChat();
        this.fab.onclick = () => this.toggleChat();
        this.preForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.startChat();
        });
        this.startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.startChat();
        });
        this.sendBtn.onclick = () => this.sendMessage();
        this.newBtn.onclick = () => this.startNewConversation();
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

        if (this.hasVisitorInfo() && !this.chatClosed) {
            this.showChatUI();
        } else if (this.hasVisitorInfo() && this.chatClosed) {
            this.showChatUI();
            this.showClosedState();
        }
    }

    showChatUI() {
        if (this.preForm) this.preForm.style.display = 'none';
        if (this.body) this.body.style.display = '';
        if (this.chatClosed) {
            this.showClosedState();
        } else {
            this.hideClosedState();
        }
    }

    showPreForm() {
        if (this.preForm) this.preForm.style.display = '';
        if (this.body) this.body.style.display = 'none';
        if (this.inputArea) this.inputArea.style.display = 'none';
        if (this.newWrap) this.newWrap.classList.remove('visible');
    }

    showClosedState() {
        this.chatClosed = true;
        localStorage.setItem('safari_chat_closed', '1');
        if (this.inputArea) this.inputArea.style.display = 'none';
        if (this.newWrap) this.newWrap.classList.add('visible');
        if (this.input) this.input.disabled = true;
        if (this.sendBtn) this.sendBtn.disabled = true;
    }

    hideClosedState() {
        this.chatClosed = false;
        localStorage.removeItem('safari_chat_closed');
        if (this.inputArea) this.inputArea.style.display = '';
        if (this.newWrap) this.newWrap.classList.remove('visible');
        if (this.input) this.input.disabled = false;
        if (this.sendBtn) this.sendBtn.disabled = false;
    }

    startChat() {
        if (this.starting) return;

        const name = (this.nameInput.value || '').trim();
        const email = (this.emailInput.value || '').trim();
        if (!name || !email) {
            this.setStatus(t('chat.nameEmailRequired'));
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.setStatus(t('chat.invalidEmail'));
            return;
        }

        this.visitorName = name;
        this.visitorEmail = email;
        localStorage.setItem('safari_chat_name', name);
        localStorage.setItem('safari_chat_email', email);

        if (this.chatClosed) {
            this.resetSession();
        }

        this.starting = true;
        if (this.startBtn) {
            this.startBtn.disabled = true;
            this.startBtn.textContent = t('chat.connecting');
        }

        this.showChatUI();
        this.ensureConnected();
        setTimeout(() => this.input && this.input.focus(), 200);

        setTimeout(() => {
            this.starting = false;
            if (this.startBtn) {
                this.startBtn.disabled = false;
                this.startBtn.textContent = t('chat.start');
            }
        }, 1500);
    }

    startNewConversation() {
        this.resetSession();
        if (this.body) {
            this.body.innerHTML = `<div class="chat-message system">${t('chat.welcome')}</div>`;
        }
        this.showChatUI();
        this.ensureConnected();
        setTimeout(() => this.input && this.input.focus(), 200);
    }

    resetSession() {
        this.chatId = this.generateChatId();
        localStorage.setItem('safari_chat_id', this.chatId);
        this.joined = false;
        this.pendingMessages = [];
        this.seenMessageIds.clear();
        this.hideClosedState();
    }

    ensureConnected() {
        if (typeof io === 'undefined') {
            this.setStatus(t('chat.offline'));
            return;
        }
        if (!this.hasVisitorInfo()) return;

        if (!this.socket) {
            this.connectSocket();
            return;
        }
        if (this.socket.connected) {
            this.emitJoin();
            return;
        }
        this.socket.connect();
    }

    setStatus(text, online = false) {
        if (!this.statusEl) return;
        this.statusEl.innerHTML = `<span class="status-dot"${online ? '' : ' style="background:#999"'}></span> ${this.escapeHtml(text)}`;
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.window.classList.add('active');
            this.window.setAttribute('aria-hidden', 'false');
            document.body.classList.add('chat-open');
            if (this.fab) this.fab.style.visibility = 'hidden';
            if (this.hasVisitorInfo() && !this.chatClosed) {
                this.showChatUI();
                this.ensureConnected();
                setTimeout(() => this.input?.focus(), 300);
            } else if (this.hasVisitorInfo() && this.chatClosed) {
                this.showChatUI();
                this.showClosedState();
            } else {
                this.showPreForm();
                setTimeout(() => this.nameInput?.focus(), 300);
            }
            this.scrollToBottom();
            this.hasUnread = false;
            this.clearUnreadBadge();
        } else {
            this.window.classList.remove('active');
            this.window.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('chat-open');
            if (this.fab) this.fab.style.visibility = '';
        }
    }

    clearUnreadBadge() {
        const headerBtn = document.getElementById('headerLiveChatBtn');
        if (headerBtn) {
            headerBtn.style.boxShadow = '';
            const badge = headerBtn.querySelector('span[style*="background:red"]');
            if (badge) badge.remove();
        }
        if (this.fab) {
            const badge = this.fab.querySelector('.chat-unread-dot');
            if (badge) badge.remove();
        }
    }

    emitJoin() {
        if (!this.socket || !this.socket.connected || !this.hasVisitorInfo()) return;
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
        if (this.socket) return;

        this.socket = io({
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 30,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 8000
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
            if (data.chatId && data.chatId !== this.chatId) {
                this.chatId = data.chatId;
                localStorage.setItem('safari_chat_id', this.chatId);
            }

            const status = data.chat && data.chat.status;
            if (status === 'closed') {
                this.showClosedState();
                this.appendMessage(t('chat.closed'), 'system', new Date().toISOString());
                return;
            }

            this.hideClosedState();

            if (data.chat && data.chat.messages && data.chat.messages.length > 0) {
                this.body.innerHTML = `<div class="chat-message system">${t('chat.welcome')}</div>`;
                this.seenMessageIds.clear();
                data.chat.messages.forEach(msg => this.handleIncoming(msg, true));
            }

            this.flushPending();
            this.setStatus(t('chat.onlineInstant'), true);
        });

        this.socket.on('new_message', (data) => {
            if (!data || !data.msg) return;
            this.handleIncoming(data.msg, false);
        });

        this.socket.on('message_ack', (data) => {
            if (!data || !data.msg) return;
            const id = data.msg.id != null ? String(data.msg.id) : null;
            if (id) this.seenMessageIds.add(id);
        });

        this.socket.on('chat_closed', () => {
            this.showClosedState();
            this.appendMessage(t('chat.closed'), 'system', new Date().toISOString());
        });

        this.socket.on('chat_error', (data) => {
            const msg = data?.message || '';
            console.warn('Chat error:', msg);
            if (/closed/i.test(msg)) {
                this.showClosedState();
                this.appendMessage(t('chat.closed'), 'system', new Date().toISOString());
            }
            this.setStatus(msg || t('chat.offline'));
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
            if (this.fab && !this.fab.querySelector('.chat-unread-dot')) {
                this.fab.insertAdjacentHTML(
                    'beforeend',
                    '<span class="chat-unread-dot" style="position:absolute;top:4px;right:4px;width:12px;height:12px;background:red;border-radius:50%;border:2px solid white"></span>'
                );
            }
        }
    }

    flushPending() {
        if (!this.socket || !this.socket.connected || !this.joined || this.chatClosed) return;
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
            this.ensureConnected();
        }
    }

    appendMessage(text, sender, timestamp) {
        if (!this.body) return;
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
    if ((window.location.pathname || '').startsWith('/admin')) return;

    if (!document.querySelector('link[href*="chat.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/chat.css?v=6';
        document.head.appendChild(link);
    }

    window.liveChat = new LiveChat();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveChatWidget);
} else {
    initLiveChatWidget();
}
