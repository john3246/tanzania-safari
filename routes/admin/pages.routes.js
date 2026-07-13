const express = require('express');
const router = express.Router();
const pageController = require('../../controllers/admin/PageController');
const { authenticate, requirePermission } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

// Validation schemas
const createPageSchema = z.object({
    title: z.string().min(5).max(255),
    slug: z.string().min(5).max(255).regex(/^[a-z0-9-]+$/),
    content: z.string().optional(),
    excerpt: z.string().max(500).optional(),
    template: z.enum(['default', 'hero', 'about', 'contact', 'faq', 'privacy', 'terms']).optional(),
    parent_id: z.number().optional(),
    display_order: z.number().optional(),
    is_homepage: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    featured_image_url: z.string().url().optional(),
    seo_title: z.string().max(255).optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.string().optional(),
    meta_robots: z.string().optional(),
    canonical_url: z.string().url().optional(),
    og_title: z.string().max(255).optional(),
    og_description: z.string().optional(),
    og_image_url: z.string().url().optional()
});

const updatePageSchema = z.object({
    title: z.string().min(5).max(255).optional(),
    slug: z.string().min(5).max(255).regex(/^[a-z0-9-]+$/).optional(),
    content: z.string().optional(),
    excerpt: z.string().max(500).optional(),
    template: z.enum(['default', 'hero', 'about', 'contact', 'faq', 'privacy', 'terms']).optional(),
    parent_id: z.number().optional(),
    display_order: z.number().optional(),
    is_homepage: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    featured_image_url: z.string().url().optional(),
    seo_title: z.string().max(255).optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.string().optional(),
    meta_robots: z.string().optional(),
    canonical_url: z.string().url().optional(),
    og_title: z.string().max(255).optional(),
    og_description: z.string().optional(),
    og_image_url: z.string().url().optional()
});

// All routes require authentication
router.use(authenticate);

// GET /api/admin/pages - List pages with pagination, search, filters
router.get('/', requirePermission('pages.view'), pageController.list);

// GET /api/admin/pages/homepage - Get homepage
router.get('/homepage', requirePermission('pages.view'), pageController.getHomepage);

// GET /api/admin/pages/published - Get published pages
router.get('/published', requirePermission('pages.view'), pageController.getPublished);

// GET /api/admin/pages/tree - Get page tree
router.get('/tree', requirePermission('pages.view'), pageController.getTree);

// GET /api/admin/pages/parent/:parentId - Get pages by parent
router.get('/parent/:parentId', requirePermission('pages.view'), pageController.getByParent);

// GET /api/admin/pages/template/:template - Get pages by template
router.get('/template/:template', requirePermission('pages.view'), pageController.getByTemplate);

// POST /api/admin/pages - Create page
router.post('/', requirePermission('pages.create'), validate(createPageSchema), pageController.create);

// GET /api/admin/pages/:id - Get page by ID
router.get('/:id', requirePermission('pages.view'), pageController.getById);

// GET /api/admin/pages/slug/:slug - Get page by slug
router.get('/slug/:slug', requirePermission('pages.view'), pageController.getBySlug);

// PUT /api/admin/pages/:id - Update page
router.put('/:id', requirePermission('pages.edit'), validate(updatePageSchema), pageController.update);

// DELETE /api/admin/pages/:id - Soft delete page
router.delete('/:id', requirePermission('pages.delete'), pageController.delete);

// POST /api/admin/pages/:id/restore - Restore deleted page
router.post('/:id/restore', requirePermission('pages.delete'), pageController.restore);

// POST /api/admin/pages/:id/publish - Publish page
router.post('/:id/publish', requirePermission('pages.publish'), pageController.publish);

// POST /api/admin/pages/:id/homepage - Set as homepage
router.post('/:id/homepage', requirePermission('pages.edit'), pageController.setHomepage);

module.exports = router;
