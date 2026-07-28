/**
 * Admin Live Chat — realtime, resilient, fast
 */
let adminSocket = null;
let currentAdminChatId = null;
let allChats = {};
let connecting = false;
let listRenderQueued = false;

let chatListEl = null;
let chatMessagesEl = null;
let currentChatTitle = null;
let chatForm = null;
let chatInput = null;
let chatSendBtn = null;
let chatCountBadge = null;
let chatActiveDot = null;
let chatConnBanner = null;

function ensureConnBanner() {
  if (chatConnBanner || !chatMessagesEl) return;
  const parent = chatMessagesEl.parentElement;
  if (!parent) return;
  chatConnBanner = document.createElement('div');
  chatConnBanner.id = 'adminChatConnBanner';
  chatConnBanner.style.cssText =
    'display:none;padding:8px 16px;font-size:12px;text-align:center;background:#fef3c7;color:#92400e;border-bottom:1px solid #fde68a;flex-shrink:0;';
  chatConnBanner.textContent = 'Connecting to live chat...';
  parent.insertBefore(chatConnBanner, chatMessagesEl);
}

function setConnBanner(visible, text) {
  ensureConnBanner();
  if (!chatConnBanner) return;
  chatConnBanner.style.display = visible ? 'block' : 'none';
  if (text) chatConnBanner.textContent = text;
}

function getAdminToken() {
  return localStorage.getItem('adminToken') || localStorage.getItem('token') || '';
}

function queueRenderChatList() {
  if (listRenderQueued) return;
  listRenderQueued = true;
  requestAnimationFrame(() => {
    listRenderQueued = false;
    try {
      renderChatList();
    } catch (e) {
      console.error('renderChatList failed', e);
    }
  });
}

function initAdminChat() {
  try {
    if (typeof io === 'undefined') {
      console.error('Socket.io not loaded');
      return;
    }

    chatListEl = document.getElementById('adminChatList');
    chatMessagesEl = document.getElementById('adminChatMessages');
    currentChatTitle = document.getElementById('adminCurrentChatTitle');
    chatForm = document.getElementById('adminChatForm');
    chatInput = document.getElementById('adminChatInput');
    chatSendBtn = document.getElementById('adminChatSendBtn');
    chatCountBadge = document.getElementById('chatCountBadge');
    chatActiveDot = document.getElementById('chatActiveDot');
    ensureConnBanner();

    if (adminSocket) {
      if (adminSocket.connected) {
        adminSocket.emit('admin_join');
        setConnBanner(false);
      } else if (!connecting) {
        setConnBanner(true, 'Reconnecting…');
        adminSocket.connect();
      }
      queueRenderChatList();
      if (currentAdminChatId && allChats[currentAdminChatId]) {
        selectChat(currentAdminChatId);
      }
      return;
    }

    const token = getAdminToken();
    if (!token) {
      setConnBanner(true, 'Not authenticated — please log in again.');
      return;
    }

    connecting = true;
    setConnBanner(true, 'Connecting to live chat...');

    adminSocket = io({
      auth: { role: 'admin', token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 8000,
      timeout: 15000,
      forceNew: false
    });

    adminSocket.on('connect', () => {
      connecting = false;
      setConnBanner(false);
      adminSocket.emit('admin_join');
    });

    adminSocket.on('disconnect', (reason) => {
      setConnBanner(true, 'Disconnected — reconnecting…');
      if (reason === 'io server disconnect') {
        // Server forced disconnect — try again with fresh auth
        setTimeout(() => {
          try {
            adminSocket.auth = { role: 'admin', token: getAdminToken() };
            adminSocket.connect();
          } catch (_) {}
        }, 1000);
      }
    });

    adminSocket.on('connect_error', (err) => {
      connecting = false;
      const msg = err?.message || 'Connection failed';
      setConnBanner(
        true,
        msg === 'Unauthorized' ? 'Unauthorized — please log in again.' : 'Connection failed — retrying…'
      );
      if (msg === 'Unauthorized') {
        // Don't hammer unauthorized
        adminSocket.io.opts.reconnection = false;
      }
    });

    adminSocket.on('all_chats', (chats) => {
      try {
        allChats = chats && typeof chats === 'object' ? chats : {};
        queueRenderChatList();
        if (currentAdminChatId && allChats[currentAdminChatId]) {
          renderMessages(allChats[currentAdminChatId]);
        }
      } catch (e) {
        console.error('all_chats handler', e);
      }
    });

    // Fast path: append a single message without full list rebuild when possible
    adminSocket.on('new_message', (payload) => {
      try {
        if (!payload?.chatId || !payload?.msg) return;
        const chatId = String(payload.chatId);
        if (!allChats[chatId]) {
          allChats[chatId] = {
            id: chatId,
            status: 'open',
            messages: [],
            updatedAt: new Date().toISOString()
          };
        }
        const chat = allChats[chatId];
        chat.messages = chat.messages || [];
        const exists = chat.messages.some(
          (m) =>
            (m.id && payload.msg.id && m.id === payload.msg.id) ||
            (m.message === payload.msg.message &&
              m.sender === payload.msg.sender &&
              String(m.timestamp) === String(payload.msg.timestamp))
        );
        if (!exists) {
          // Remove optimistic temp messages that match
          chat.messages = chat.messages.filter(
            (m) => !(m._optimistic && m.message === payload.msg.message && m.sender === payload.msg.sender)
          );
          chat.messages.push(payload.msg);
        }
        chat.updatedAt = new Date().toISOString();
        chat.status = chat.status || 'open';
        if (currentAdminChatId === chatId) {
          appendMessageBubble(payload.msg);
        }
        queueRenderChatList();
      } catch (e) {
        console.error('new_message handler', e);
      }
    });

    adminSocket.on('chat_updated', (chat) => {
      try {
        if (!chat || !chat.id) return;
        if (chat.status === 'closed') {
          delete allChats[chat.id];
          if (currentAdminChatId === chat.id) {
            currentAdminChatId = null;
            if (currentChatTitle) currentChatTitle.textContent = 'Select a conversation';
            if (chatActiveDot) chatActiveDot.style.display = 'none';
            if (chatInput) chatInput.disabled = true;
            if (chatSendBtn) chatSendBtn.disabled = true;
            if (chatMessagesEl) {
              chatMessagesEl.innerHTML =
                '<div class="m-auto text-center text-gray-400 text-sm">Conversation closed.</div>';
            }
          }
        } else {
          allChats[chat.id] = chat;
          if (currentAdminChatId === chat.id) {
            renderMessages(chat);
          }
        }
        queueRenderChatList();
      } catch (e) {
        console.error('chat_updated handler', e);
      }
    });

    adminSocket.on('chat_error', (data) => {
      console.warn('Admin chat error:', data?.message);
      if (typeof showToast === 'function') {
        showToast(data?.message || 'Chat error', 'error');
      }
    });
  } catch (err) {
    console.error('initAdminChat crashed', err);
    setConnBanner(true, 'Chat failed to start — refresh the page.');
  }
}

function renderChatList() {
  if (!chatListEl) return;
  const chatsArray = Object.values(allChats).filter((c) => c && c.status !== 'closed');
  if (chatCountBadge) chatCountBadge.textContent = String(chatsArray.length);

  if (chatsArray.length === 0) {
    chatListEl.innerHTML = '<div class="p-8 text-center text-gray-400 text-xs">No active chats.</div>';
    return;
  }

  const frag = document.createDocumentFragment();
  chatsArray
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .forEach((chat) => {
      const div = document.createElement('div');
      const isActive = currentAdminChatId === chat.id;
      div.className = `p-4 cursor-pointer border-b border-gray-150 transition-all ${
        isActive ? 'bg-emerald-50/60 border-l-4 border-l-emerald-600' : 'hover:bg-gray-100 bg-white'
      }`;

      const lastMsg =
        chat.messages && chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1].message
          : 'Started chat';
      const label = chat.visitorName || `Visitor ${String(chat.id).substring(0, 6).toUpperCase()}`;

      div.innerHTML = `
        <div class="flex justify-between items-center mb-1">
          <div class="font-bold text-sm text-slate-800">${escapeHtml(label)}</div>
          <div class="text-[10px] text-slate-400">Live</div>
        </div>
        <div class="text-xs text-slate-500 truncate">${escapeHtml(lastMsg)}</div>
      `;
      div.onclick = () => selectChat(chat.id);
      frag.appendChild(div);
    });
  chatListEl.innerHTML = '';
  chatListEl.appendChild(frag);
}

function selectChat(chatId) {
  try {
    currentAdminChatId = chatId;
    queueRenderChatList();
    const chat = allChats[chatId];
    if (!chat) return;

    if (adminSocket && adminSocket.connected) {
      adminSocket.emit('admin_open_chat', { chatId });
    }

    if (currentChatTitle) {
      currentChatTitle.textContent = chat.visitorName
        ? `${chat.visitorName}${chat.visitorEmail ? ' · ' + chat.visitorEmail : ''}`
        : `Visitor ID: ${String(chatId).substring(0, 10).toUpperCase()}`;
    }
    if (chatActiveDot) chatActiveDot.style.display = 'block';
    if (chatInput) {
      chatInput.disabled = false;
      chatInput.focus();
    }
    if (chatSendBtn) chatSendBtn.disabled = false;

    renderMessages(chat);
  } catch (e) {
    console.error('selectChat failed', e);
  }
}

function appendMessageBubble(msg) {
  if (!chatMessagesEl || !msg) return;
  // Clear empty state
  const empty = chatMessagesEl.querySelector('.m-auto');
  if (empty) chatMessagesEl.innerHTML = '';

  const isMe = msg.sender === 'admin';
  const div = document.createElement('div');
  div.className = `flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`;
  if (msg._optimistic) div.dataset.optimistic = '1';
  const cardStyle = isMe
    ? 'bg-emerald-600 text-white rounded-br-none'
    : 'bg-slate-100 text-slate-800 rounded-bl-none';
  div.innerHTML = `
    <div class="max-w-[75%] rounded-2xl px-4 py-2.5 shadow-xs ${cardStyle}">
      <div class="text-sm leading-relaxed">${escapeHtml(msg.message)}</div>
      <div class="text-[9px] mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-slate-400'}">${new Date(
        msg.timestamp || Date.now()
      ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    </div>
  `;
  chatMessagesEl.appendChild(div);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function renderMessages(chat) {
  if (!chatMessagesEl) return;
  chatMessagesEl.innerHTML = '';

  if (!chat.messages || chat.messages.length === 0) {
    chatMessagesEl.innerHTML =
      '<div class="m-auto text-center text-gray-400 text-xs">No messages yet. Say hello!</div>';
    return;
  }

  chat.messages.forEach((msg) => appendMessageBubble(msg));
}

function sendAdminMessage() {
  try {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text || !currentAdminChatId || !adminSocket) return;

    if (!adminSocket.connected) {
      if (typeof showToast === 'function') showToast('Not connected — reconnecting…', 'error');
      adminSocket.connect();
      return;
    }

    const optimistic = {
      sender: 'admin',
      message: text,
      timestamp: new Date().toISOString(),
      _optimistic: true
    };
    if (!allChats[currentAdminChatId]) {
      allChats[currentAdminChatId] = { id: currentAdminChatId, status: 'open', messages: [] };
    }
    allChats[currentAdminChatId].messages = allChats[currentAdminChatId].messages || [];
    allChats[currentAdminChatId].messages.push(optimistic);
    appendMessageBubble(optimistic);
    queueRenderChatList();

    adminSocket.emit('send_message', {
      chatId: currentAdminChatId,
      sender: 'admin',
      message: text
    });
    chatInput.value = '';
    chatInput.focus();
  } catch (e) {
    console.error('sendAdminMessage failed', e);
    if (typeof showToast === 'function') showToast('Failed to send', 'error');
  }
}

function closeCurrentChat() {
  if (!currentAdminChatId || !adminSocket || !adminSocket.connected) return;
  adminSocket.emit('close_chat', { chatId: currentAdminChatId });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.initChatPage = initAdminChat;
window.initAdminChat = initAdminChat;
window.sendAdminMessage = sendAdminMessage;
window.closeCurrentChat = closeCurrentChat;
