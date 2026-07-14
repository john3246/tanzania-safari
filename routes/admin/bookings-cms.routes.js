const express = require('express');
const router = express.Router();
const bookingCMSController = require('../../controllers/admin/BookingCMSController');
const authenticate = require('../../middleware/verifyAdmin');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

// Validation schemas
const createBookingSchema = z.object({
    user_id: z.number(),
    tour_id: z.number(),
    number_of_travelers: z.number().min(1),
    travel_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    special_requests: z.string().optional(),
    total_amount: z.number().positive()
});

const updateBookingSchema = z.object({
    number_of_travelers: z.number().min(1).optional(),
    travel_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    special_requests: z.string().optional(),
    total_amount: z.number().positive().optional()
});

const updateStatusSchema = z.object({
    statusId: z.number()
});

// All routes require authentication
router.use(authenticate);

// GET /api/admin/bookings-cms - List bookings with pagination, search, filters
router.get('/', requirePermission('bookings.view'), bookingCMSController.list);

// GET /api/admin/bookings-cms/stats - Get booking statistics
router.get('/stats', requirePermission('bookings.view'), bookingCMSController.getStats);

// GET /api/admin/bookings-cms/revenue/:year - Get revenue by month
router.get('/revenue/:year', requirePermission('bookings.view'), bookingCMSController.getRevenueByMonth);

// GET /api/admin/bookings-cms/top-tours - Get top tours by bookings
router.get('/top-tours', requirePermission('bookings.view'), bookingCMSController.getTopTours);

// GET /api/admin/bookings-cms/status/:statusId - Get bookings by status
router.get('/status/:statusId', requirePermission('bookings.view'), bookingCMSController.getByStatus);

// GET /api/admin/bookings-cms/tour/:tourId - Get bookings by tour
router.get('/tour/:tourId', requirePermission('bookings.view'), bookingCMSController.getByTour);

// GET /api/admin/bookings-cms/user/:userId - Get bookings by user
router.get('/user/:userId', requirePermission('bookings.view'), bookingCMSController.getByUser);

// GET /api/admin/bookings-cms/date-range - Get bookings by date range
router.get('/date-range', requirePermission('bookings.view'), bookingCMSController.getByDateRange);

// POST /api/admin/bookings-cms - Create booking
router.post('/', requirePermission('bookings.create'), validate(createBookingSchema), bookingCMSController.create);

// GET /api/admin/bookings-cms/:id - Get booking by ID
router.get('/:id', requirePermission('bookings.view'), bookingCMSController.getById);

// GET /api/admin/bookings-cms/reference/:reference - Get booking by reference
router.get('/reference/:reference', requirePermission('bookings.view'), bookingCMSController.getByReference);

// PUT /api/admin/bookings-cms/:id - Update booking
router.put('/:id', requirePermission('bookings.edit'), validate(updateBookingSchema), bookingCMSController.update);

// PUT /api/admin/bookings-cms/:id/status - Update booking status
router.put('/:id/status', requirePermission('bookings.edit'), validate(updateStatusSchema), bookingCMSController.updateStatus);

// DELETE /api/admin/bookings-cms/:id - Soft delete booking
router.delete('/:id', requirePermission('bookings.delete'), bookingCMSController.delete);

// POST /api/admin/bookings-cms/:id/restore - Restore deleted booking
router.post('/:id/restore', requirePermission('bookings.delete'), bookingCMSController.restore);

module.exports = router;
