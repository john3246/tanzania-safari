const express = require('express');
const router = express.Router();
const safariController = require('../controllers/safariController');
const { verifyUser } = require('../middleware/auth.middleware');

// ── Sub-Routes ────────────────────────────────────────────────
router.use('/packages',     require('./api/package.routes'));
router.use('/destinations', require('./api/destination.routes'));
router.use('/blog',         require('./api/blog.routes'));
router.use('/bookings',     require('./api/booking.routes'));

// ── Stats ─────────────────────────────────────────────────────
router.get('/stats', safariController.getGlobalStats || (async (req, res) => {
    try {
        const db = require('../config/db');
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM safari_packages WHERE is_active = true) as total_packages,
                (SELECT COUNT(*) FROM national_parks WHERE is_active = true) as total_destinations,
                (SELECT COUNT(*) FROM guides WHERE is_available = true) as total_guides,
                (SELECT COUNT(*) FROM reviews WHERE is_approved = true) as total_reviews
        `;
        const result = await db.query(query);
        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
}));

// ── Categories ────────────────────────────────────────────────
router.get('/categories', safariController.getCategories || (async (req, res) => {
    try {
        const db = require('../config/db');
        const query = `
            SELECT pc.category_id, pc.category_name, pc.category_slug, pc.category_description, pc.icon_class,
                   COUNT(sp.package_id) as safari_count
            FROM package_categories pc
            LEFT JOIN safari_packages sp ON pc.category_id = sp.category_id AND sp.is_active = true
            WHERE pc.is_active = true
            GROUP BY pc.category_id
            ORDER BY pc.display_order
        `;
        const result = await db.query(query);
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching categories' });
    }
}));

// ── Testimonials ──────────────────────────────────────────
router.get('/testimonials', async (req, res) => {
    try {
        const db = require('../config/db');
        const limit = parseInt(req.query.limit) || 6;
        const result = await db.query(`
            SELECT r.*, u.first_name, u.last_name, sp.package_name AS safari_name
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            LEFT JOIN safari_packages sp ON r.package_id = sp.package_id
            WHERE r.is_approved = true AND r.rating >= 4
            ORDER BY r.created_at DESC LIMIT $1`, [limit]);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching testimonials' });
    }
});

// ── Enquiry/Contact ───────────────────────────────────────────
router.post(['/enquiry', '/contact'], async (req, res) => {
    try {
        const db = require('../config/db');
        const emailService = require('../services/email.service');
        const { full_name, email, phone, country, enquiry_type, message, enquiry_message, travel_date, travelers, package_id } = req.body;
        
        if (!full_name || !email) return res.status(400).json({ success: false, message: 'Name and email are required' });
        
        const msg = enquiry_message || message || '';
        const type = enquiry_type || (req.path === '/bookings' ? 'Booking' : 'General');

        const result = await db.query(
            `INSERT INTO contact_enquiries (full_name, email, phone, country, enquiry_type, package_id, preferred_travel_date, number_of_travelers, enquiry_message, enquiry_status, created_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'New',NOW()) RETURNING enquiry_id`,
            [full_name, email, phone || null, country || null, type, package_id || null, travel_date || null, travelers || null, msg]
        );
        
        try {
            const data = { ...req.body, enquiry_id: result.rows[0].enquiry_id, enquiry_message: msg };
            await emailService.sendContactAcknowledgment(data);
            await emailService.sendAdminNotification('enquiry', data);
        } catch (mailError) {
            console.error('Mail error:', mailError.message);
        }

        res.json({ success: true, message: 'Message received. We will respond within 24 hours.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Newsletter ────────────────────────────────────────────────
router.post('/newsletter', async (req, res) => {
    try {
        const db = require('../config/db');
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
        
        await db.query('INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES ($1, NOW()) ON CONFLICT (email) DO NOTHING', [email]);
        res.json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error subscribing' });
    }
});

module.exports = router;