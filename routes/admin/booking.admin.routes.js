const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { verifyAdmin } = require('../../middleware/auth.middleware');

router.use(verifyAdmin);

router.get('/', async (req, res) => {
    try {
        const query = await db.query(`
            SELECT b.*, sp.package_name, u.first_name, u.last_name, u.email,
                   COALESCE(u.first_name || ' ' || COALESCE(u.last_name, ''), 'Guest') as full_name,
                   bs.status_name
            FROM bookings b
            LEFT JOIN safari_packages sp ON b.package_id = sp.package_id
            LEFT JOIN users u ON b.user_id = u.user_id
            LEFT JOIN booking_statuses bs ON b.status_id = bs.status_id
            ORDER BY b.created_at DESC
        `);
        res.json({ success: true, data: query.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching bookings' });
    }
});

router.put('/:id/status', async (req, res) => {
    try {
        const { status_id } = req.body;
        await db.query('UPDATE bookings SET status_id = $1, updated_at = NOW() WHERE booking_id = $2', [status_id, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating booking status' });
    }
});

module.exports = router;
