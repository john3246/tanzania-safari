const permissionService = require('../../services/PermissionService');

class PermissionController {
    async list(req, res) {
        try {
            const { page = 1, limit = 50, search, orderBy = 'name', orderDirection = 'ASC' } = req.query;
            
            const offset = (page - 1) * limit;
            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset),
                search,
                orderBy,
                orderDirection
            };

            const permissions = await permissionService.getAll({}, options);

            res.json({
                success: true,
                data: permissions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: permissions.length,
                    pages: Math.ceil(permissions.length / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const permission = await permissionService.getById(req.params.id);
            res.json({ success: true, data: permission });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const permission = await permissionService.create(req.body);
            res.status(201).json({ success: true, data: permission });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const permission = await permissionService.update(req.params.id, req.body);
            res.json({ success: true, data: permission });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await permissionService.delete(req.params.id);
            res.json({ success: true, message: 'Permission deleted' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getByRole(req, res) {
        try {
            const permissions = await permissionService.getPermissionsByRole(req.params.roleId);
            res.json({ success: true, data: permissions });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getGrouped(req, res) {
        try {
            const grouped = await permissionService.groupByPrefix();
            res.json({ success: true, data: grouped });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new PermissionController();
