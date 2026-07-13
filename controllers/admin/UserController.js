const userService = require('../../services/UserService');

class UserController {
    async list(req, res) {
        try {
            const { page = 1, limit = 20, search, roleId, orderBy = 'created_at', orderDirection = 'DESC' } = req.query;
            
            const offset = (page - 1) * limit;
            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset),
                search,
                roleId,
                orderBy,
                orderDirection
            };

            const users = await userService.getAll({}, options);
            const total = await userService.count({});

            // Remove sensitive fields
            const safeUsers = users.map(u => {
                const { password_hash, ...rest } = u;
                return rest;
            });

            res.json({
                success: true,
                data: safeUsers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const user = await userService.create(req.body);
            delete user.password_hash;
            res.status(201).json({ success: true, data: user });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const user = await userService.getById(req.params.id);
            delete user.password_hash;
            res.json({ success: true, data: user });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const user = await userService.update(req.params.id, req.body);
            delete user.password_hash;
            res.json({ success: true, data: user });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await userService.softDelete(req.params.id);
            res.json({ success: true, message: 'User deleted' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async restore(req, res) {
        try {
            const user = await userService.restore(req.params.id);
            delete user.password_hash;
            res.json({ success: true, data: user });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new UserController();
