const db = require('../config/db');

class ChatRepository {
    formatMessage(row) {
        return {
            id: row.id,
            sender: row.sender,
            message: row.message,
            timestamp: row.created_at
        };
    }

    formatChat(chatRow, messages = []) {
        return {
            id: chatRow.external_id,
            status: chatRow.status,
            visitorName: chatRow.visitor_name,
            visitorEmail: chatRow.visitor_email,
            pageUrl: chatRow.page_url,
            createdAt: chatRow.created_at,
            updatedAt: chatRow.updated_at,
            messages: messages.map(m => this.formatMessage(m))
        };
    }

    async getOrCreate(externalId, metadata = {}) {
        const existing = await db.query(
            'SELECT * FROM chats WHERE external_id = $1',
            [externalId]
        );
        if (existing.rows.length > 0) {
            return existing.rows[0];
        }

        const result = await db.query(
            `INSERT INTO chats (external_id, visitor_name, visitor_email, page_url, user_agent)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                externalId,
                metadata.visitorName || null,
                metadata.visitorEmail || null,
                metadata.pageUrl || null,
                metadata.userAgent || null
            ]
        );
        return result.rows[0];
    }

    async getByExternalId(externalId) {
        const result = await db.query(
            'SELECT * FROM chats WHERE external_id = $1',
            [externalId]
        );
        return result.rows[0] || null;
    }

    async getMessagesByExternalId(externalId) {
        const result = await db.query(
            `SELECT cm.* FROM chat_messages cm
             JOIN chats c ON c.id = cm.chat_id
             WHERE c.external_id = $1
             ORDER BY cm.created_at ASC`,
            [externalId]
        );
        return result.rows;
    }

    async getChatWithMessages(externalId) {
        const chat = await this.getByExternalId(externalId);
        if (!chat) return null;
        const messages = await this.getMessagesByExternalId(externalId);
        return this.formatChat(chat, messages);
    }

    async addMessage(externalId, sender, message) {
        const chat = await this.getOrCreate(externalId);
        const result = await db.query(
            `INSERT INTO chat_messages (chat_id, sender, message)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [chat.id, sender, message]
        );

        await db.query(
            'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [chat.id]
        );

        return this.formatMessage(result.rows[0]);
    }

    async getAllOpenChats() {
        const result = await db.query(
            `SELECT c.*,
                    (SELECT json_agg(
                        json_build_object(
                            'id', cm.id,
                            'sender', cm.sender,
                            'message', cm.message,
                            'timestamp', cm.created_at
                        ) ORDER BY cm.created_at ASC
                    )
                    FROM chat_messages cm WHERE cm.chat_id = c.id) AS messages
             FROM chats c
             WHERE c.status = 'open'
             ORDER BY c.updated_at DESC`
        );

        const chats = {};
        for (const row of result.rows) {
            chats[row.external_id] = this.formatChat(row, (row.messages || []).map(m => ({
                id: m.id,
                sender: m.sender,
                message: m.message,
                created_at: m.timestamp
            })));
        }
        return chats;
    }

    async updateStatus(externalId, status) {
        const result = await db.query(
            `UPDATE chats SET status = $2, updated_at = CURRENT_TIMESTAMP
             WHERE external_id = $1
             RETURNING *`,
            [externalId, status]
        );
        return result.rows[0] || null;
    }
}

module.exports = new ChatRepository();
