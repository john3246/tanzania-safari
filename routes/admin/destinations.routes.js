const express = require('express');
const router = express.Router();
const destinationController = require('../../controllers/admin/DestinationController');
const authenticate = require('../../middleware/verifyAdmin');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

// Flexible Validation schemas
const createDestinationSchema = z.object({
    name: z.string(),
    slug: z.string().optional(),
    short_description: z.string().optional(),
    description: z.string().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    featured_image_url: z.string().optional(),
    gallery_urls: z.array(z.string()).optional(),
    is_featured: z.boolean().optional(),
    is_active: z.boolean().optional(),
    display_order: z.number().optional(),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.string().optional()
});

const updateDestinationSchema = z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    short_description: z.string().optional(),
    description: z.string().optional(),
    country: z.string().optional(),
    region: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    featured_image_url: z.string().optional(),
    gallery_urls: z.array(z.string()).optional(),
    is_featured: z.boolean().optional(),
    is_active: z.boolean().optional(),
    display_order: z.number().optional(),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.string().optional()
});

// All routes require authentication
router.use(authenticate);

// GET /api/admin/destinations - List destinations with pagination, search, filter
router.get('/', requirePermission('destinations.view'), destinationController.list);

// GET /api/admin/destinations/active - Get active destinations
router.get('/active', requirePermission('destinations.view'), destinationController.getActive);

// GET /api/admin/destinations/featured - Get featured destinations
router.get('/featured', requirePermission('destinations.view'), destinationController.getFeatured);

// GET /api/admin/destinations/regions - Get all regions
router.get('/regions', requirePermission('destinations.view'), destinationController.getRegions);

// GET /api/admin/destinations/region/:region - Get destinations by region
router.get('/region/:region', requirePermission('destinations.view'), destinationController.getByRegion);

// POST /api/admin/destinations - Create destination
router.post('/', requirePermission('destinations.create'), validate(createDestinationSchema), destinationController.create);

// GET /api/admin/destinations/:id - Get destination by ID
router.get('/:id', requirePermission('destinations.view'), destinationController.getById);

// GET /api/admin/destinations/slug/:slug - Get destination by slug
router.get('/slug/:slug', requirePermission('destinations.view'), destinationController.getBySlug);

// PUT /api/admin/destinations/:id - Update destination
router.put('/:id', requirePermission('destinations.edit'), validate(updateDestinationSchema), destinationController.update);

// PATCH /api/admin/destinations/:id/publish - Quick publish toggle
router.patch('/:id/publish', requirePermission('destinations.edit'), destinationController.togglePublish);

// DELETE /api/admin/destinations/:id - Permanent delete destination
router.delete('/:id', requirePermission('destinations.delete'), destinationController.delete);

// POST /api/admin/destinations/:id/restore - Restore deleted destination
router.post('/:id/restore', requirePermission('destinations.delete'), destinationController.restore);

module.exports = router;
