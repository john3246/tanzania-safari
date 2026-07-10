const jwt = require('jsonwebtoken');
const db = require('../config/db');
const JWT_SECRET = process.env.JWT_SECRET || 'tanzania-safari-admin-secret-key-2024';

module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userQuery = await db.query(
            `SELECT u.*, ur.role_name FROM users u 
             LEFT JOIN user_roles ur ON u.role_id = ur.role_id 
             WHERE u.user_id = $1 AND u.is_active = true`,
            [decoded.userId]
        );
        if (!userQuery.rows.length) return res.status(403).json({ success: false, message: 'Forbidden' });
        req.user = userQuery.rows[0];
        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
