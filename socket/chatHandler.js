const jwt = require('jsonwebtoken');
const xss = require('xss');
const ChatRepository = require('../repositories/ChatRepository');
const { JWT_SECRET } = require('../middleware/auth.middleware');
const db = require('../config/db');
const logger = require('../utils/logger');

function sanitizeMessage(text) {
    if (!text || typeof text !== 'string') return '';
    return xss(text.trim()).slice(0, 2000);
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
                const role = userQuery.rows[0].role_name || tokenRole;
                if (['Admin', 'Super Admin'].includes(role) || tokenRole) {
                    return userQuery.rows[0];
                }
            }
        }

        // Fallback for valid JWT admin sessions (matches verifyAdmin middleware)
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

function initChatSocket(io) {
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
                const chatId = (data && data.chatId) ? data.chatId : socket.id;
                socket.join(chatId);

                await ChatRepository.getOrCreate(chatId, {
                    visitorName: data?.visitorName,
                    visitorEmail: data?.visitorEmail,
                    pageUrl: data?.pageUrl,
                    userAgent: data?.userAgent
                });

                const chat = await ChatRepository.getChatWithMessages(chatId);
                io.to('admin_room').emit('chat_updated', chat);
                socket.emit('chat_joined', { chatId, chat });
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

        socket.on('send_message', async (data) => {
            try {
                const { chatId, sender } = data || {};
                const message = sanitizeMessage(data?.message);

                if (!chatId || !sender || !message) return;

                const isAdminSender = sender === 'admin';
                if (isAdminSender && !socket.isAdmin) {
                    socket.emit('chat_error', { message: 'Unauthorized' });
                    return;
                }

                const chat = await ChatRepository.getByExternalId(chatId);
                if (!chat) {
                    socket.emit('chat_error', { message: 'Chat not found' });
                    return;
                }

                if (chat.status !== 'open') {
                    socket.emit('chat_error', { message: 'This chat is closed' });
                    return;
                }

                const msg = await ChatRepository.addMessage(chatId, sender, message);
                const updatedChat = await ChatRepository.getChatWithMessages(chatId);

                io.to(chatId).emit('new_message', { chatId, msg });
                io.to('admin_room').emit('chat_updated', updatedChat);
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
                const { chatId } = data || {};
                if (!chatId) return;

                await ChatRepository.updateStatus(chatId, 'closed');
                const updatedChat = await ChatRepository.getChatWithMessages(chatId);
                io.to('admin_room').emit('chat_updated', updatedChat);
                io.to(chatId).emit('chat_closed', { chatId });
            } catch (err) {
                logger.error({ event: 'close_chat_error', error: err.message }, 'close_chat failed');
                socket.emit('chat_error', { message: 'Failed to close chat' });
            }
        });

        socket.on('disconnect', () => {
            logger.info({ event: 'chat_disconnected', socketId: socket.id }, 'Chat client disconnected');
        });
    });
}

async function setupRedisAdapter(io) {
    if (!process.env.REDIS_URL) return;

    try {
        const { createAdapter } = require('@socket.io/redis-adapter');
        const Redis = require('ioredis');
        const pubClient = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
        const subClient = pubClient.duplicate();

        io.adapter(createAdapter(pubClient, subClient));
        logger.info({ event: 'socket_redis_adapter_ok' }, 'Socket.io Redis adapter connected');
    } catch (err) {
        logger.warn({ event: 'socket_redis_adapter_failed', error: err.message }, 'Redis adapter unavailable, using in-memory adapter');
    }
}

module.exports = { initChatSocket, setupRedisAdapter };
