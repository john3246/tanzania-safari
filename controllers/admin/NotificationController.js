const NotificationRepository = require('../../repositories/NotificationRepository');

const NotificationController = {
    async list(req, res) {
        try {
            const data = await NotificationRepository.listRecent(50);
            const unread = await NotificationRepository.unreadCount();
            res.json({ success: true, data, unread });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async unreadCount(req, res) {
        try {
            const count = await NotificationRepository.unreadCount();
            res.json({ success: true, count });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async markRead(req, res) {
        try {
            await NotificationRepository.markRead(req.params.id);
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async markAllRead(req, res) {
        try {
            await NotificationRepository.markAllRead();
            res.json({ success: true });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = NotificationController;
