const express = require('express');
const router = express.Router();
const tourCategoryController = require('../../controllers/admin/TourCategoryController');
const authenticate = require('../../middleware/verifyAdmin');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

// Validation schemas
const createCategorySchema = z.object({
    name: z.string().min(2).max(255),
    slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/),
    description: z.string().optional(),
    icon: z.string().max(100).optional(),
    image_url: z.string().url().optional(),
    is_active: z.boolean().optional(),
    display_order: z.number().optional(),
    seo_title: z.string().max(255).optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.string().optional()
});

const updateCategorySchema = z.object({
    name: z.string().min(2).max(255).optional(),
    slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/).optional(),
    description: z.string().optional(),
    icon: z.string().max(100).optional(),
    image_url: z.string().url().optional(),
    is_active: z.boolean().optional(),
    display_order: z.number().optional(),
    seo_title: z.string().max(255).optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.string().optional()
});

// All routes require authentication
router.use(authenticate);

// GET /api/admin/tour-categories - List categories with pagination, search, filter
router.get('/', requirePermission('categories.view'), tourCategoryController.list);

// GET /api/admin/tour-categories/active - Get active categories
router.get('/active', requirePermission('categories.view'), tourCategoryController.getActive);

// GET /api/admin/tour-categories/featured - Get featured categories
router.get('/featured', requirePermission('categories.view'), tourCategoryController.getFeatured);

// POST /api/admin/tour-categories - Create category
router.post('/', requirePermission('categories.create'), validate(createCategorySchema), tourCategoryController.create);

// GET /api/admin/tour-categories/:id - Get category by ID
router.get('/:id', requirePermission('categories.view'), tourCategoryController.getById);

// GET /api/admin/tour-categories/slug/:slug - Get category by slug
router.get('/slug/:slug', requirePermission('categories.view'), tourCategoryController.getBySlug);

// PUT /api/admin/tour-categories/:id - Update category
router.put('/:id', requirePermission('categories.edit'), validate(updateCategorySchema), tourCategoryController.update);

// DELETE /api/admin/tour-categories/:id - Soft delete category
router.delete('/:id', requirePermission('categories.delete'), tourCategoryController.delete);

// POST /api/admin/tour-categories/:id/restore - Restore deleted category
router.post('/:id/restore', requirePermission('categories.delete'), tourCategoryController.restore);

module.exports = router;
