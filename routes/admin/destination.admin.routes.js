const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const verifyAdmin = require('../../middleware/verifyAdmin');

router.use(verifyAdmin);

router.get('/', async (req, res) => {
    try {
        const query = await db.query(`
            SELECT np.*, COUNT(pd.package_id) as safari_count
            FROM national_parks np
            LEFT JOIN package_destinations pd ON np.park_id = pd.park_id
            GROUP BY np.park_id
            ORDER BY np.park_name
        `);
        res.json({ success: true, data: query.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching destinations' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { park_name, park_slug, park_description, park_location, size_sq_km, established_year, is_unesco_heritage, best_season, wildlife_highlights, is_active, image_urls } = req.body;
        const query = await db.query(`
            INSERT INTO national_parks (park_name, park_slug, park_description, park_location, size_sq_km,
                established_year, is_unesco_heritage, best_season, wildlife_highlights, is_active, image_urls, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
            RETURNING park_id`, 
            [park_name, park_slug, park_description, park_location, size_sq_km || null, established_year || null, is_unesco_heritage || false, best_season, wildlife_highlights, is_active !== false, image_urls || []]);
        res.json({ success: true, data: { park_id: query.rows[0].park_id } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating destination' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { park_name, park_slug, park_description, park_location, size_sq_km, established_year, is_unesco_heritage, best_season, wildlife_highlights, is_active, image_urls } = req.body;
        const query = await db.query(`
            UPDATE national_parks 
            SET park_name = $1, park_slug = $2, park_description = $3, park_location = $4, size_sq_km = $5,
                established_year = $6, is_unesco_heritage = $7, best_season = $8, wildlife_highlights = $9, 
                is_active = $10, image_urls = $11, updated_at = NOW()
            WHERE park_id = $12
            RETURNING park_id`,
            [park_name, park_slug, park_description, park_location, size_sq_km || null, established_year || null, is_unesco_heritage || false, best_season, wildlife_highlights, is_active !== false, image_urls || [], id]);
        
        if (query.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }
        res.json({ success: true, message: 'Destination updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating destination' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(`DELETE FROM package_destinations WHERE park_id = $1`, [id]);
        const query = await db.query(`DELETE FROM national_parks WHERE park_id = $1 RETURNING park_id`, [id]);
        if (query.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }
        res.json({ success: true, message: 'Destination deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting destination' });
    }
});

module.exports = router;
