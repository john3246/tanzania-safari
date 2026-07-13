const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyAdmin } = require('../middleware/auth.middleware');
const authController = require('../controllers/admin/AuthController');
const { requireAuth } = require('../middleware/authMiddleware');

// ── Authentication ────────────────────────────────────────────
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify', requireAuth, authController.verify);

// ── CMS Sub-Routes ───────────────────────────────────────────
router.use('/users',           require('./admin/users.routes'));
router.use('/roles',           require('./admin/roles.routes'));
router.use('/permissions',     require('./admin/permissions.routes'));
router.use('/tour-categories', require('./admin/tour-categories.routes'));
router.use('/destinations',    require('./admin/destinations.routes'));
router.use('/tours',           require('./admin/tours.routes'));
router.use('/media',           require('./admin/media.routes'));

// ── Legacy Sub-Routes ─────────────────────────────────────────
router.use('/packages',     require('./admin/package.admin.routes'));
router.use('/destinations', require('./admin/destination.admin.routes'));
router.use('/bookings',     require('./admin/booking.admin.routes'));
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