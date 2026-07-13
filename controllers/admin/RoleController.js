const roleService = require('../../services/RoleService');

class RoleController {
    async list(req, res) {
        try {
            const { page = 1, limit = 20, search, orderBy = 'created_at', orderDirection = 'DESC' } = req.query;
            
            const offset = (page - 1) * limit;
            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset),
                search,
                orderBy,
                orderDirection
            };

            const roles = await roleService.getAll({}, options);
            
            // Get user count for each role
            for (const role of roles) {
                role.user_count = await roleService.getUserCount(role.id);
            }

            res.json({
                success: true,
                data: roles,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: roles.length,
                    pages: Math.ceil(roles.length / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const role = await roleService.create(req.body);
            res.status(201).json({ success: true, data: role });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const role = await roleService.getById(req.params.id);
            role.user_count = await roleService.getUserCount(role.id);
            res.json({ success: true, data: role });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const role = await roleService.update(req.params.id, req.body);
            res.json({ success: true, data: role });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await roleService.canDelete(req.params.id);
            await roleService.delete(req.params.id);
            res.json({ success: true, message: 'Role deleted' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getPermissions(req, res) {
        try {
            const permissions = await roleService.getRolePermissions(req.params.id);
            res.json({ success: true, data: permissions });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async assignPermission(req, res) {
        try {
            const { permissionId } = req.body;
            const result = await roleService.assignPermission(req.params.id, permissionId);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async removePermission(req, res) {
        try {
            const { permissionId } = req.params;
            const result = await roleService.removePermission(req.params.id, permissionId);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async setPermissions(req, res) {
        try {
            const { permissionIds } = req.body;
            const role = await roleService.setPermissions(req.params.id, permissionIds);
            res.json({ success: true, data: role });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new RoleController();
