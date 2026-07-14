const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'tanzania-safari-admin-secret-key-2024';

const verifyAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userQuery = await db.query(
            `SELECT u.*, ur.role_name FROM users u 
             LEFT JOIN user_roles ur ON u.role_id = ur.role_id 
             WHERE u.user_id = $1 AND u.is_active = true`,
            [decoded.userId]
        );
        
        if (userQuery.rows.length === 0 || !['Admin', 'Super Admin'].includes(userQuery.rows[0].role_name)) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        
        req.user = userQuery.rows[0];
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

const verifyUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next(); // Optional auth
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userQuery = await db.query('SELECT * FROM users WHERE user_id = $1 AND is_active = true', [decoded.userId]);
        if (userQuery.rows.length > 0) {
            req.user = userQuery.rows[0];
        }
    } catch (error) {
        // Silently fail for optional auth
    }
    next();
};

module.exports = { verifyAdmin, verifyUser, JWT_SECRET };
