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
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching stats' });
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
            
            // Get enquiry details before updating
            const enquiryResult = await db.query('SELECT * FROM contact_enquiries WHERE enquiry_id = $1', [req.params.id]);
            
            if (enquiryResult.rows.length === 0) {
                return res.status(404).json({ success: false, message: 'Enquiry not found' });
            }
            
            const enquiry = enquiryResult.rows[0];
            
            await db.query('UPDATE contact_enquiries SET enquiry_status = $1, updated_at = NOW() WHERE enquiry_id = $2', ['Responded', req.params.id]);
            
            // Send response email to user
            try {
                await emailService.sendEnquiryResponse(enquiry, response);
            } catch (emailError) {
                console.error('Failed to send enquiry response email:', emailError.message);
            }
            
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error responding to enquiry' });
        }
    }

    async getReviews(req, res) {
        try {
            const db = require('../config/db');
            const result = await db.query(`
                SELECT r.*, u.first_name, u.last_name, sp.package_name
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
            const { is_approved } = req.body;
            await db.query('UPDATE reviews SET is_approved = $1, updated_at = NOW() WHERE review_id = $2', [is_approved, req.params.id]);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating review' });
        }
    }

    async verify(req, res) {
        res.json({ success: true, user: req.user });
    }
}

module.exports = new AdminController();
