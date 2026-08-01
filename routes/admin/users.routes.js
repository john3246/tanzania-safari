const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/UserController');
const userService = require('../../services/UserService');

// FIX: Import the default export from verifyAdmin.js (Source 7)
const authenticate = require('../../middleware/verifyAdmin'); 

// FIX: Import the named export from rbacMiddleware.js (Source 4)
const { requirePermission } = require('../../middleware/rbacMiddleware'); 

const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

// Validation schemas
const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().max(100).optional(),
    phone: z.string().max(40).optional(),
    role_id: z.coerce.number().optional(),
    username: z.string().min(3).max(100).optional()
});

const updateUserSchema = z.object({
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().max(100).optional(),
    phone: z.string().max(40).optional(),
    role_id: z.coerce.number().optional(),
    is_active: z.union([z.boolean(), z.string()]).optional(),
    username: z.string().min(3).max(100).optional()
});

// All routes require authentication
router.use(authenticate);

// GET /api/admin/users - List users with pagination, search, filter
router.get('/', requirePermission('users.view'), userController.list);

// GET /api/admin/users/roles - List roles for user form
router.get('/roles', requirePermission('users.view'), async (req, res) => {
    try {
        const roles = await userService.listRoles();
        res.json({ success: true, data: roles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

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