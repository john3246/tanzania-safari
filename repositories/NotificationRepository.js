const db = require('../config/db');

class NotificationRepository {
    async create({ type, title, message, relatedId = null, actionUrl = null, userId = null }) {
        try {
            const result = await db.query(
                `INSERT INTO notifications
                    (notification_id, user_id, notification_type, notification_title, notification_message, related_entity_id, action_url, is_read, sent_at)
                 VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, false, NOW())
                 RETURNING *`,
                [userId, type, title, message, relatedId, actionUrl]
            );
            return this.map(result.rows[0]);
        } catch (err) {
            // Fallback without gen_random_uuid if uuid_generate_v4 is the default
            const result = await db.query(
                `INSERT INTO notifications
                    (user_id, notification_type, notification_title, notification_message, related_entity_id, action_url, is_read, sent_at)
                 VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
                 RETURNING *`,
                [userId, type, title, message, relatedId, actionUrl]
            );
            return this.map(result.rows[0]);
        }
    }

    map(row) {
        if (!row) return null;
        return {
            id: row.notification_id,
            type: row.notification_type,
            title: row.notification_title,
            message: row.notification_message,
            relatedId: row.related_entity_id,
            actionUrl: row.action_url,
            isRead: row.is_read,
            createdAt: row.sent_at
        };
    }

    async listUnread(limit = 30) {
        const result = await db.query(
            `SELECT * FROM notifications
             WHERE is_read = false
             ORDER BY sent_at DESC
             LIMIT $1`,
            [limit]
        );
        return result.rows.map(r => this.map(r));
    }

    async listRecent(limit = 40) {
        const result = await db.query(
            `SELECT * FROM notifications
             ORDER BY sent_at DESC
             LIMIT $1`,
            [limit]
        );
        return result.rows.map(r => this.map(r));
    }

    async unreadCount() {
        const result = await db.query(
            `SELECT COUNT(*)::int AS count FROM notifications WHERE is_read = false`
        );
        return result.rows[0].count;
    }

    async markRead(id) {
        await db.query(
            `UPDATE notifications SET is_read = true WHERE notification_id = $1`,
            [id]
        );
    }

    async markAllRead() {
        await db.query(`UPDATE notifications SET is_read = true WHERE is_read = false`);
    }
}

module.exports = new NotificationRepository();
