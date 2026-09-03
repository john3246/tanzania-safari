const jwt = require('jsonwebtoken');
const xss = require('xss');
const ChatRepository = require('../repositories/ChatRepository');
const { getJwtSecret } = require('../middleware/auth.middleware');
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

/** Emit to everyone in the chat room except the sender, plus any tracked visitor sockets. */
function emitToOthersInChat(io, socket, chatId, event, payload) {
    socket.to(chatId).emit(event, payload);
    const sockets = visitorSockets.get(chatId);
    if (sockets) {
        for (const sid of sockets) {
            if (sid !== socket.id) io.to(sid).emit(event, payload);
        }
    }
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
    let decoded;
    try {
        decoded = jwt.verify(token, getJwtSecret());
    } catch (err) {
        logger.warn({ event: 'chat_admin_jwt_invalid', error: err.message });
        return null;
    }

    const targetId = decoded.userId || decoded.id || decoded.sub;
    const tokenRole = decoded.role || '';

    try {
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
    } catch (err) {
        logger.warn({ event: 'chat_admin_db_verify_failed', error: err.message });
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

function notifyNewLiveChatSession({ chatId, visitorName, visitorEmail, pageUrl }) {
    const name = visitorName || 'Visitor';
    try {
        const { notifyAdmins } = require('../services/adminEvents');
        notifyAdmins({
            type: 'chat',
            title: 'New live chat',
            message: `${name} started a live chat`,
            relatedId: chatId,
            actionUrl: '/admin/chat'
        }).catch((err) => {
            logger.warn({ event: 'chat_notify_admins_failed', error: err.message });
        });
    } catch (err) {
        logger.warn({ event: 'chat_notify_admins_failed', error: err.message });
    }

    try {
        const emailService = require('../services/email');
        if (typeof emailService.sendAdminChatNotification === 'function') {
            emailService.sendAdminChatNotification({
                visitor_name: name,
                visitor_email: visitorEmail || '',
                page_url: pageUrl || '',
                chat_id: chatId
            }).catch((err) => {
                logger.warn({ event: 'chat_email_failed', error: err.message }, 'Live chat admin email failed');
            });
        }
    } catch (err) {
        logger.warn({ event: 'chat_email_failed', error: err.message }, 'Live chat admin email failed');
    }
}

function initChatSocket(io) {
    // Expose for booking/enquiry notifications
    global.__chatIo = io;

    io.use(async (socket, next) => {
        const role = socket.handshake.auth?.role || socket.handshake.query?.role;
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (role === 'admin') {
            const admin = await verifyAdminToken(token);
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
                const requestedId = (data && data.chatId) ? String(data.chatId) : socket.id;
                const session = await ChatRepository.joinVisitorSession(requestedId, {
                    visitorName: data?.visitorName,
                    visitorEmail: data?.visitorEmail,
                    pageUrl: data?.pageUrl,
                    userAgent: data?.userAgent
                });
                const chatId = session.externalId;

                if (socket.chatId && socket.chatId !== chatId) {
                    socket.leave(socket.chatId);
                    untrackVisitor(socket.chatId, socket.id);
                }

                socket.chatId = chatId;
                socket.join(chatId);
                trackVisitor(chatId, socket.id);

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

                if (session.created) {
                    notifyNewLiveChatSession({
                        chatId,
                        visitorName: data?.visitorName,
                        visitorEmail: data?.visitorEmail,
                        pageUrl: data?.pageUrl
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
        socket.on('admin_open_chat', async (data) => {
            if (!socket.isAdmin) return;
            const chatId = data?.chatId ? String(data.chatId) : null;
            if (!chatId) return;
            if (socket.activeChatId && socket.activeChatId !== chatId) {
                socket.leave(socket.activeChatId);
            }
            socket.activeChatId = chatId;
            socket.join(chatId);

            try {
                const fullChat = await ChatRepository.getChatWithMessages(chatId);
                if (fullChat) socket.emit('chat_updated', fullChat);
            } catch (err) {
                logger.warn({ event: 'admin_open_chat_error', error: err.message });
            }
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
                const payload = { chatId, msg };
                const listTouch = {
                    chatId,
                    updatedAt: updatedChat?.updatedAt,
                    preview: msg.message,
                    visitorName: updatedChat?.visitorName,
                    visitorEmail: updatedChat?.visitorEmail,
                    status: updatedChat?.status
                };

                // Deliver to the other party (never echo new_message back to sender)
                emitToOthersInChat(io, socket, chatId, 'new_message', payload);

                // Confirm to sender so optimistic UI can settle without a full re-render
                socket.emit('message_ack', payload);

                if (isAdminSender) {
                    socket.emit('chat_list_touch', listTouch);
                    socket.to('admin_room').emit('new_message', payload);
                    socket.to('admin_room').emit('chat_list_touch', listTouch);
                } else {
                    io.to('admin_room').emit('new_message', payload);
                    io.to('admin_room').emit('chat_list_touch', listTouch);
                    io.to('admin_room').emit('admin_notification', {
                        type: 'chat',
                        title: 'New chat message',
                        message: `${updatedChat?.visitorName || 'Visitor'}: ${message.slice(0, 80)}`,
                        relatedId: chatId,
                        actionUrl: '/admin/chat'
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
