const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyAdmin = require('../middleware/verifyAdmin');
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
// router.use('/tour-categories', require('./admin/tour-categories.routes'));
// router.use('/destinations',    require('./admin/destinations.routes'));
// router.use('/tours',           require('./admin/tours.routes'));
router.use('/media',           require('./admin/media.routes'));
router.use('/pages',           require('./admin/pages.routes'));
router.use('/menus',           require('./admin/menus.routes'));
router.use('/site-settings',   require('./admin/site-settings.routes'));
router.use('/audit-logs',      require('./admin/audit-logs.routes'));
router.use('/email-templates', require('./admin/email-templates.routes'));
router.use('/communications',  require('./admin/communications.routes'));
// router.use('/bookings-cms',    require('./admin/bookings-cms.routes'));
router.use('/reports',         require('./admin/reports.routes'));

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