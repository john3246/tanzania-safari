const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/db');
const emailService = require('../services/email');
const { z } = require('zod');
const { validate } = require('../middleware/validate.middleware');

// --- Schemas ---
const forgotSchema = z.object({ email: z.string().email() });
const resetSchema = z.object({ password: z.string().min(6) });
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(2),
    lastName: z.string().min(2)
});

// --- Routes ---

// 1. Forgot Password
router.post('/forgot-password', validate(forgotSchema), async (req, res, next) => {
    try {
        const { email } = req.body;
        // Generic success message to prevent email enumeration
        const successMessage = 'If an account with that email exists, a password reset link has been sent.';

        const userResult = await db.query('SELECT user_id, email FROM users WHERE email = $1 AND is_active = true', [email]);
        
        if (userResult.rows.length === 0) {
            return res.json({ success: true, message: successMessage });
        }

        const user = userResult.rows[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await db.query(
            'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE user_id = $3',
            [resetToken, expiresAt, user.user_id]
        );

        const resetUrl = `${process.env.ADMIN_URL || 'http://localhost:3000/admin'}/reset-password?token=${resetToken}`;
        
        try {
            await emailService.sendPasswordResetEmail(user.email, resetUrl);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError.message);
            return res.status(500).json({ success: false, message: 'Failed to send password reset email. Please ensure SMTP is configured correctly.' });
        }

        res.json({ success: true, message: successMessage });
    } catch (error) {
        next(error);
    }
});

// 2. Reset Password
router.post('/reset-password/:token', validate(resetSchema), async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const result = await db.query(
            'SELECT user_id, email FROM users WHERE reset_token = $1 AND reset_token_expires > NOW() AND is_active = true',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
        }

        const userId = result.rows[0].user_id;
        const userEmail = result.rows[0].email;
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Update password and invalidate token
        await db.query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE user_id = $2',
            [passwordHash, userId]
        );

        // Send password changed notification
        try {
            await emailService.sendPasswordChanged(userEmail);
        } catch (emailError) {
            console.error('Failed to send password changed email:', emailError.message);
        }

        res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        next(error);
    }
});

// 3. One-Time Admin Registration (Pre-check) — only when no admin exists
router.get('/can-register-admin', async (req, res, next) => {
    try {
        // Optional emergency unlock: ALLOW_ADMIN_REGISTER=true (never leave on in prod)
        if (process.env.ALLOW_ADMIN_REGISTER === 'true') {
            return res.json({ success: true, isOpen: true });
        }

        const count = await db.query(`
            SELECT COUNT(*)::int AS n
            FROM users u
            LEFT JOIN user_roles ur ON u.role_id = ur.role_id
            WHERE u.is_active = true
              AND (
                ur.role_name IN ('Admin', 'Super Admin')
                OR EXISTS (
                  SELECT 1 FROM roles r
                  WHERE r.id = u.role_id AND r.name IN ('Admin', 'Super Admin')
                )
              )
        `).catch(async () => {
            // Fallback if role join shape differs
            return db.query(`SELECT COUNT(*)::int AS n FROM users WHERE is_active = true`);
        });

        const n = count.rows[0]?.n || 0;
        res.json({ success: true, isOpen: n === 0 });
    } catch (error) {
        next(error);
    }
});


// 4. One-Time Admin Registration (Submit)
router.post('/register-admin', validate(registerSchema), async (req, res, next) => {
    try {
        if (process.env.ALLOW_ADMIN_REGISTER !== 'true') {
            const count = await db.query(`SELECT COUNT(*)::int AS n FROM users WHERE is_active = true`);
            if ((count.rows[0]?.n || 0) > 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Admin registration is closed. Ask an existing admin to create accounts.'
                });
            }
        }

        const { email, password, firstName, lastName } = req.body;
        
        // Ensure email isn't somehow already taken by a non-admin
        const emailCheck = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }

        // Get Admin role ID
        let roleResult = await db.query("SELECT role_id FROM user_roles WHERE role_name IN ('Admin', 'Super Admin') ORDER BY role_name DESC LIMIT 1");
        
        let adminRoleId;
        if (roleResult.rows.length === 0) {
            // Try the 'roles' table if user_roles is empty or missing roles
            try {
                const legacyRoleResult = await db.query("SELECT id as role_id FROM roles WHERE name IN ('Admin', 'Super Admin') ORDER BY name DESC LIMIT 1");
                if (legacyRoleResult.rows.length > 0) {
                    adminRoleId = legacyRoleResult.rows[0].role_id;
                } else {
                    return res.status(500).json({ success: false, message: 'Database misconfiguration: Admin role not found.' });
                }
            } catch (err) {
                // If neither table works or the role is missing, we must fail cleanly
                return res.status(500).json({ success: false, message: 'Database misconfiguration: Admin role not found and could not be created.' });
            }
        } else {
            adminRoleId = roleResult.rows[0].role_id;
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await db.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_active, created_at)
             VALUES ($1, $2, $3, $4, $5, true, NOW())`,
            [email, passwordHash, firstName, lastName, adminRoleId]
        );

        res.status(201).json({ success: true, message: 'Initial Admin account created successfully. You may now log in.' });

    } catch (error) {
        next(error);
    }
});

// 5. Temporary DB Fix Route — disabled in production
router.get('/fix-db', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).end();
    }
    try {
        await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)');
        await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP');
        res.send('Database fixed successfully! The reset_token columns have been added. You can now use the forgot password feature.');
    } catch (error) {
        res.status(500).send('Error fixing database: ' + error.message);
    }
});

module.exports = router;
