const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/admin/BookingController');
const { requireAuth } = require('../../middleware/authMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');

router.use(requireAuth);

router.get('/', bookingController.list);
router.put('/:id/status', requirePermission('booking.confirm'), bookingController.updateStatus);

module.exports = router;
