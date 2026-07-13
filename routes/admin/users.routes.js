const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/UserController');
const { authenticate, requirePermission } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

// Validation schemas
const createUserSchema = z.object({
    username: z.string().min(3).max(100),
    email: z.string().email(),
    password: z.string().min(8),
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    role_id: z.number().optional()
});

const updateUserSchema = z.object({
    username: z.string().min(3).max(100).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    role_id: z.number().optional(),
    is_active: z.boolean().optional()
});

// All routes require authentication
router.use(authenticate);

// GET /api/admin/users - List users with pagination, search, filter
router.get('/', requirePermission('users.view'), userController.list);

// POST /api/admin/users - Create user
router.post('/', requirePermission('users.create'), validate(createUserSchema), userController.create);

// GET /api/admin/users/:id - Get user by ID
router.get('/:id', requirePermission('users.view'), userController.getById);

// PUT /api/admin/users/:id - Update user
router.put('/:id', requirePermission('users.edit'), validate(updateUserSchema), userController.update);

// DELETE /api/admin/users/:id - Soft delete user
router.delete('/:id', requirePermission('users.delete'), userController.delete);

// POST /api/admin/users/:id/restore - Restore deleted user
router.post('/:id/restore', requirePermission('users.delete'), userController.restore);

module.exports = router;
