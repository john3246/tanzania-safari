const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/admin/RoleController');
const { authenticate, requirePermission } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

// Validation schemas
const createRoleSchema = z.object({
    name: z.string().min(2).max(50),
    description: z.string().optional()
});

const updateRoleSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    description: z.string().optional()
});

const assignPermissionSchema = z.object({
    permissionId: z.number()
});

const setPermissionsSchema = z.object({
    permissionIds: z.array(z.number())
});

// All routes require authentication
router.use(authenticate);

// GET /api/admin/roles - List roles with pagination, search
router.get('/', requirePermission('roles.view'), roleController.list);

// POST /api/admin/roles - Create role
router.post('/', requirePermission('roles.create'), validate(createRoleSchema), roleController.create);

// GET /api/admin/roles/:id - Get role by ID
router.get('/:id', requirePermission('roles.view'), roleController.getById);

// PUT /api/admin/roles/:id - Update role
router.put('/:id', requirePermission('roles.edit'), validate(updateRoleSchema), roleController.update);

// DELETE /api/admin/roles/:id - Delete role
router.delete('/:id', requirePermission('roles.delete'), roleController.delete);

// GET /api/admin/roles/:id/permissions - Get role permissions
router.get('/:id/permissions', requirePermission('roles.view'), roleController.getPermissions);

// POST /api/admin/roles/:id/permissions - Assign permission to role
router.post('/:id/permissions', requirePermission('permissions.assign'), validate(assignPermissionSchema), roleController.assignPermission);

// DELETE /api/admin/roles/:id/permissions/:permissionId - Remove permission from role
router.delete('/:id/permissions/:permissionId', requirePermission('permissions.assign'), roleController.removePermission);

// PUT /api/admin/roles/:id/permissions - Set all permissions for role
router.put('/:id/permissions', requirePermission('permissions.assign'), validate(setPermissionsSchema), roleController.setPermissions);

module.exports = router;
