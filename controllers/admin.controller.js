const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const statRepository = require('../repositories/stat.repository');
const { JWT_SECRET } = require('../middleware/auth.middleware');
const emailService = require('../services/email');

class AdminController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await userRepository.findByEmail(email);
            
            if (!user || (user.role_name !== 'Admin' && user.role_name !== 'Super Admin')) {
                return res.status(401).json({ success: false, message: 'Invalid credentials or access denied' });
            }
            
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
            
            const token = jwt.sign(
                { userId: user.user_id, email: user.email, role: user.role_name },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({
                success: true,
                token,
                user: {
                    id: user.user_id,
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    role: user.role_name
                }
            });
        } catch (error) {
            console.error('Admin login error:', error);
            res.status(500).json({ success: false, message: 'Login failed' });
        }
    }

    async getStats(req, res) {
        try {
            const stats = await statRepository.getGlobalStats();
            try {
                const analyticsRepo = require('../repositories/analytics.repository');
                const snap = await analyticsRepo.getDashboardSnapshot();
                stats.page_views_all = snap.all_time_views || 0;
                stats.unique_visitors_all = snap.all_time_visitors || 0;
                stats.today_views = snap.today_views || 0;
                stats.week_views = snap.week_views || 0;
                stats.month_views = snap.month_views || 0;
                stats.year_views = snap.year_views || 0;
                // Prefer real traffic for the visitors KPI
                if (snap.all_time_views != null) {
                    stats.total_views = snap.all_time_views;
                }
                const overview = await analyticsRepo.getOverview('month');
                stats.visitorLabels = overview.series.labels;
                stats.visitorsByMonth = overview.series.views;
                stats.uniqueVisitorsByPeriod = overview.series.visitors;
                stats.traffic_sources = overview.sources;
            } catch (e) {
                console.warn('Analytics snapshot skipped:', e.message);
            }
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching stats' });
        }
    }

    async getAnalytics(req, res) {
        try {
            const analyticsRepo = require('../repositories/analytics.repository');
            const range = req.query.range || 'month';
            const data = await analyticsRepo.getOverview(range);
            res.json({ success: true, data });
        } catch (error) {
            console.error('getAnalytics:', error);
            res.status(500).json({ success: false, message: error.message || 'Error fetching analytics' });
        }
    }

    async updateProfile(req, res) {
        try {
            const { first_name, last_name, profile_image_url } = req.body;
            await userRepository.update(req.user.user_id, {
                first_name,
                last_name,
                profile_image_url
            });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating profile' });
        }
    }

    async getEnquiries(req, res) {
        try {
            const db = require('../config/db');
            const result = await db.query('SELECT * FROM contact_enquiries ORDER BY created_at DESC');
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching enquiries' });
        }
    }

    async respondEnquiry(req, res) {
        try {
            const db = require('../config/db');
            const { response } = req.body;
            
            if (!response || !response.trim()) {
                return res.status(400).json({ success: false, message: 'Response text is required' });
            }

            // Get enquiry details before updating
            const enquiryResult = await db.query('SELECT * FROM contact_enquiries WHERE enquiry_id = $1', [req.params.id]);
            
            if (enquiryResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Enquiry not found' });
            }
            
            const enquiry = enquiryResult.rows[0];
            let existingResponses = [];
            try {
                existingResponses = typeof enquiry.responses === 'string' ? JSON.parse(enquiry.responses) : (enquiry.responses || []);
            } catch (e) { 
                existingResponses = []; 
            }
            
            const newResponseObj = {
                id: Date.now().toString(),
                sender: 'Admin',
                text: response.trim(),
                created_at: new Date().toISOString()
            };
            
            existingResponses.push(newResponseObj);

            await db.query(
                `UPDATE contact_enquiries 
                 SET enquiry_status = $1, response_notes = $2, responded_at = NOW(), responses = $3::jsonb, updated_at = NOW() 
                 WHERE enquiry_id = $4`,
                ['Responded', response.trim(), JSON.stringify(existingResponses), req.params.id]
            );
            
            // Send response email to user
            let emailSent = false;
            try {
                await emailService.sendEnquiryResponse(enquiry, response.trim());
                emailSent = true;
            } catch (emailError) {
                console.error('Failed to send enquiry response email:', emailError.message);
            }
            
            res.json({ success: true, emailSent, responses: existingResponses });
        } catch (error) {
            console.error('Error responding to enquiry:', error);
            res.status(500).json({ success: false, message: 'Error responding to enquiry' });
        }
    }

    async updateEnquiry(req, res) {
        try {
            const db = require('../config/db');
            const groupDepartureRepo = require('../repositories/GroupDepartureRepository');
            const { enquiry_status } = req.body;

            // Ensure seat/deposit columns exist before reading them
            try {
                await db.query(`ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS departure_id uuid`);
                await db.query(`ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS seats_held integer DEFAULT 0`);
                await db.query(`ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS seats_adjusted boolean DEFAULT false`);
                await db.query(`
                    ALTER TABLE contact_enquiries DROP CONSTRAINT IF EXISTS contact_enquiries_enquiry_status_check;
                    ALTER TABLE contact_enquiries
                      ADD CONSTRAINT contact_enquiries_enquiry_status_check
                      CHECK (enquiry_status::text = ANY (ARRAY[
                        'New'::text, 'In Progress'::text, 'Approved'::text,
                        'Responded'::text, 'Converted'::text, 'Closed'::text
                      ]));
                `);
            } catch (_) { /* best-effort */ }

            const existing = await db.query(
                `SELECT enquiry_id, enquiry_type, departure_id, seats_held, number_of_travelers,
                        seats_adjusted, enquiry_status AS old_status, enquiry_message
                 FROM contact_enquiries WHERE enquiry_id = $1`,
                [req.params.id]
            );
            const enq = existing.rows[0];
            if (!enq) {
                return res.status(404).json({ success: false, message: 'Enquiry not found' });
            }

            await db.query(
                'UPDATE contact_enquiries SET enquiry_status = $1, updated_at = NOW() WHERE enquiry_id = $2',
                [enquiry_status, req.params.id]
            );

            let seatsUpdated = null;
            const isGroup = String(enq.enquiry_type || '').toLowerCase().includes('group')
                || String(enq.enquiry_message || '').toLowerCase().includes('[group safari request]');
            const approving = String(enquiry_status || '').toLowerCase() === 'approved';
            const wasApproved = String(enq.old_status || '').toLowerCase() === 'approved';

            // Recover departure_id from message if column was empty (legacy/fallback inserts)
            let departureId = enq.departure_id;
            if (!departureId && enq.enquiry_message) {
                const m = String(enq.enquiry_message).match(/Departure ID:\s*([0-9a-f-]{36})/i);
                if (m) departureId = m[1];
            }
            let seats = Math.max(1, parseInt(enq.seats_held || enq.number_of_travelers, 10) || 1);
            if ((!enq.seats_held || !enq.number_of_travelers) && enq.enquiry_message) {
                const sm = String(enq.enquiry_message).match(/Travelers\s*\/\s*seats:\s*(\d+)/i);
                if (sm) seats = Math.max(1, parseInt(sm[1], 10) || seats);
            }

            // When a group safari request is approved, hold seats on the departure
            if (isGroup && approving && !enq.seats_adjusted && departureId) {
                seatsUpdated = await groupDepartureRepo.adjustSeats(departureId, seats);
                await db.query(
                    `UPDATE contact_enquiries
                     SET seats_adjusted = true,
                         departure_id = COALESCE(departure_id, $2::uuid),
                         seats_held = COALESCE(NULLIF(seats_held, 0), $3),
                         updated_at = NOW()
                     WHERE enquiry_id = $1`,
                    [req.params.id, departureId, seats]
                );
            }

            // If un-approving / closing after seats were held, release seats once
            if (isGroup && enq.seats_adjusted && wasApproved && !approving && departureId) {
                seatsUpdated = await groupDepartureRepo.adjustSeats(departureId, -seats);
                await db.query(
                    `UPDATE contact_enquiries SET seats_adjusted = false, updated_at = NOW() WHERE enquiry_id = $1`,
                    [req.params.id]
                );
            }

            res.json({
                success: true,
                seatsUpdated,
                message: seatsUpdated
                    ? `Status updated. Seats now ${seatsUpdated.seats_booked}/${seatsUpdated.capacity}`
                    : 'Status updated'
            });
        } catch (error) {
            console.error('updateEnquiry:', error);
            res.status(500).json({ success: false, message: error.message || 'Error updating enquiry' });
        }
    }

    async deleteEnquiry(req, res) {
        try {
            const db = require('../config/db');
            await db.query('DELETE FROM contact_enquiries WHERE enquiry_id = $1', [req.params.id]);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error deleting enquiry' });
        }
    }

    async getReviews(req, res) {
        try {
            const db = require('../config/db');
            const result = await db.query(`
                SELECT r.review_id, r.package_id, r.rating, r.review_title,
                       COALESCE(NULLIF(r.review_comment, ''), NULLIF(r.comment, '')) AS review_comment,
                       r.is_approved, r.is_featured, r.created_at, r.updated_at,
                       COALESCE(NULLIF(r.first_name, ''), NULLIF(u.first_name, ''), 'Guest') AS first_name,
                       COALESCE(NULLIF(r.last_name, ''), NULLIF(u.last_name, ''), '') AS last_name,
                       TRIM(CONCAT(
                           COALESCE(NULLIF(r.first_name, ''), NULLIF(u.first_name, ''), 'Guest'),
                           ' ',
                           COALESCE(NULLIF(r.last_name, ''), NULLIF(u.last_name, ''), '')
                       )) AS full_name,
                       sp.package_name
                FROM reviews r
                LEFT JOIN users u ON r.user_id = u.user_id
                LEFT JOIN safari_packages sp ON r.package_id = sp.package_id
                ORDER BY r.created_at DESC
            `);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching reviews' });
        }
    }

    async approveReview(req, res) {
        try {
            const db = require('../config/db');
            const isApproved = req.body.is_approved === true || req.body.is_approved === 'true';
            const result = await db.query(
                'UPDATE reviews SET is_approved = $1, updated_at = NOW() WHERE review_id = $2 RETURNING review_id, is_approved',
                [isApproved, req.params.id]
            );
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Review not found' });
            }
            res.json({
                success: true,
                data: result.rows[0],
                message: isApproved ? 'Review approved' : 'Review unapproved'
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating review' });
        }
    }

    async deleteReview(req, res) {
        try {
            const db = require('../config/db');
            const result = await db.query(
                'DELETE FROM reviews WHERE review_id = $1 RETURNING review_id',
                [req.params.id]
            );
            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, message: 'Review not found' });
            }
            res.json({ success: true, message: 'Review deleted' });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error deleting review' });
        }
    }

    async verify(req, res) {
        res.json({ success: true, user: req.user });
    }
}

module.exports = new AdminController();
