const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
    try {
        const token = req.cookies?.jwt || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

module.exports = { requireAuth };
