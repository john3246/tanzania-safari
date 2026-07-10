const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { verifyAdmin } = require('../../middleware/auth.middleware');

router.use(verifyAdmin);

router.get('/', async (req, res) => {
    try {
        const query = await db.query(`
            SELECT np.*, COUNT(pd.package_id) as safari_count
            FROM national_parks np
            LEFT JOIN package_destinations pd ON np.park_id = pd.park_id
            WHERE np.is_active = true
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
        const { park_name, park_slug, park_description, park_location, size_sq_km, established_year, is_unesco_heritage, best_season, wildlife_highlights } = req.body;
        const query = await db.query(`
            INSERT INTO national_parks (park_name, park_slug, park_description, park_location, size_sq_km,
                established_year, is_unesco_heritage, best_season, wildlife_highlights, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())
            RETURNING park_id`, 
            [park_name, park_slug, park_description, park_location, size_sq_km, established_year, is_unesco_heritage, best_season, wildlife_highlights]);
        res.json({ success: true, data: { park_id: query.rows[0].park_id } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating destination' });
    }
});

module.exports = router;
