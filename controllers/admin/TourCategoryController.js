const tourCategoryService = require('../../services/TourCategoryService');

class TourCategoryController {
    async list(req, res) {
        try {
            const { page = 1, limit = 20, search, isActive, orderBy = 'display_order', orderDirection = 'ASC' } = req.query;
            
            const offset = (page - 1) * limit;
            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset),
                search,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                orderBy,
                orderDirection
            };

            const categories = await tourCategoryService.getAll({}, options);
            const total = await tourCategoryService.count({});

            res.json({
                success: true,
                data: categories,
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
            const category = await tourCategoryService.create(req.body);
            res.status(201).json({ success: true, data: category });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const category = await tourCategoryService.getById(req.params.id);
            res.json({ success: true, data: category });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async getBySlug(req, res) {
        try {
            const category = await tourCategoryService.findBySlug(req.params.slug);
            if (!category) {
                return res.status(404).json({ success: false, message: 'Category not found' });
            }
            res.json({ success: true, data: category });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const category = await tourCategoryService.update(req.params.id, req.body);
            res.json({ success: true, data: category });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await tourCategoryService.softDelete(req.params.id);
            res.json({ success: true, message: 'Category deleted' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async restore(req, res) {
        try {
            const category = await tourCategoryService.restore(req.params.id);
            res.json({ success: true, data: category });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getActive(req, res) {
        try {
            const categories = await tourCategoryService.getActiveCategories();
            res.json({ success: true, data: categories });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getFeatured(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 6;
            const categories = await tourCategoryService.getFeaturedCategories(limit);
            res.json({ success: true, data: categories });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new TourCategoryController();
