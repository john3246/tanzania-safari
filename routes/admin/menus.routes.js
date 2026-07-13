const express = require('express');
const router = express.Router();
const menuController = require('../../controllers/admin/MenuController');
const { authenticate, requirePermission } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

// Validation schemas
const createMenuSchema = z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
    description: z.string().optional(),
    location: z.enum(['header', 'footer', 'sidebar', 'mobile']).optional(),
    display_order: z.number().optional(),
    is_active: z.boolean().optional()
});

const updateMenuSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().optional(),
    location: z.enum(['header', 'footer', 'sidebar', 'mobile']).optional(),
    display_order: z.number().optional(),
    is_active: z.boolean().optional()
});

const createMenuItemSchema = z.object({
    parent_id: z.number().optional(),
    title: z.string().min(1).max(100),
    url: z.string().url().optional(),
    link_page_id: z.number().optional(),
    display_order: z.number().optional(),
    is_active: z.boolean().optional(),
    icon: z.string().max(50).optional(),
    css_class: z.string().max(100).optional(),
    target: z.enum(['_self', '_blank', '_parent', '_top']).optional()
});

const updateMenuItemSchema = z.object({
    parent_id: z.number().optional(),
    title: z.string().min(1).max(100).optional(),
    url: z.string().url().optional(),
    link_page_id: z.number().optional(),
    display_order: z.number().optional(),
    is_active: z.boolean().optional(),
    icon: z.string().max(50).optional(),
    css_class: z.string().max(100).optional(),
    target: z.enum(['_self', '_blank', '_parent', '_top']).optional()
});

const reorderItemsSchema = z.object({
    items: z.array(z.object({
        id: z.number(),
        parent_id: z.number().nullable().optional(),
        display_order: z.number()
    }))
});

// All routes require authentication
router.use(authenticate);

// GET /api/admin/menus - List menus with pagination, search, filters
router.get('/', requirePermission('menus.view'), menuController.list);

// GET /api/admin/menus/active - Get active menus
router.get('/active', requirePermission('menus.view'), menuController.getActive);

// GET /api/admin/menus/location/:location - Get menus by location
router.get('/location/:location', requirePermission('menus.view'), menuController.getByLocation);

// POST /api/admin/menus - Create menu
router.post('/', requirePermission('menus.create'), validate(createMenuSchema), menuController.create);

// GET /api/admin/menus/:id - Get menu by ID with items
router.get('/:id', requirePermission('menus.view'), menuController.getById);

// GET /api/admin/menus/slug/:slug - Get menu by slug with items
router.get('/slug/:slug', requirePermission('menus.view'), menuController.getBySlug);

// PUT /api/admin/menus/:id - Update menu
router.put('/:id', requirePermission('menus.edit'), validate(updateMenuSchema), menuController.update);

// DELETE /api/admin/menus/:id - Soft delete menu
router.delete('/:id', requirePermission('menus.delete'), menuController.delete);

// POST /api/admin/menus/:id/restore - Restore deleted menu
router.post('/:id/restore', requirePermission('menus.delete'), menuController.restore);

// Menu Item routes
// POST /api/admin/menus/:id/items - Add menu item
router.post('/:id/items', requirePermission('menus.edit'), validate(createMenuItemSchema), menuController.addMenuItem);

// PUT /api/admin/menus/:id/items/:itemId - Update menu item
router.put('/:id/items/:itemId', requirePermission('menus.edit'), validate(updateMenuItemSchema), menuController.updateMenuItem);

// DELETE /api/admin/menus/:id/items/:itemId - Delete menu item
router.delete('/:id/items/:itemId', requirePermission('menus.delete'), menuController.deleteMenuItem);

// POST /api/admin/menus/:id/items/:itemId/restore - Restore deleted menu item
router.post('/:id/items/:itemId/restore', requirePermission('menus.delete'), menuController.restoreMenuItem);

// PUT /api/admin/menus/:id/items/reorder - Reorder menu items
router.put('/:id/items/reorder', requirePermission('menus.edit'), validate(reorderItemsSchema), menuController.reorderMenuItems);

module.exports = router;
