const destinationService = require('../../services/DestinationService');

class DestinationController {
    async list(req, res) {
        try {
            const { page = 1, limit = 20, search, country, region, isFeatured, isActive, orderBy = 'display_order', orderDirection = 'ASC' } = req.query;
            
            const offset = (page - 1) * limit;
            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset),
                search,
                country,
                region,
                isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                orderBy,
                orderDirection
            };

            const destinations = await destinationService.getAll({}, options);
            const total = await destinationService.count({});

            res.json({
                success: true,
                data: destinations,
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
            const destination = await destinationService.create(req.body);
            res.status(201).json({ success: true, data: destination });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const destination = await destinationService.getById(req.params.id);
            res.json({ success: true, data: destination });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async getBySlug(req, res) {
        try {
            const destination = await destinationService.findBySlug(req.params.slug);
            if (!destination) {
                return res.status(404).json({ success: false, message: 'Destination not found' });
            }
            res.json({ success: true, data: destination });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const destination = await destinationService.update(req.params.id, req.body);
            res.json({ success: true, data: destination });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await destinationService.delete(req.params.id);
            res.json({ success: true, message: 'Destination permanently deleted' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async togglePublish(req, res) {
        try {
            const { is_active } = req.body;
            const destination = await destinationService.togglePublish(req.params.id, is_active);
            res.json({ success: true, data: destination, message: `Destination ${is_active ? 'published' : 'unpublished'} successfully` });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async restore(req, res) {
        try {
            const destination = await destinationService.restore(req.params.id);
            res.json({ success: true, data: destination });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getActive(req, res) {
        try {
            const destinations = await destinationService.getActiveDestinations();
            res.json({ success: true, data: destinations });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getFeatured(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 4;
            const destinations = await destinationService.getFeaturedDestinations(limit);
            res.json({ success: true, data: destinations });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByRegion(req, res) {
        try {
            const destinations = await destinationService.getByRegion(req.params.region);
            res.json({ success: true, data: destinations });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getRegions(req, res) {
        try {
            const regions = await destinationService.getRegions();
            res.json({ success: true, data: regions });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new DestinationController();
