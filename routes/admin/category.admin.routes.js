const express = require('express');
const router = express.Router();
const db = require('../../config/db');
// FIX: Import the default export from verifyAdmin.js (Source 7)
const authenticate = require('../../middleware/verifyAdmin'); 

// FIX: Import the named export from rbacMiddleware.js (Source 4)
const { requirePermission } = require('../../middleware/rbacMiddleware'); 

router.use(authenticate);

router.get('/', requirePermission('categories.view'), async (req, res) => {
    try {
        const query = await db.query(`
            SELECT pc.*, COUNT(sp.package_id) as package_count
            FROM package_categories pc
            LEFT JOIN safari_packages sp ON pc.category_id = sp.category_id
            GROUP BY pc.category_id
            ORDER BY pc.display_order
        `);
        res.json({ success: true, data: query.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching categories' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { category_name, category_slug, category_description, icon_class, display_order, is_active } = req.body;
        const result = await db.query(`
            INSERT INTO package_categories (category_name, category_slug, category_description, icon_class, display_order, is_active)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING category_id
        `, [category_name, category_slug, category_description, icon_class, display_order, is_active]);
        res.json({ success: true, category_id: result.rows[0].category_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error creating category' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { category_name, category_slug, category_description, icon_class, display_order, is_active } = req.body;
        await db.query(`
            UPDATE package_categories 
            SET category_name = $1, category_slug = $2, category_description = $3, icon_class = $4, display_order = $5, is_active = $6, updated_at = NOW()
            WHERE category_id = $7
        `, [category_name, category_slug, category_description, icon_class, display_order, is_active, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating category' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM package_categories WHERE category_id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting category' });
    }
});

module.exports = router;
