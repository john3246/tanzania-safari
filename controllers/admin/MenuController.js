const menuService = require('../../services/MenuService');

class MenuController {
    async list(req, res) {
        try {
            const { page = 1, limit = 20, search, location, isActive, orderBy = 'location', orderDirection = 'ASC' } = req.query;
            
            const offset = (page - 1) * limit;
            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset),
                search,
                location,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                orderBy,
                orderDirection
            };

            const menus = await menuService.getAll({}, options);
            const total = await menuService.count({});

            res.json({
                success: true,
                data: menus,
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
            const menu = await menuService.create(req.body);
            res.status(201).json({ success: true, data: menu });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const menu = await menuService.getMenuWithItems(req.params.id);
            res.json({ success: true, data: menu });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async getBySlug(req, res) {
        try {
            const menu = await menuService.getMenuBySlugWithItems(req.params.slug);
            if (!menu) {
                return res.status(404).json({ success: false, message: 'Menu not found' });
            }
            res.json({ success: true, data: menu });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const menu = await menuService.update(req.params.id, req.body);
            res.json({ success: true, data: menu });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await menuService.softDelete(req.params.id);
            res.json({ success: true, message: 'Menu deleted' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async restore(req, res) {
        try {
            const menu = await menuService.restore(req.params.id);
            res.json({ success: true, data: menu });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getActive(req, res) {
        try {
            const menus = await menuService.getActiveMenus();
            res.json({ success: true, data: menus });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByLocation(req, res) {
        try {
            const menus = await menuService.findByLocation(req.params.location);
            res.json({ success: true, data: menus });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Menu Item methods
    async addMenuItem(req, res) {
        try {
            const item = await menuService.addMenuItem(req.params.id, req.body);
            res.status(201).json({ success: true, data: item });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateMenuItem(req, res) {
        try {
            const item = await menuService.updateMenuItem(req.params.itemId, req.body);
            res.json({ success: true, data: item });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async deleteMenuItem(req, res) {
        try {
            const item = await menuService.deleteMenuItem(req.params.itemId);
            res.json({ success: true, data: item });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async restoreMenuItem(req, res) {
        try {
            const item = await menuService.restoreMenuItem(req.params.itemId);
            res.json({ success: true, data: item });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async reorderMenuItems(req, res) {
        try {
            const { items } = req.body;
            if (!items || !Array.isArray(items)) {
                return res.status(400).json({ success: false, message: 'Items array required' });
            }
            const menu = await menuService.reorderMenuItems(req.params.id, items);
            res.json({ success: true, data: menu });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new MenuController();
