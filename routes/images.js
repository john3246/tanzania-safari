const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const upload = require('../middleware/upload');
const verifyAdmin = require('../middleware/verifyAdmin');

// Serve image by slug
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

// Upload image (admin)
router.post('/upload', verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        const { slug, alt_text, entity_type, entity_id } = req.body;
        const finalSlug = slug || path.parse(req.file.filename).name;
        const result = await db.query(
            `INSERT INTO site_images (filename, slug, path, alt_text, entity_type, entity_id, uploaded_by, created_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()) RETURNING *`,
            [req.file.filename, finalSlug, `/uploads/${req.file.filename}`, alt_text || '', entity_type || null, entity_id || null, req.user.user_id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// List all images (admin)
router.get('/', verifyAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM site_images ORDER BY created_at DESC');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete image (admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM site_images WHERE id = $1', [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' });
        const img = result.rows[0];
        const filePath = path.join(__dirname, '../uploads', img.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await db.query('DELETE FROM site_images WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
