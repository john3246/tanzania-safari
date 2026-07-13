const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');
const mediaController = require('../controllers/admin/MediaController');

// Serve image by slug (public view)
router.get('/:slug', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM site_images WHERE slug = $1', [req.params.slug]);
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Image not found' });
        const img = result.rows[0];
        const filePath = path.join(__dirname, '../uploads', img.filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found' });
        res.sendFile(filePath);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin CMS Endpoints
router.use(requireAuth);

router.get('/', mediaController.list);
router.post('/upload', requirePermission('media.upload'), upload.single('image'), mediaController.upload);
router.put('/:id', requirePermission('media.upload'), upload.single('image'), mediaController.replace);
router.delete('/:id', requirePermission('media.delete'), mediaController.delete);

module.exports = router;
