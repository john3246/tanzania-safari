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

function messageKey(m) {
  if (!m) return '';
  if (m.id != null) return `id:${m.id}`;
  return `t:${m.sender}|${m.message}|${m.timestamp}`;
}

function mergeChatStore(incoming) {
  if (!incoming?.id) return;
  const id = incoming.id;
  const prev = allChats[id];
  if (!prev) {
    allChats[id] = incoming;
    return;
  }
  const byKey = new Map();
  (prev.messages || []).forEach((m) => {
    if (m._optimistic) return;
    byKey.set(messageKey(m), m);
  });
  (incoming.messages || []).forEach((m) => byKey.set(messageKey(m), m));
  allChats[id] = {
    ...prev,
    ...incoming,
    messages: Array.from(byKey.values())
  };
}

/** Store + optional UI append; replaces matching optimistic bubbles. */
function ingestMessage(chatIdRaw, msg, { appendUi = false, fromAck = false } = {}) {
  if (!chatIdRaw || !msg) return;
  const chatId = String(chatIdRaw);
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

  const already = chat.messages.some(
    (m) =>
      (!m._optimistic && messageKey(m) === messageKey(msg)) ||
      (m.id != null && msg.id != null && m.id === msg.id)
  );

  // Drop optimistic twin
  const beforeLen = chat.messages.length;
  chat.messages = chat.messages.filter(
    (m) => !(m._optimistic && m.message === msg.message && m.sender === msg.sender)
  );
  const removedOptimistic = chat.messages.length < beforeLen;

  if (!already) {
    chat.messages.push(msg);
  } else if (removedOptimistic) {
    // replace already handled by filter; ensure real msg present
    const hasReal = chat.messages.some((m) => !m._optimistic && messageKey(m) === messageKey(msg));
    if (!hasReal) chat.messages.push(msg);
  }

  chat.updatedAt = msg.timestamp || new Date().toISOString();
  chat.status = chat.status || 'open';

  if (appendUi && currentAdminChatId === chatId) {
    if (removedOptimistic) {
      removeOptimisticBubbles(msg.message, msg.sender);
    }
    if (!already || removedOptimistic || fromAck) {
      appendMessageBubble(msg, { skipIfPresent: true });
    }
  }
  queueRenderChatList();
}

function removeOptimisticBubbles(message, sender) {
  if (!chatMessagesEl) return;
  chatMessagesEl.querySelectorAll('[data-optimistic="1"]').forEach((el) => {
    const text = el.querySelector('.text-sm')?.textContent || '';
    const isAdmin = el.classList.contains('justify-end');
    if (text === message && ((sender === 'admin') === isAdmin)) {
      el.remove();
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

    if (chatForm && !chatForm.dataset.bound) {
      chatForm.dataset.bound = '1';
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendAdminMessage();
      });
    }
    if (chatSendBtn && !chatSendBtn.dataset.bound) {
      chatSendBtn.dataset.bound = '1';
      chatSendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sendAdminMessage();
      });
    }

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

    adminSocket.on('new_message', (payload) => {
      try {
        ingestMessage(payload?.chatId, payload?.msg, { appendUi: true });
      } catch (e) {
        console.error('new_message handler', e);
      }
    });

    // Settle optimistic send without wiping the pane
    adminSocket.on('message_ack', (payload) => {
      try {
        ingestMessage(payload?.chatId, payload?.msg, { appendUi: true, fromAck: true });
      } catch (e) {
        console.error('message_ack handler', e);
      }
    });

    // Lightweight sidebar sync — never clears the message pane
    adminSocket.on('chat_list_touch', (touch) => {
      try {
        if (!touch?.chatId) return;
        const chatId = String(touch.chatId);
        if (!allChats[chatId]) {
          allChats[chatId] = {
            id: chatId,
            status: touch.status || 'open',
            messages: [],
            visitorName: touch.visitorName,
            visitorEmail: touch.visitorEmail,
            updatedAt: touch.updatedAt || new Date().toISOString()
          };
        } else {
          const chat = allChats[chatId];
          if (touch.updatedAt) chat.updatedAt = touch.updatedAt;
          if (touch.visitorName) chat.visitorName = touch.visitorName;
          if (touch.visitorEmail) chat.visitorEmail = touch.visitorEmail;
          if (touch.status) chat.status = touch.status;
          if (touch.preview && (!chat.messages || chat.messages.length === 0)) {
            // Keep list preview text available even before messages hydrate
            chat._preview = touch.preview;
          }
        }
        queueRenderChatList();
      } catch (e) {
        console.error('chat_list_touch handler', e);
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
          queueRenderChatList();
          return;
        }

        const existing = allChats[chat.id];
        const wasOpen = currentAdminChatId === chat.id;
        const prevLen = existing?.messages?.length || 0;
        // Merge into store; avoid full pane wipe when we already have messages rendered
        if (!existing || prevLen === 0) {
          allChats[chat.id] = chat;
          if (wasOpen) renderMessages(chat);
        } else {
          mergeChatStore(chat);
          const nextLen = (allChats[chat.id].messages || []).length;
          if (wasOpen && nextLen > prevLen + 1) {
            renderMessages(allChats[chat.id]);
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
          : chat._preview || 'Started chat';
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

function appendMessageBubble(msg, opts = {}) {
  if (!chatMessagesEl || !msg) return;
  // Clear empty state
  const empty = chatMessagesEl.querySelector('.m-auto');
  if (empty) chatMessagesEl.innerHTML = '';

  const key = messageKey(msg);
  if (opts.skipIfPresent && key) {
    const nodes = chatMessagesEl.querySelectorAll('[data-msg-key]');
    for (const el of nodes) {
      if (el.getAttribute('data-msg-key') === key) return;
    }
  }

  const isMe = msg.sender === 'admin';
  const div = document.createElement('div');
  div.className = `flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`;
  div.dataset.msgKey = key;
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
window.handleChatSubmit = function handleChatSubmit(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  sendAdminMessage();
};
