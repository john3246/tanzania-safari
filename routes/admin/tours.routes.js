const express = require('express');
const router = express.Router();
const tourCMSController = require('../../controllers/admin/TourCMSController');
const authenticate = require('../../middleware/verifyAdmin');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

// Validation schemas
const createTourSchema = z.object({
    title: z.string().min(5).max(255),
    slug: z.string().min(5).max(255).regex(/^[a-z0-9-]+$/),
    overview: z.string().optional(),
    description: z.string().optional(),
    price_usd: z.number().positive(),
    duration_days: z.number().positive(),
    duration_nights: z.number().optional(),
    category_id: z.number().optional(),
    destination_id: z.number().optional(),
    difficulty: z.enum(['Easy', 'Moderate', 'Challenging', 'Extreme']).optional(),
    group_size_min: z.number().min(1).optional(),
    group_size_max: z.number().optional(),
    age_minimum: z.number().optional(),
    highlights: z.array(z.string()).optional(),
    included: z.array(z.string()).optional(),
    excluded: z.array(z.string()).optional(),
    travel_tips: z.array(z.string()).optional(),
    itinerary: z.array(z.object({
        day: z.number(),
        title: z.string(),
        description: z.string()
    })).optional(),
    faqs: z.array(z.object({
        question: z.string(),
        answer: z.string()
    })).optional(),
    featured_image_url: z.string().url().optional(),
    gallery_urls: z.array(z.string().url()).optional(),
    gallery_order: z.array(z.number()).optional(),
    is_featured: z.boolean().optional(),
    is_active: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    seo_title: z.string().max(255).optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.string().optional(),
    meta_robots: z.string().optional(),
    canonical_url: z.string().url().optional(),
    og_title: z.string().max(255).optional(),
    og_description: z.string().optional(),
    og_image_url: z.string().url().optional()
});

const updateTourSchema = z.object({
    title: z.string().min(5).max(255).optional(),
    slug: z.string().min(5).max(255).regex(/^[a-z0-9-]+$/).optional(),
    overview: z.string().optional(),
    description: z.string().optional(),
    price_usd: z.number().positive().optional(),
    duration_days: z.number().positive().optional(),
    duration_nights: z.number().optional(),
    category_id: z.number().optional(),
    destination_id: z.number().optional(),
    difficulty: z.enum(['Easy', 'Moderate', 'Challenging', 'Extreme']).optional(),
    group_size_min: z.number().min(1).optional(),
    group_size_max: z.number().optional(),
    age_minimum: z.number().optional(),
    highlights: z.array(z.string()).optional(),
    included: z.array(z.string()).optional(),
    excluded: z.array(z.string()).optional(),
    travel_tips: z.array(z.string()).optional(),
    itinerary: z.array(z.object({
        day: z.number(),
        title: z.string(),
        description: z.string()
    })).optional(),
    faqs: z.array(z.object({
        question: z.string(),
        answer: z.string()
    })).optional(),
    featured_image_url: z.string().url().optional(),
    gallery_urls: z.array(z.string().url()).optional(),
    gallery_order: z.array(z.number()).optional(),
    is_featured: z.boolean().optional(),
    is_active: z.boolean().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    seo_title: z.string().max(255).optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.string().optional(),
    meta_robots: z.string().optional(),
    canonical_url: z.string().url().optional(),
    og_title: z.string().max(255).optional(),
    og_description: z.string().optional(),
    og_image_url: z.string().url().optional()
});

const addRelatedTourSchema = z.object({
    relatedTourId: z.number()
});

const setRelatedToursSchema = z.object({
    relatedTourIds: z.array(z.number())
});

// All routes require authentication
router.use(authenticate);

// GET /api/admin/tours - List tours with pagination, search, filters
router.get('/', requirePermission('tours.view'), tourCMSController.list);

// GET /api/admin/tours/active - Get active tours
router.get('/active', requirePermission('tours.view'), tourCMSController.getActive);

// GET /api/admin/tours/featured - Get featured tours
router.get('/featured', requirePermission('tours.view'), tourCMSController.getFeatured);

// GET /api/admin/tours/slug/:slug - Get tour by slug
router.get('/slug/:slug', requirePermission('tours.view'), tourCMSController.getBySlug);

// POST /api/admin/tours - Create tour
router.post('/', requirePermission('tours.create'), validate(createTourSchema), tourCMSController.create);

// GET /api/admin/tours/:id - Get tour by ID
router.get('/:id', requirePermission('tours.view'), tourCMSController.getById);

// PUT /api/admin/tours/:id - Update tour
router.put('/:id', requirePermission('tours.edit'), validate(updateTourSchema), tourCMSController.update);

// DELETE /api/admin/tours/:id - Soft delete tour
router.delete('/:id', requirePermission('tours.delete'), tourCMSController.delete);

// POST /api/admin/tours/:id/restore - Restore deleted tour
router.post('/:id/restore', requirePermission('tours.archive'), tourCMSController.restore);

// POST /api/admin/tours/:id/publish - Publish tour
router.post('/:id/publish', requirePermission('tours.publish'), tourCMSController.publish);

// POST /api/admin/tours/:id/archive - Archive tour
router.post('/:id/archive', requirePermission('tours.archive'), tourCMSController.archive);

// GET /api/admin/tours/:id/related - Get related tours
router.get('/:id/related', requirePermission('tours.view'), tourCMSController.getRelated);

// POST /api/admin/tours/:id/related - Add related tour
router.post('/:id/related', requirePermission('tours.edit'), validate(addRelatedTourSchema), tourCMSController.addRelatedTour);

// DELETE /api/admin/tours/:id/related/:relatedTourId - Remove related tour
router.delete('/:id/related/:relatedTourId', requirePermission('tours.edit'), tourCMSController.removeRelatedTour);

// PUT /api/admin/tours/:id/related - Set all related tours
router.put('/:id/related', requirePermission('tours.edit'), validate(setRelatedToursSchema), tourCMSController.setRelatedTours);

module.exports = router;
