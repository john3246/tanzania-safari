const express = require('express');
const router = express.Router();
const emailTemplateController = require('../../controllers/admin/EmailTemplateController');
const { authenticate, requirePermission } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

// Validation schemas
const createTemplateSchema = z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
    subject: z.string().min(1).max(255),
    html_content: z.string(),
    text_content: z.string().optional(),
    description: z.string().optional(),
    category: z.enum(['booking', 'payment', 'contact', 'newsletter', 'admin', 'system']).optional(),
    is_active: z.boolean().optional()
});

const updateTemplateSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
    subject: z.string().min(1).max(255).optional(),
    html_content: z.string().optional(),
    text_content: z.string().optional(),
    description: z.string().optional(),
    category: z.enum(['booking', 'payment', 'contact', 'newsletter', 'admin', 'system']).optional(),
    is_active: z.boolean().optional()
});

const previewSchema = z.object({
    variables: z.record(z.string()).optional()
});

// All routes require authentication
router.use(authenticate);

// GET /api/admin/email-templates - List email templates with pagination, search, filters
router.get('/', requirePermission('email_templates.view'), emailTemplateController.list);

// GET /api/admin/email-templates/active - Get active templates
router.get('/active', requirePermission('email_templates.view'), emailTemplateController.getActive);

// GET /api/admin/email-templates/category/:category - Get templates by category
router.get('/category/:category', requirePermission('email_templates.view'), emailTemplateController.getByCategory);

// POST /api/admin/email-templates - Create email template
router.post('/', requirePermission('email_templates.create'), validate(createTemplateSchema), emailTemplateController.create);

// GET /api/admin/email-templates/:id - Get template by ID
router.get('/:id', requirePermission('email_templates.view'), emailTemplateController.getById);

// GET /api/admin/email-templates/slug/:slug - Get template by slug
router.get('/slug/:slug', requirePermission('email_templates.view'), emailTemplateController.getBySlug);

// GET /api/admin/email-templates/slug/:slug/variables - Get template with variables
router.get('/slug/:slug/variables', requirePermission('email_templates.view'), emailTemplateController.getWithVariables);

// POST /api/admin/email-templates/slug/:slug/preview - Preview template with variables
router.post('/slug/:slug/preview', requirePermission('email_templates.view'), validate(previewSchema), emailTemplateController.preview);

// PUT /api/admin/email-templates/:id - Update email template
router.put('/:id', requirePermission('email_templates.edit'), validate(updateTemplateSchema), emailTemplateController.update);

// DELETE /api/admin/email-templates/:id - Soft delete template
router.delete('/:id', requirePermission('email_templates.delete'), emailTemplateController.delete);

// POST /api/admin/email-templates/:id/restore - Restore deleted template
router.post('/:id/restore', requirePermission('email_templates.delete'), emailTemplateController.restore);

module.exports = router;
