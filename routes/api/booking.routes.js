const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/booking.controller');
const { verifyUser } = require('../../middleware/auth.middleware');

router.post('/', bookingController.createBooking);

module.exports = router;
