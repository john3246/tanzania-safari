const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('../config/db');
const emailService = require('../services/email.service');
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
        
        await emailService.sendPasswordResetEmail(user.email, resetUrl);

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
            'SELECT user_id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW() AND is_active = true',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
        }

        const userId = result.rows[0].user_id;
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Update password and invalidate token
        await db.query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE user_id = $2',
            [passwordHash, userId]
        );

        res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        next(error);
    }
});

// 3. One-Time Admin Registration (Pre-check)
router.get('/can-register-admin', async (req, res, next) => {
    try {
        const checkQuery = `
            SELECT 1 FROM users u 
            JOIN user_roles ur ON u.role_id = ur.role_id 
            WHERE ur.role_name = 'Admin' 
            LIMIT 1
        `;
        const existingAdmin = await db.query(checkQuery);
        
        if (existingAdmin.rows.length > 0) {
            return res.status(403).json({ success: false, isOpen: false, message: 'Admin registration is closed.' });
        }
        res.json({ success: true, isOpen: true });
    } catch (error) {
        next(error);
    }
});

// 4. One-Time Admin Registration (Submit)
router.post('/register-admin', validate(registerSchema), async (req, res, next) => {
    try {
        // Strict Check: Does ANY admin exist?
        const checkQuery = `
            SELECT 1 FROM users u 
            JOIN user_roles ur ON u.role_id = ur.role_id 
            WHERE ur.role_name = 'Admin' 
            LIMIT 1
        `;
        const existingAdmin = await db.query(checkQuery);

        if (existingAdmin.rows.length > 0) {
            return res.status(403).json({ success: false, message: 'Admin registration is closed.' });
        }

        const { email, password, firstName, lastName } = req.body;
        
        // Ensure email isn't somehow already taken by a non-admin
        const emailCheck = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }

        // Get Admin role ID
        const roleResult = await db.query("SELECT role_id FROM user_roles WHERE role_name = 'Admin'");
        if (roleResult.rows.length === 0) {
            return res.status(500).json({ success: false, message: 'Database misconfiguration: Admin role not found.' });
        }
        const adminRoleId = roleResult.rows[0].role_id;

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

module.exports = router;
