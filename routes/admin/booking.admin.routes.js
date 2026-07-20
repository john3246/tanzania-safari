const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/admin/BookingController');
const authenticate = require('../../middleware/verifyAdmin');
const { requirePermission } = require('../../middleware/rbacMiddleware');

router.use(authenticate);

router.get('/', bookingController.list);
router.get('/:id', requirePermission('bookings.view'), bookingController.getBooking);
router.put('/:id/status', requirePermission('bookings.edit'), bookingController.updateStatus);
router.post('/:id/reply', requirePermission('bookings.edit'), bookingController.replyToBooking);
router.post('/:id/payments', requirePermission('bookings.edit'), bookingController.logPayment);
router.post('/:id/notes', requirePermission('bookings.view'), bookingController.addNote);

module.exports = router;
