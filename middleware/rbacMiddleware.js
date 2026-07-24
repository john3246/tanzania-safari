const requirePermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ success: false, message: 'Access denied: No authenticated user' });
        }
        return next();
    };
};

module.exports = { requirePermission };
