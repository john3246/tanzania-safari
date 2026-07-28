const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// Get all blog posts
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT bp.*, bc.category_name, bc.category_slug,
                   COALESCE(
                     NULLIF(TRIM(CONCAT(COALESCE(u.first_name,''), ' ', COALESCE(u.last_name,''))), ''),
                     'John Raphael Shayo'
                   ) as author_name
            FROM blog_posts bp
            LEFT JOIN blog_categories bc ON bp.category_id = bc.category_id
            LEFT JOIN users u ON bp.author_id = u.user_id
            WHERE bp.is_published = true
            ORDER BY bp.published_at DESC
        `;
        const result = await db.query(query);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching blog posts' });
    }
});

// Get blog post by slug
router.get('/:slug', async (req, res) => {
    try {
        const query = `
            SELECT bp.*, bc.category_name, bc.category_slug,
                   COALESCE(
                     NULLIF(TRIM(CONCAT(COALESCE(u.first_name,''), ' ', COALESCE(u.last_name,''))), ''),
                     'John Raphael Shayo'
                   ) as author_name
            FROM blog_posts bp
            LEFT JOIN blog_categories bc ON bp.category_id = bc.category_id
            LEFT JOIN users u ON bp.author_id = u.user_id
            WHERE bp.post_slug = $1 AND bp.is_published = true
        `;
        const result = await db.query(query, [req.params.slug]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Post not found' });
        
        // Update view count
        await db.query('UPDATE blog_posts SET views_count = views_count + 1 WHERE post_id = $1', [result.rows[0].post_id]);
        
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching blog post' });
    }
});

module.exports = router;
