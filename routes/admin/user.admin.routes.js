const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const { verifyAdmin } = require('../../middleware/auth.middleware');

router.use(verifyAdmin);

router.get('/', async (req, res) => {
    try {
        const query = await db.query(`
            SELECT u.*, ur.role_name
            FROM users u
            LEFT JOIN user_roles ur ON u.role_id = ur.role_id
            ORDER BY u.created_at DESC
        `);
        res.json({ success: true, data: query.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email, password, role_id, is_active } = req.body;
        const bcrypt = require('bcrypt');
        const password_hash = await bcrypt.hash(password || 'password123', 10);
        const result = await db.query(`
            INSERT INTO users (first_name, last_name, email, password_hash, role_id, is_active)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id
        `, [first_name, last_name, email, password_hash, role_id, is_active]);
        res.json({ success: true, user_id: result.rows[0].user_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error creating user' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { first_name, last_name, email, role_id, is_active } = req.body;
        await db.query(`
            UPDATE users SET first_name = $1, last_name = $2, email = $3, role_id = $4, is_active = $5, updated_at = NOW() WHERE user_id = $6
        `, [first_name, last_name, email, role_id, is_active, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (req.user.userId === req.params.id) {
            return res.status(400).json({ success: false, message: 'Cannot delete your own logged-in account' });
        }
        try {
            await db.query('DELETE FROM users WHERE user_id = $1', [req.params.id]);
        } catch (fkError) {
            await db.query('UPDATE users SET is_active = false WHERE user_id = $1', [req.params.id]);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
});

module.exports = router;
