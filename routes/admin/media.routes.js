const express = require('express');
const router = express.Router();
const mediaController = require('../../controllers/admin/MediaController');
const { authenticate, requirePermission } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload');

// All routes require authentication
router.use(authenticate);

// GET /api/admin/media - List media with pagination, search, filters
router.get('/', requirePermission('media.view'), mediaController.list);

// GET /api/admin/media/folders - Get all folders
router.get('/folders', requirePermission('media.view'), mediaController.getFolders);

// GET /api/admin/media/stats - Get usage statistics
router.get('/stats', requirePermission('media.view'), mediaController.getUsageStats);

// GET /api/admin/media/search - Search media
router.get('/search', requirePermission('media.view'), mediaController.search);

// GET /api/admin/media/folder/:folder - Get media by folder
router.get('/folder/:folder', requirePermission('media.view'), mediaController.getByFolder);

// GET /api/admin/media/entity/:entityType/:entityId - Get media by entity
router.get('/entity/:entityType/:entityId', requirePermission('media.view'), mediaController.getByEntity);

// GET /api/admin/media/tags - Get media by tags
router.get('/tags', requirePermission('media.view'), mediaController.getByTags);

// POST /api/admin/media/upload - Upload single file
router.post('/upload', requirePermission('media.upload'), upload.single('file'), mediaController.upload);

// POST /api/admin/media/upload-multiple - Upload multiple files
router.post('/upload-multiple', requirePermission('media.upload'), upload.array('files', 10), mediaController.uploadMultiple);

// POST /api/admin/media/folders - Create folder
router.post('/folders', requirePermission('media.folders'), mediaController.createFolder);

// GET /api/admin/media/:id - Get media by ID
router.get('/:id', requirePermission('media.view'), mediaController.getById);

// PUT /api/admin/media/:id - Update media metadata
router.put('/:id', requirePermission('media.edit'), mediaController.update);

// POST /api/admin/media/:id/replace - Replace media file
router.post('/:id/replace', requirePermission('media.edit'), upload.single('file'), mediaController.replace);

// DELETE /api/admin/media/:id - Delete media
router.delete('/:id', requirePermission('media.delete'), mediaController.delete);

// POST /api/admin/media/:id/restore - Restore deleted media
router.post('/:id/restore', requirePermission('media.delete'), mediaController.restore);

module.exports = router;
