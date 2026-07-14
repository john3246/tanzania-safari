const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const verifyAdmin = require('../../middleware/verifyAdmin');

router.use(verifyAdmin);

// Get all settings
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM system_settings ORDER BY setting_key ASC');
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching settings' });
    }
});

// Update settings in batch
router.put('/', async (req, res) => {
    try {
        const settings = req.body;
        const userId = req.user.userId;
        
        await db.query('BEGIN');
        for (const [key, value] of Object.entries(settings)) {
            await db.query(
                'UPDATE system_settings SET setting_value = $1, updated_by = $2, updated_at = NOW() WHERE setting_key = $3',
                [value, userId, key]
            );
        }
        await db.query('COMMIT');
        res.json({ success: true });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating settings' });
    }
});

module.exports = router;
