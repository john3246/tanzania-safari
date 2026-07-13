const requirePermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            return res.status(403).json({ success: false, message: 'Access denied: No permissions' });
        }
        
        // Super Admin gets access to everything
        if (req.user.role === 'Super Admin') {
            return next();
        }

        if (!req.user.permissions.includes(requiredPermission)) {
            return res.status(403).json({ success: false, message: `Access denied: Requires ${requiredPermission} permission` });
        }

        next();
    };
};

module.exports = { requirePermission };
