const express = require('express');
const router = express.Router();
const NotificationController = require('../../controllers/admin/NotificationController');
const verifyAdmin = require('../../middleware/verifyAdmin');

router.use(verifyAdmin);
router.get('/', NotificationController.list);
router.get('/unread-count', NotificationController.unreadCount);
router.post('/read-all', NotificationController.markAllRead);
router.post('/:id/read', NotificationController.markRead);

module.exports = router;
