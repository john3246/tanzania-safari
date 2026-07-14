const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/admin/BookingController');
const authenticate = require('../../middleware/verifyAdmin');
const { requirePermission } = require('../../middleware/rbacMiddleware');

router.use(authenticate);

router.get('/', bookingController.list);
router.put('/:id/status', requirePermission('booking.confirm'), bookingController.updateStatus);

module.exports = router;
