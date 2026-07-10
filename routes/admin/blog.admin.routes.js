const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { verifyAdmin } = require('../../middleware/auth.middleware');

router.use(verifyAdmin);

// Get all blog posts (published & drafts) for admin panel
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT bp.*, bc.category_name, bc.category_slug, u.first_name as author_name
            FROM blog_posts bp
            LEFT JOIN blog_categories bc ON bp.category_id = bc.category_id
            LEFT JOIN users u ON bp.author_id = u.user_id
            ORDER BY bp.created_at DESC
        `;
        const result = await db.query(query);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching blog posts' });
    }
});

// Create blog post
router.post('/', async (req, res) => {
    try {
        const { post_title, post_slug, post_excerpt, post_content, category_id, featured_image_url, post_tags, meta_title, meta_description, is_published } = req.body;
        const authorId = req.user.userId;
        const query = `
            INSERT INTO blog_posts (
                post_title, post_slug, post_excerpt, post_content, author_id, 
                category_id, featured_image_url, post_tags, meta_title, meta_description, 
                is_published, published_at, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
            RETURNING post_id
        `;
        const publishedAt = is_published ? new Date() : null;
        const result = await db.query(query, [
            post_title, post_slug, post_excerpt, post_content, authorId,
            category_id || null, featured_image_url || null, post_tags || [],
            meta_title || null, meta_description || null, is_published || false, publishedAt
        ]);
        res.json({ success: true, post_id: result.rows[0].post_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error creating blog post' });
    }
});

// Update blog post
router.put('/:id', async (req, res) => {
    try {
        const { post_title, post_slug, post_excerpt, post_content, category_id, featured_image_url, post_tags, meta_title, meta_description, is_published } = req.body;
        const publishedAt = is_published ? new Date() : null;
        await db.query(`
            UPDATE blog_posts SET
                post_title = $1, post_slug = $2, post_excerpt = $3, post_content = $4,
                category_id = $5, featured_image_url = $6, post_tags = $7,
                meta_title = $8, meta_description = $9, is_published = $10,
                published_at = COALESCE(published_at, $11), updated_at = NOW()
            WHERE post_id = $12
        `, [
            post_title, post_slug, post_excerpt, post_content, category_id || null,
            featured_image_url || null, post_tags || [], meta_title || null,
            meta_description || null, is_published || false, publishedAt, req.params.id
        ]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating blog post' });
    }
});

// Delete blog post
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM blog_posts WHERE post_id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting blog post' });
    }
});

module.exports = router;
