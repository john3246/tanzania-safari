let adminSocket;
let currentAdminChatId = null;
let allChats = {};

document.addEventListener('DOMContentLoaded', () => {
    // Only init if we are on the chat page
    const initAdminChat = () => {
        if (typeof io === 'undefined') return console.error('Socket.io not loaded');
        if (adminSocket) return; // already connected
        
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
    };

    // Since it's a SPA, we need to hook into the page load
    // Assuming core.js triggers a custom event or we can just run it when #section-chat is shown
    // A simple observer on section-chat
    const chatSection = document.getElementById('section-chat');
    if (chatSection) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('hidden')) {
                    // hidden
                } else {
                    // shown
                    initAdminChat();
                }
            });
        });
        observer.observe(chatSection, { attributes: true, attributeFilter: ['class'] });
    }

    const chatListEl = document.getElementById('adminChatList');
    const chatMessagesEl = document.getElementById('adminChatMessages');
    const currentChatTitle = document.getElementById('adminCurrentChatTitle');
    const chatForm = document.getElementById('adminChatForm');
    const chatInput = document.getElementById('adminChatInput');

    function renderChatList() {
        if (!chatListEl) return;
        chatListEl.innerHTML = '';
        Object.values(allChats).forEach(chat => {
            const div = document.createElement('div');
            div.className = `p-3 cursor-pointer border-b border-gray-100 hover:bg-gray-100 ${currentAdminChatId === chat.id ? 'bg-blue-50' : ''}`;
            div.innerHTML = `
                <div class="font-semibold text-sm text-gray-800">Visitor ${chat.id.substring(0,6)}...</div>
                <div class="text-xs text-gray-500 truncate">${chat.messages.length > 0 ? chat.messages[chat.messages.length-1].message : 'Started chat'}</div>
            `;
            div.onclick = () => selectChat(chat.id);
            chatListEl.appendChild(div);
        });
    }

    function selectChat(chatId) {
        currentAdminChatId = chatId;
        renderChatList();
        const chat = allChats[chatId];
        currentChatTitle.textContent = `Visitor ${chatId.substring(0,8)}...`;
        renderMessages(chat);
    }

    function renderMessages(chat) {
        if (!chatMessagesEl) return;
        chatMessagesEl.innerHTML = '';
        chat.messages.forEach(msg => {
            const isMe = msg.sender === 'admin';
            const div = document.createElement('div');
            div.className = `flex ${isMe ? 'justify-end' : 'justify-start'}`;
            div.innerHTML = `
                <div class="max-w-[70%] rounded-lg px-4 py-2 ${isMe ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}">
                    <div class="text-sm">${msg.message}</div>
                </div>
            `;
            chatMessagesEl.appendChild(div);
        });
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text || !currentAdminChatId || !adminSocket) return;
            
            adminSocket.emit('send_message', {
                chatId: currentAdminChatId,
                sender: 'admin',
                message: text
            });
            
            chatInput.value = '';
        });
    }
});
