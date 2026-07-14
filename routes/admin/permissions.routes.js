const express = require('express');
const router = express.Router();
const permissionController = require('../../controllers/admin/PermissionController');

// FIX: Import the default export from verifyAdmin.js (Source 7)
const authenticate = require('../../middleware/verifyAdmin'); 

// FIX: Import the named export from rbacMiddleware.js (Source 4)
const { requirePermission } = require('../../middleware/rbacMiddleware'); 

const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

// Validation schemas
const createPermissionSchema = z.object({
    name: z.string().min(3).max(100),
    description: z.string().optional()
});

const updatePermissionSchema = z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().optional()
});

// All routes require authentication
router.use(authenticate);

// GET /api/admin/permissions - List permissions with pagination, search
router.get('/', requirePermission('permissions.view'), permissionController.list);

// GET /api/admin/permissions/grouped - Get permissions grouped by prefix
router.get('/grouped', requirePermission('permissions.view'), permissionController.getGrouped);

// POST /api/admin/permissions - Create permission
router.post('/', requirePermission('permissions.assign'), validate(createPermissionSchema), permissionController.create);

// GET /api/admin/permissions/:id - Get permission by ID
router.get('/:id', requirePermission('permissions.view'), permissionController.getById);

// PUT /api/admin/permissions/:id - Update permission
router.put('/:id', requirePermission('permissions.assign'), validate(updatePermissionSchema), permissionController.update);

// DELETE /api/admin/permissions/:id - Delete permission
router.delete('/:id', requirePermission('permissions.assign'), permissionController.delete);

// GET /api/admin/permissions/role/:roleId - Get permissions by role
router.get('/role/:roleId', requirePermission('permissions.view'), permissionController.getByRole);

module.exports = router;