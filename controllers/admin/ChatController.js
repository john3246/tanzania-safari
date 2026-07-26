const ChatRepository = require('../../repositories/ChatRepository');

const ChatController = {
    async listChats(req, res) {
        try {
            const chats = await ChatRepository.getAllOpenChats();
            res.json({ success: true, data: Object.values(chats) });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async getMessages(req, res) {
        try {
            const chat = await ChatRepository.getChatWithMessages(req.params.id);
            if (!chat) {
                return res.status(404).json({ success: false, message: 'Chat not found' });
            }
            res.json({ success: true, data: chat });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    async updateChat(req, res) {
        try {
            const { status } = req.body;
            if (!['open', 'closed'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const updated = await ChatRepository.updateStatus(req.params.id, status);
            if (!updated) {
                return res.status(404).json({ success: false, message: 'Chat not found' });
            }

            const chat = await ChatRepository.getChatWithMessages(req.params.id);
            res.json({ success: true, data: chat });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

module.exports = ChatController;
