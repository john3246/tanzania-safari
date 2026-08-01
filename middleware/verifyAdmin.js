const jwt = require('jsonwebtoken');
const db = require('../config/db');

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET must be set to a strong value in production');
        }
        console.warn('[auth] JWT_SECRET missing or weak — using ephemeral dev secret');
        return 'dev-only-insecure-jwt-secret';
    }
    return secret;
}

module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.jwt;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    try {
        const secret = getJwtSecret();
        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (e) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        const targetId = decoded.userId || decoded.id || decoded.sub;
        if (!targetId) {
            return res.status(401).json({ success: false, message: 'Invalid token payload' });
        }

        const userQuery = await db.query(
            `SELECT u.*, ur.role_name, ur.permissions
             FROM users u
             LEFT JOIN user_roles ur ON u.role_id = ur.role_id
             WHERE u.user_id = $1 AND u.is_active = true`,
            [targetId]
        );

        if (!userQuery.rows.length) {
            return res.status(401).json({ success: false, message: 'User not found or inactive' });
        }

        const userRow = userQuery.rows[0];
        const role = userRow.role_name || decoded.role || '';
        if (!['Admin', 'Super Admin'].includes(role)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        let permissions = userRow.permissions;
        if (typeof permissions === 'string') {
            try { permissions = JSON.parse(permissions); } catch { permissions = []; }
        }
        if (!Array.isArray(permissions) || !permissions.length) {
            permissions = role === 'Super Admin' ? ['*'] : ['admin'];
        }

        req.user = userRow;
        req.user.role = role;
        req.user.permissions = permissions;
        next();
    } catch (err) {
        console.error('verifyAdmin error:', err.message);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

module.exports.getJwtSecret = getJwtSecret;
