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
router.use('/group-departures', require('./api/group-departures.routes'));
router.use('/analytics', require('./api/analytics.routes'));
router.use('/payments', require('./api/payments.routes'));

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
            HAVING COUNT(sp.package_id) > 0
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
                   COALESCE(NULLIF(r.comment, ''), NULLIF(r.review_comment, '')) AS comment,
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
        const crypto = require('crypto');
        const CustomerRepository = require('../repositories/CustomerRepository');
        const { email, full_name } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const token = crypto.randomBytes(24).toString('hex');
        await db.query(`
            ALTER TABLE newsletter_subscribers
              ADD COLUMN IF NOT EXISTS unsubscribe_token varchar(64),
              ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
              ADD COLUMN IF NOT EXISTS full_name varchar(150)
        `).catch(() => {});

        try {
            await db.query(
                `INSERT INTO newsletter_subscribers (email, full_name, subscribed_at, is_active, unsubscribe_token)
                 VALUES ($1, $2, NOW(), true, $3)
                 ON CONFLICT (email) DO UPDATE SET
                   is_active = true,
                   full_name = COALESCE(EXCLUDED.full_name, newsletter_subscribers.full_name),
                   unsubscribe_token = COALESCE(newsletter_subscribers.unsubscribe_token, EXCLUDED.unsubscribe_token)`,
                [email, full_name || null, token]
            );
        } catch (_) {
            await db.query(
                'INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES ($1, NOW()) ON CONFLICT (email) DO NOTHING',
                [email]
            );
        }
        await CustomerRepository.upsertFromNewsletter(email);
        await CustomerRepository.upsert({ name: full_name || null, email, source: 'newsletter' });

        // Welcome + thank-you email (non-blocking)
        Promise.resolve().then(async () => {
            try {
                const mail = require('../services/email');
                if (mail.sendNewsletterWelcome) {
                    await mail.sendNewsletterWelcome({
                        email,
                        full_name: full_name || null,
                        unsubscribe_token: token
                    });
                } else {
                    throw new Error('sendNewsletterWelcome unavailable');
                }
            } catch (e) {
                console.warn('Queued welcome failed, trying direct SMTP:', e.message);
                try {
                    const { sendEmail } = require('../src/utils/emailService');
                    const site = process.env.SITE_URL || 'https://tanzaniasafarimagic.com';
                    const unsub = `${site}/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
                    const name = full_name || 'Safari Friend';
                    await sendEmail({
                        to: email,
                        subject: 'Karibu! Welcome to Tanzania Safari Magic',
                        html: `
                          <div style="font-family:Segoe UI,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #e5ebe3;border-radius:16px;overflow:hidden">
                            <div style="background:linear-gradient(135deg,#2C391C,#465B2D);padding:28px;text-align:center;color:#fff">
                              <img src="${site}/images/logo.png" width="56" height="56" style="border-radius:10px;background:#fff;padding:6px" alt="">
                              <h1 style="margin:12px 0 0;font-size:22px">Welcome to the journey</h1>
                              <p style="margin:8px 0 0;opacity:.9">Thank you for subscribing</p>
                            </div>
                            <div style="height:4px;background:#C8860A"></div>
                            <div style="padding:28px;color:#475569;font-size:15px;line-height:1.65">
                              <p>Dear <strong>${name}</strong>,</p>
                              <p>Thank you for joining <strong>Tanzania Safari Magic</strong>. You’re now on our list for wildlife tips, migration updates, destination guides, and occasional offers from Our Team in Arusha.</p>
                              <p><strong>What you’ll receive</strong></p>
                              <ul>
                                <li>Guides to Serengeti, Ngorongoro, Kilimanjaro &amp; Zanzibar</li>
                                <li>Best-time-to-visit and Great Migration highlights</li>
                                <li>New safari packages and group departure dates</li>
                              </ul>
                              <p style="margin:24px 0">
                                <a href="${site}/safaris" style="display:inline-block;background:#465B2D;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;margin:4px">Browse safaris</a>
                                <a href="${site}/booking" style="display:inline-block;background:#C8860A;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700;margin:4px">Request a free quote</a>
                              </p>
                              <p>Questions? WhatsApp <a href="https://wa.me/255695108009">+255 695 108 009</a>.</p>
                              <p>Karibu — welcome to Tanzania.<br><strong>The Tanzania Safari Magic Team</strong></p>
                              <p style="font-size:12px;color:#94a3b8;margin-top:28px"><a href="${unsub}">Unsubscribe</a></p>
                            </div>
                          </div>`
                    });
                } catch (e2) {
                    console.error('Newsletter welcome email failed:', e2.message);
                }
            }
        });

        res.json({ success: true, message: 'Subscribed successfully. Check your inbox for a welcome email.' });
    } catch (error) {
        console.error('Newsletter error:', error.message);
        res.status(500).json({ success: false, message: 'Error subscribing' });
    }
}

async function handleNewsletterUnsubscribe(req, res) {
    try {
        const db = require('../config/db');
        const { email, token } = req.body || {};
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        await db.query(
            `UPDATE newsletter_subscribers
             SET is_active = false
             WHERE LOWER(email) = LOWER($1)
               AND ($2::text IS NULL OR unsubscribe_token IS NULL OR unsubscribe_token = $2)`,
            [email, token || null]
        ).catch(async () => {
            await db.query(`DELETE FROM newsletter_subscribers WHERE LOWER(email) = LOWER($1)`, [email]);
        });
        res.json({ success: true, message: 'You have been unsubscribed from newsletter emails.' });
    } catch (error) {
        console.error('Unsubscribe error:', error.message);
        res.status(500).json({ success: false, message: 'Could not unsubscribe' });
    }
}

router.post('/newsletter', validate(newsletterSchema), handleNewsletterSubscribe);
router.post('/newsletter/subscribe', validate(newsletterSchema), handleNewsletterSubscribe);
router.post('/newsletter/unsubscribe', handleNewsletterUnsubscribe);

module.exports = router;