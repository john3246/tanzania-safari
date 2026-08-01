const express = require('express');
const router = express.Router();
const CommunicationsController = require('../../controllers/admin/CommunicationsController');
const verifyAdmin = require('../../middleware/verifyAdmin');

router.use(verifyAdmin);

router.post('/send', CommunicationsController.sendBroadcast.bind(CommunicationsController));
router.get('/subscribers', CommunicationsController.listSubscribers.bind(CommunicationsController));
router.get('/campaigns', CommunicationsController.listCampaigns.bind(CommunicationsController));
router.post('/preview', CommunicationsController.previewCampaign.bind(CommunicationsController));
router.get('/content-options', CommunicationsController.contentOptions.bind(CommunicationsController));

module.exports = router;
