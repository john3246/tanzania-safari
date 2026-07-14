const express = require('express');
const router = express.Router();
const auditLogController = require('../../controllers/admin/AuditLogController');
const authenticate = require('../../middleware/verifyAdmin');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

// Validation schemas
const createLogSchema = z.object({
    actor_id: z.number(),
    action: z.enum(['create', 'update', 'delete', 'view', 'login', 'logout', 'export', 'import', 'publish', 'archive']),
    entity_type: z.string(),
    entity_id: z.number().optional(),
    description: z.string().optional(),
    severity: z.enum(['low', 'medium', 'high']).optional(),
    ip_address: z.string().ip().optional(),
    user_agent: z.string().optional(),
    metadata: z.any().optional()
});

// All routes require authentication
router.use(authenticate);

// GET /api/admin/audit-logs - List audit logs with pagination, search, filters
router.get('/', requirePermission('audit_logs.view'), auditLogController.list);

// GET /api/admin/audit-logs/recent - Get recent logs
router.get('/recent', requirePermission('audit_logs.view'), auditLogController.getRecent);

// GET /api/admin/audit-logs/stats - Get log statistics
router.get('/stats', requirePermission('audit_logs.view'), auditLogController.getStats);

// GET /api/admin/audit-logs/by-entity-type - Get logs by entity type
router.get('/by-entity-type', requirePermission('audit_logs.view'), auditLogController.getByEntityType);

// GET /api/admin/audit-logs/by-action - Get logs by action
router.get('/by-action', requirePermission('audit_logs.view'), auditLogController.getByActionStats);

// GET /api/admin/audit-logs/entity/:entityType/:entityId - Get logs by entity
router.get('/entity/:entityType/:entityId', requirePermission('audit_logs.view'), auditLogController.getByEntity);

// GET /api/admin/audit-logs/actor/:actorId - Get logs by actor
router.get('/actor/:actorId', requirePermission('audit_logs.view'), auditLogController.getByActor);

// GET /api/admin/audit-logs/action/:action - Get logs by action
router.get('/action/:action', requirePermission('audit_logs.view'), auditLogController.getByAction);

// GET /api/admin/audit-logs/date-range - Get logs by date range
router.get('/date-range', requirePermission('audit_logs.view'), auditLogController.getByDateRange);

// GET /api/admin/audit-logs/:id - Get audit log by ID
router.get('/:id', requirePermission('audit_logs.view'), auditLogController.getById);

// POST /api/admin/audit-logs - Create audit log (typically called internally)
router.post('/', requirePermission('audit_logs.view'), validate(createLogSchema), auditLogController.create);

module.exports = router;
