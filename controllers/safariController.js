const safariService = require('../services/safari.service');

class SafariController {
    async getAllPackages(req, res) {
        try {
            const filters = {
                category: req.query.category,
                destination: req.query.destination,
                duration: req.query.duration,
                difficulty: req.query.difficulty,
                minPrice: req.query.min_price,
                maxPrice: req.query.max_price,
                search: req.query.search,
                sort: req.query.sort,
                page: req.query.page,
                limit: req.query.limit
            };

            const result = await safariService.getPackages(filters);
            res.json({ 
                success: true, 
                data: result.packages, 
                pagination: result.pagination 
            });
        } catch (error) {
            console.error('Error in getAllPackages:', error);
            res.status(500).json({ success: false, message: 'Error fetching packages' });
        }
    }

    async getFeaturedPackages(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 6;
            const packages = await safariService.getFeaturedPackages(limit);
            res.json({ success: true, data: packages });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getPackageBySlug(req, res) {
        try {
            const pkg = await safariService.getPackageDetails(req.params.slug);
            if (!pkg) {
                return res.status(404).json({ success: false, message: 'Package not found' });
            }
            res.json({ success: true, data: pkg });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getDestinations(req, res) {
        try {
            const destinations = await safariService.getDestinations();
            res.json({ success: true, data: destinations });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching destinations' });
        }
    }

    async getDestinationBySlug(req, res) {
        try {
            const destination = await safariService.getDestinationDetails(req.params.slug);
            if (!destination) {
                return res.status(404).json({ success: false, message: 'Destination not found' });
            }
            res.json({ success: true, data: destination });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new SafariController();