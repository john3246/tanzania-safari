const express = require('express');
const router = express.Router();
const ChatController = require('../../controllers/admin/ChatController');
const verifyAdmin = require('../../middleware/verifyAdmin');

router.use(verifyAdmin);

router.get('/', ChatController.listChats);
router.get('/:id/messages', ChatController.getMessages);
router.patch('/:id', ChatController.updateChat);

module.exports = router;
