const express = require('express');
const router = express.Router();
const safariController = require('../controllers/safariController');
const { verifyUser } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { contactSchema, newsletterSchema } = require('../validators/api.validators');

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

// ── Submit Review ─────────────────────────────────────────────
router.post('/reviews', async (req, res) => {
    try {
        const { package_id, first_name, last_name, rating, comment, review_comment } = req.body;
        const db = require('../config/db');
        const revComment = comment || review_comment || '';
        const fName = first_name || 'Safari Guest';
        const lName = last_name || '';
        const numRating = parseInt(rating) || 5;

        const query = `
            INSERT INTO reviews (package_id, first_name, last_name, rating, review_comment, comment, is_approved)
            VALUES ($1, $2, $3, $4, $5, $5, false)
            RETURNING review_id
        `;
        await db.query(query, [package_id || null, fName, lName, numRating, revComment]);
        res.json({ success: true, message: 'Thank you! Your review has been submitted and is pending approval.' });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ success: false, message: 'Error submitting review' });
    }
});

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

// ── Testimonials / Reviews ───────────────────────────────────
router.get(['/testimonials', '/reviews'], async (req, res) => {
    try {
        const db = require('../config/db');
        const limit = parseInt(req.query.limit) || 6;
        const result = await db.query(`
            SELECT r.*, 
                   COALESCE(NULLIF(r.first_name, ''), NULLIF(u.first_name, ''), 'Safari Guest') AS first_name, 
                   COALESCE(NULLIF(r.last_name, ''), NULLIF(u.last_name, ''), '') AS last_name, 
                   COALESCE(NULLIF(r.comment, ''), NULLIF(r.review_comment, ''), 'Wonderful safari experience!') AS comment,
                   COALESCE(sp.package_name, 'Tanzania Safari Magic') AS safari_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.user_id
            LEFT JOIN safari_packages sp ON r.package_id = sp.package_id
            WHERE r.is_approved = true
            ORDER BY r.created_at DESC LIMIT $1`, [limit]);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error('Error fetching testimonials:', err);
        res.status(500).json({ success: false, message: 'Error fetching testimonials' });
    }
});

// ── Enquiry/Contact ───────────────────────────────────────────
router.post(['/enquiry', '/contact'], validate(contactSchema), async (req, res) => {
    try {
        const db = require('../config/db');
        const emailService = require('../services/email');
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
            const CustomerRepository = require('../repositories/CustomerRepository');
            const NotificationRepository = require('../repositories/NotificationRepository');
            await CustomerRepository.upsertFromEnquiry({ name: full_name, email, phone });
            await NotificationRepository.create({
                type: 'enquiry',
                title: 'New enquiry',
                message: `${full_name}: ${(msg || '').slice(0, 100)}`,
                relatedId: String(result.rows[0].enquiry_id),
                actionUrl: '/admin/enquiries'
            });
            if (global.__chatIo) {
                global.__chatIo.to('admin_room').emit('admin_notification', {
                    type: 'enquiry',
                    title: 'New enquiry',
                    message: `${full_name} submitted an enquiry`
                });
            }
        } catch (crmErr) {
            console.error('CRM/notification error:', crmErr.message);
        }
        
        try {
            const data = { ...req.body, enquiry_id: result.rows[0].enquiry_id, enquiry_message: msg };
            await emailService.sendContactAcknowledgment(data);
            if (typeof emailService.sendAdminContactNotification === 'function') {
                await emailService.sendAdminContactNotification(data);
            } else if (typeof emailService.sendAdminAlert === 'function') {
                await emailService.sendAdminAlert('enquiry', data);
            }
        } catch (mailError) {
            console.error('Mail error:', mailError.message);
        }

        res.json({ success: true, message: 'Message received. We will respond within 24 hours.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Newsletter ────────────────────────────────────────────────
async function handleNewsletterSubscribe(req, res) {
    try {
        const db = require('../config/db');
        const CustomerRepository = require('../repositories/CustomerRepository');
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        await db.query(
            'INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES ($1, NOW()) ON CONFLICT (email) DO NOTHING',
            [email]
        );
        await CustomerRepository.upsertFromNewsletter(email);

        res.json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Newsletter error:', error.message);
        res.status(500).json({ success: false, message: 'Error subscribing' });
    }
}

router.post('/newsletter', validate(newsletterSchema), handleNewsletterSubscribe);
router.post('/newsletter/subscribe', validate(newsletterSchema), handleNewsletterSubscribe);

module.exports = router;