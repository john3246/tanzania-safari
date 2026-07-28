const jwt = require('jsonwebtoken');
const xss = require('xss');
const ChatRepository = require('../repositories/ChatRepository');
const { JWT_SECRET } = require('../middleware/auth.middleware');
const db = require('../config/db');
const logger = require('../utils/logger');

// Map chatId -> Set of visitor socket ids for reliable delivery across reconnects
const visitorSockets = new Map();

function sanitizeMessage(text) {
    if (!text || typeof text !== 'string') return '';
    return xss(text.trim()).slice(0, 2000);
}

function trackVisitor(chatId, socketId) {
    if (!visitorSockets.has(chatId)) visitorSockets.set(chatId, new Set());
    visitorSockets.get(chatId).add(socketId);
}

function untrackVisitor(chatId, socketId) {
    const set = visitorSockets.get(chatId);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) visitorSockets.delete(chatId);
}

function emitToVisitors(io, chatId, event, payload) {
    io.to(chatId).emit(event, payload);
    const sockets = visitorSockets.get(chatId);
    if (sockets) {
        for (const sid of sockets) {
            io.to(sid).emit(event, payload);
        }
    }
}

async function verifyAdminToken(token) {
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const targetId = decoded.userId || decoded.id || decoded.sub;
        const tokenRole = decoded.role || '';

        if (targetId) {
            const userQuery = await db.query(
                `SELECT u.*, ur.role_name FROM users u
                 LEFT JOIN user_roles ur ON u.role_id = ur.role_id
                 WHERE u.user_id = $1 AND u.is_active = true`,
                [targetId]
            );
            if (userQuery.rows.length > 0) {
                return userQuery.rows[0];
            }
        }

        if (tokenRole || targetId) {
            return {
                user_id: targetId || 'admin',
                first_name: decoded.name || 'Admin',
                email: decoded.email || 'admin@tanzaniasafari.com',
                role_name: tokenRole || 'Super Admin'
            };
        }
        return null;
    } catch {
        return null;
    }
}

async function createNotification(payload) {
    try {
        const NotificationRepository = require('../repositories/NotificationRepository');
        return await NotificationRepository.create(payload);
    } catch (err) {
        logger.warn({ event: 'notification_insert_failed', error: err.message }, 'Could not insert notification');
        return null;
    }
}

function initChatSocket(io) {
    // Expose for booking/enquiry notifications
    global.__chatIo = io;

    io.use(async (socket, next) => {
        if (socket.handshake.auth?.role === 'admin') {
            const admin = await verifyAdminToken(socket.handshake.auth.token);
            if (!admin) return next(new Error('Unauthorized'));
            socket.isAdmin = true;
            socket.adminUser = admin;
        }
        next();
    });

    io.on('connection', (socket) => {
        logger.info({ event: 'chat_connected', socketId: socket.id, isAdmin: !!socket.isAdmin }, 'Chat client connected');

        socket.on('join_chat', async (data) => {
            try {
                const chatId = (data && data.chatId) ? String(data.chatId) : socket.id;
                socket.chatId = chatId;
                socket.join(chatId);
                trackVisitor(chatId, socket.id);

                const chat = await ChatRepository.getOrCreate(chatId, {
                    visitorName: data?.visitorName,
                    visitorEmail: data?.visitorEmail,
                    pageUrl: data?.pageUrl,
                    userAgent: data?.userAgent
                });

                // Upsert customer from chat visitor info
                if (data?.visitorEmail) {
                    try {
                        const CustomerRepository = require('../repositories/CustomerRepository');
                        await CustomerRepository.upsertFromChat({
                            name: data.visitorName,
                            email: data.visitorEmail
                        });
                    } catch (e) {
                        logger.warn({ event: 'chat_customer_upsert_failed', error: e.message });
                    }
                }

                const fullChat = await ChatRepository.getChatWithMessages(chatId);
                io.to('admin_room').emit('chat_updated', fullChat);
                socket.emit('chat_joined', { chatId, chat: fullChat });

                // Notify admins of new chat only when first created / no messages yet
                if (fullChat && (!fullChat.messages || fullChat.messages.length === 0)) {
                    await createNotification({
                        type: 'chat',
                        title: 'New live chat',
                        message: `${data?.visitorName || 'Visitor'} started a chat`,
                        relatedId: chatId,
                        actionUrl: '/admin/chat'
                    });
                    io.to('admin_room').emit('admin_notification', {
                        type: 'chat',
                        title: 'New live chat',
                        message: `${data?.visitorName || 'Visitor'} started a chat`
                    });
                }
            } catch (err) {
                logger.error({ event: 'join_chat_error', error: err.message }, 'join_chat failed');
                socket.emit('chat_error', { message: 'Failed to join chat' });
            }
        });

        socket.on('admin_join', async () => {
            if (!socket.isAdmin) {
                socket.emit('chat_error', { message: 'Unauthorized' });
                return socket.disconnect();
            }

            try {
                socket.join('admin_room');
                const allChats = await ChatRepository.getAllOpenChats();
                socket.emit('all_chats', allChats);
            } catch (err) {
                logger.error({ event: 'admin_join_error', error: err.message }, 'admin_join failed');
                socket.emit('chat_error', { message: 'Failed to load chats' });
            }
        });

        // Admin opens a specific conversation — join that room so broadcasts reach both sides
        socket.on('admin_open_chat', (data) => {
            if (!socket.isAdmin) return;
            const chatId = data?.chatId ? String(data.chatId) : null;
            if (!chatId) return;
            if (socket.activeChatId) socket.leave(socket.activeChatId);
            socket.activeChatId = chatId;
            socket.join(chatId);
        });

        socket.on('send_message', async (data) => {
            try {
                const chatId = data?.chatId ? String(data.chatId) : null;
                const sender = data?.sender;
                const message = sanitizeMessage(data?.message);

                if (!chatId || !sender || !message) return;

                const isAdminSender = sender === 'admin';
                if (isAdminSender && !socket.isAdmin) {
                    socket.emit('chat_error', { message: 'Unauthorized' });
                    return;
                }

                // Ensure sender is in the room
                socket.join(chatId);
                if (!isAdminSender) trackVisitor(chatId, socket.id);

                let chat = await ChatRepository.getByExternalId(chatId);
                if (!chat) {
                    chat = await ChatRepository.getOrCreate(chatId);
                }

                if (chat.status !== 'open') {
                    socket.emit('chat_error', { message: 'This chat is closed' });
                    return;
                }

                const msg = await ChatRepository.addMessage(chatId, sender, message);
                const updatedChat = await ChatRepository.getChatWithMessages(chatId);

                // Fast path for both sides
                emitToVisitors(io, chatId, 'new_message', { chatId, msg });
                io.to('admin_room').emit('new_message', { chatId, msg });
                io.to('admin_room').emit('chat_updated', updatedChat);

                if (!isAdminSender) {
                    await createNotification({
                        type: 'chat',
                        title: 'New chat message',
                        message: message.slice(0, 120),
                        relatedId: chatId,
                        actionUrl: '/admin/chat'
                    });
                    io.to('admin_room').emit('admin_notification', {
                        type: 'chat',
                        title: 'New chat message',
                        message: message.slice(0, 120)
                    });
                }
            } catch (err) {
                logger.error({ event: 'send_message_error', error: err.message }, 'send_message failed');
                socket.emit('chat_error', { message: 'Failed to send message' });
            }
        });

        socket.on('close_chat', async (data) => {
            if (!socket.isAdmin) {
                socket.emit('chat_error', { message: 'Unauthorized' });
                return;
            }

            try {
                const chatId = data?.chatId ? String(data.chatId) : null;
                if (!chatId) return;

                await ChatRepository.updateStatus(chatId, 'closed');
                const updatedChat = await ChatRepository.getChatWithMessages(chatId);
                io.to('admin_room').emit('chat_updated', updatedChat);
                emitToVisitors(io, chatId, 'chat_closed', { chatId });
            } catch (err) {
                logger.error({ event: 'close_chat_error', error: err.message }, 'close_chat failed');
                socket.emit('chat_error', { message: 'Failed to close chat' });
            }
        });

        socket.on('disconnect', () => {
            if (socket.chatId) untrackVisitor(socket.chatId, socket.id);
            logger.info({ event: 'chat_disconnected', socketId: socket.id }, 'Chat client disconnected');
        });
    });
}

async function setupRedisAdapter(io) {
    if (!process.env.REDIS_URL) return;

    try {
        const { createAdapter } = require('@socket.io/redis-adapter');
        const Redis = require('ioredis');
        const pubClient = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: null,
            lazyConnect: true
        });
        const subClient = pubClient.duplicate();

        pubClient.on('error', (err) => {
            logger.warn({ event: 'redis_pub_error', error: err.message }, 'Redis pub client error');
        });

        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        logger.info({ event: 'socket_redis_adapter_ok' }, 'Socket.io Redis adapter connected');
    } catch (err) {
        logger.warn({ event: 'socket_redis_adapter_failed', error: err.message }, 'Redis adapter unavailable, using in-memory adapter');
    }
}

module.exports = { initChatSocket, setupRedisAdapter, createNotification };
