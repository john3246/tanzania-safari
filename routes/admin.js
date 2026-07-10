const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyAdmin } = require('../middleware/auth.middleware');

// ── Authentication ────────────────────────────────────────────
router.post('/login', adminController.login);
router.get('/verify', verifyAdmin, adminController.verify);

// ── Sub-Routes ────────────────────────────────────────────────
router.use('/packages',     require('./admin/package.admin.routes'));
router.use('/destinations', require('./admin/destination.admin.routes'));
router.use('/bookings',     require('./admin/booking.admin.routes'));
router.use('/users',        require('./admin/user.admin.routes'));
router.use('/categories',   require('./admin/category.admin.routes'));
router.use('/blog',         require('./admin/blog.admin.routes'));
router.use('/settings',     require('./admin/settings.admin.routes'));

// ── Stats ─────────────────────────────────────────────────────
router.get('/stats', verifyAdmin, adminController.getStats);

// ── Shared Management ─────────────────────────────────────────
router.put('/profile', verifyAdmin, adminController.updateProfile);
router.get('/enquiries', verifyAdmin, adminController.getEnquiries);
router.put('/enquiries/:id/respond', verifyAdmin, adminController.respondEnquiry);
router.get('/reviews', verifyAdmin, adminController.getReviews);
router.put('/reviews/:id/approve', verifyAdmin, adminController.approveReview);

module.exports = router;