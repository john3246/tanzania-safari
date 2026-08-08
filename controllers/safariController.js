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
            res.status(200).json({
                success: true,
                data: [],
                pagination: { total: 0, page: 1, limit: 9, pages: 0 },
                degraded: true
            });
        }
    }

    async getFeaturedPackages(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 6;
            const packages = await safariService.getFeaturedPackages(limit);
            res.json({ success: true, data: packages || [] });
        } catch (error) {
            console.error('Error in getFeaturedPackages:', error.message);
            // Soft-fail so homepage cards can fall back to SSR content / empty state
            res.status(200).json({ success: true, data: [], degraded: true });
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
            console.error('Error in getPackageBySlug:', error.message);
            res.status(500).json({ success: false, message: 'Error fetching package' });
        }
    }

    async getDestinations(req, res) {
        try {
            const destinations = await safariService.getDestinations();
            res.json({ success: true, data: destinations || [] });
        } catch (error) {
            console.error('Error in getDestinations:', error.message);
            res.status(200).json({ success: true, data: [], degraded: true });
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
            console.error('Error in getDestinationBySlug:', error.message);
            res.status(500).json({ success: false, message: 'Error fetching destination' });
        }
    }
}

module.exports = new SafariController();