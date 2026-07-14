const express = require('express');
const router = express.Router();
const siteSettingsController = require('../../controllers/admin/SiteSettingsController');
const authenticate = require('../../middleware/verifyAdmin');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validate.middleware');
const { z } = require('zod');

// Validation schemas
const upsertSettingSchema = z.object({
    key: z.string().min(1),
    value: z.any(),
    category: z.enum(['company', 'contact', 'seo', 'social', 'smtp', 'general']),
    dataType: z.enum(['string', 'number', 'boolean', 'json']).optional()
});

const updateSettingSchema = z.object({
    value: z.any()
});

const bulkUpdateSchema = z.object({
    settings: z.array(z.object({
        key: z.string().min(1),
        value: z.any(),
        category: z.enum(['company', 'contact', 'seo', 'social', 'smtp', 'general']),
        data_type: z.enum(['string', 'number', 'boolean', 'json']).optional()
    }))
});

// All routes require authentication
router.use(authenticate);

// GET /api/admin/site-settings - Get all settings
router.get('/', requirePermission('settings.view'), siteSettingsController.getAll);

// GET /api/admin/site-settings/object - Get all settings as object
router.get('/object', requirePermission('settings.view'), siteSettingsController.getAsObject);

// GET /api/admin/site-settings/category/:category - Get settings by category
router.get('/category/:category', requirePermission('settings.view'), siteSettingsController.getByCategory);

// GET /api/admin/site-settings/key/:key - Get setting by key
router.get('/key/:key', requirePermission('settings.view'), siteSettingsController.getByKey);

// POST /api/admin/site-settings - Upsert setting
router.post('/', requirePermission('settings.edit'), validate(upsertSettingSchema), siteSettingsController.upsert);

// PUT /api/admin/site-settings/key/:key - Update setting
router.put('/key/:key', requirePermission('settings.edit'), validate(updateSettingSchema), siteSettingsController.update);

// PUT /api/admin/site-settings/bulk - Bulk update settings
router.put('/bulk', requirePermission('settings.edit'), validate(bulkUpdateSchema), siteSettingsController.bulkUpdate);

// DELETE /api/admin/site-settings/key/:key - Delete setting
router.delete('/key/:key', requirePermission('settings.delete'), siteSettingsController.delete);

// POST /api/admin/site-settings/key/:key/restore - Restore deleted setting
router.post('/key/:key/restore', requirePermission('settings.delete'), siteSettingsController.restore);

// Convenience endpoints for common categories
// Company Info
router.get('/company', requirePermission('settings.view'), siteSettingsController.getCompanyInfo);
router.put('/company', requirePermission('settings.edit'), siteSettingsController.updateCompanyInfo);

// Contact Info
router.get('/contact', requirePermission('settings.view'), siteSettingsController.getContactInfo);
router.put('/contact', requirePermission('settings.edit'), siteSettingsController.updateContactInfo);

// SEO Settings
router.get('/seo', requirePermission('settings.view'), siteSettingsController.getSEOSettings);
router.put('/seo', requirePermission('settings.edit'), siteSettingsController.updateSEOSettings);

// Social Media
router.get('/social', requirePermission('settings.view'), siteSettingsController.getSocialMedia);
router.put('/social', requirePermission('settings.edit'), siteSettingsController.updateSocialMedia);

// SMTP Settings
router.get('/smtp', requirePermission('settings.view'), siteSettingsController.getSMTPSettings);
router.put('/smtp', requirePermission('settings.edit'), siteSettingsController.updateSMTPSettings);

module.exports = router;
