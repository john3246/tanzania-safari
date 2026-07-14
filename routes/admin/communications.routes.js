const express = require('express');
const router = express.Router();
const CommunicationsController = require('../../controllers/admin/CommunicationsController');
const { verifyAdmin } = require('../../middleware/verifyAdmin');

// Use auth middleware on all routes
router.use(verifyAdmin);

router.post('/send', CommunicationsController.sendBroadcast);

module.exports = router;
