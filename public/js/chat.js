let socket;
let currentChatId = localStorage.getItem('chatId');

document.addEventListener('DOMContentLoaded', () => {
    const floatBtn = document.getElementById('socialFloatBtn');
    const chatWidget = document.getElementById('liveChatWidget');
    const closeChatBtn = document.getElementById('closeLiveChat');
    const chatInput = document.getElementById('chatInput');
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatMessages = document.getElementById('chatMessages');

    if (!chatWidget) return;

    // Toggle Chat
    floatBtn.addEventListener('click', (e) => {
        // Default behavior toggles the social float menu
        // We will intercept it or just open the chat
        if (chatWidget.style.display === 'none' || chatWidget.style.display === '') {
            chatWidget.style.display = 'flex';
            if (!socket) initChat();
        } else {
            chatWidget.style.display = 'none';
        }
    });

    closeChatBtn.addEventListener('click', () => {
        chatWidget.style.display = 'none';
    });

    function initChat() {
        if (typeof io === 'undefined') return console.error('Socket.io not loaded');
        
        socket = io();
        
        socket.on('connect', () => {
            if (!currentChatId) {
                currentChatId = socket.id;
                localStorage.setItem('chatId', currentChatId);
            }
            socket.emit('join_chat', { chatId: currentChatId });
        });

        socket.on('chat_joined', (data) => {
            // Load previous messages if any (except the initial bot msg)
            if (data.chat && data.chat.messages.length > 0) {
                chatMessages.innerHTML = ''; // clear initial bot message
                data.chat.messages.forEach(msg => appendMessage(msg));
            }
        });

        socket.on('new_message', (data) => {
            if (data.msg.sender !== 'client') {
                appendMessage(data.msg);
            }
        });
    }

    function appendMessage(msg) {
        const div = document.createElement('div');
        div.className = `chat-message ${msg.sender === 'client' ? 'user' : 'bot'}`;
        div.textContent = msg.message;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text || !socket) return;
        
        const msg = { sender: 'client', message: text, timestamp: new Date() };
        appendMessage(msg);
        socket.emit('send_message', { chatId: currentChatId, sender: 'client', message: text });
        chatInput.value = '';
    }

    sendChatBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
