let adminSocket;
let currentAdminChatId = null;
let allChats = {};

// Declare local variable references for elements
let chatListEl = null;
let chatMessagesEl = null;
let currentChatTitle = null;
let chatForm = null;
let chatInput = null;
let chatSendBtn = null;
let chatCountBadge = null;
let chatActiveDot = null;

function initAdminChat() {
    if (typeof io === 'undefined') return console.error('Socket.io not loaded');
    
    // Bind elements dynamically on each init to handle SPA re-load
    chatListEl = document.getElementById('adminChatList');
    chatMessagesEl = document.getElementById('adminChatMessages');
    currentChatTitle = document.getElementById('adminCurrentChatTitle');
    chatForm = document.getElementById('adminChatForm');
    chatInput = document.getElementById('adminChatInput');
    chatSendBtn = document.getElementById('adminChatSendBtn');
    chatCountBadge = document.getElementById('chatCountBadge');
    chatActiveDot = document.getElementById('chatActiveDot');

    if (adminSocket) {
        renderChatList();
        if (currentAdminChatId && allChats[currentAdminChatId]) {
            selectChat(currentAdminChatId);
        }
        return;
    }
    
    adminSocket = io();
    
    adminSocket.on('connect', () => {
        console.log('Admin socket connected');
        adminSocket.emit('admin_join');
    });

    adminSocket.on('all_chats', (chats) => {
        allChats = chats;
        renderChatList();
    });

    adminSocket.on('chat_updated', (chat) => {
        allChats[chat.id] = chat;
        renderChatList();
        if (currentAdminChatId === chat.id) {
            renderMessages(chat);
        }
    });

    adminSocket.on('new_message', (data) => {
        if (!data || !data.chatId || !data.msg) return;
        if (!allChats[data.chatId]) {
            allChats[data.chatId] = { id: data.chatId, status: 'open', messages: [] };
        }
        const exists = allChats[data.chatId].messages.some((m) => m.id === data.msg.id);
        if (!exists) allChats[data.chatId].messages.push(data.msg);
        renderChatList();
        if (currentAdminChatId === data.chatId) {
            renderMessages(allChats[data.chatId]);
        }
    });
}

function renderChatList() {
    if (!chatListEl) return;
    chatListEl.innerHTML = '';
    
    const chatsArray = Object.values(allChats);
    if (chatCountBadge) chatCountBadge.textContent = chatsArray.length;

    if (chatsArray.length === 0) {
        chatListEl.innerHTML = '<div class="p-8 text-center text-gray-400 text-xs">No active chats.</div>';
        return;
    }

    chatsArray.forEach(chat => {
        const div = document.createElement('div');
        const isActive = currentAdminChatId === chat.id;
        div.className = `p-4 cursor-pointer border-b border-gray-150 transition-all ${isActive ? 'bg-emerald-50/60 border-l-4 border-l-emerald-600' : 'hover:bg-gray-100 bg-white'}`;
        
        const lastMsg = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].message : 'Started chat';
        div.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <div class="font-bold text-sm text-slate-800">Visitor ${chat.id.substring(0, 6).toUpperCase()}</div>
                <div class="text-[10px] text-slate-400">Active</div>
            </div>
            <div class="text-xs text-slate-500 truncate" title="${lastMsg}">${lastMsg}</div>
        `;
        div.onclick = () => selectChat(chat.id);
        chatListEl.appendChild(div);
    });
}

function selectChat(chatId) {
    currentAdminChatId = chatId;
    renderChatList();
    const chat = allChats[chatId];
    if (!chat) return;

    if (currentChatTitle) currentChatTitle.textContent = `Visitor ID: ${chatId.substring(0, 10).toUpperCase()}`;
    if (chatActiveDot) chatActiveDot.style.display = 'block';
    
    if (chatInput) {
        chatInput.disabled = false;
        chatInput.focus();
    }
    if (chatSendBtn) chatSendBtn.disabled = false;

    renderMessages(chat);
}

function renderMessages(chat) {
    if (!chatMessagesEl) return;
    chatMessagesEl.innerHTML = '';
    
    if (chat.messages.length === 0) {
        chatMessagesEl.innerHTML = '<div class="m-auto text-center text-gray-400 text-xs">No messages yet.</div>';
        return;
    }

    chat.messages.forEach(msg => {
        const isMe = msg.sender === 'admin';
        const div = document.createElement('div');
        div.className = `flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`;
        
        const cardStyle = isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none';
        
        div.innerHTML = `
            <div class="max-w-[75%] rounded-2xl px-4 py-2.5 shadow-xs ${cardStyle}">
                <div class="text-sm leading-relaxed">${escapeHtml(msg.message)}</div>
                <div class="text-[9px] mt-1 text-right ${isMe ? 'text-emerald-200' : 'text-slate-400'}">${new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `;
        chatMessagesEl.appendChild(div);
    });
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function sendAdminMessage() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text || !currentAdminChatId || !adminSocket) return;
    
    adminSocket.emit('send_message', {
        chatId: currentAdminChatId,
        sender: 'admin',
        message: text
    });
    chatInput.value = '';
    chatInput.focus();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}

// Listen for SPA navigation events or MutationObserver to check active page
// Map globally for the core.js router
window.initChatPage = initAdminChat;
window.initAdminChat = initAdminChat;
window.sendAdminMessage = sendAdminMessage;
