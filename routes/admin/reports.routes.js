const express = require('express');
const router = express.Router();
const reportsController = require('../../controllers/admin/ReportsController');
const authenticate = require('../../middleware/verifyAdmin');
const { requirePermission } = require('../../middleware/rbacMiddleware');

// All routes require authentication
router.use(authenticate);

// GET /api/admin/reports/bookings - Get bookings report
router.get('/bookings', requirePermission('reports.view'), reportsController.getBookingsReport);

// GET /api/admin/reports/tours - Get tours report
router.get('/tours', requirePermission('reports.view'), reportsController.getToursReport);

// GET /api/admin/reports/customers - Get customers report
router.get('/customers', requirePermission('reports.view'), reportsController.getCustomersReport);

// GET /api/admin/reports/email-stats - Get email statistics report
router.get('/email-stats', requirePermission('reports.view'), reportsController.getEmailStatsReport);

// GET /api/admin/reports/email-stats/summary - Get email statistics summary
router.get('/email-stats/summary', requirePermission('reports.view'), reportsController.getEmailStatsSummary);

// GET /api/admin/reports/revenue - Get revenue report
router.get('/revenue', requirePermission('reports.view'), reportsController.getRevenueReport);

// GET /api/admin/reports/dashboard - Get dashboard statistics
router.get('/dashboard', requirePermission('reports.view'), reportsController.getDashboardStats);

module.exports = router;
