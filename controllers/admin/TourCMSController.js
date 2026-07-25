const tourCMSService = require('../../services/TourCMSService');

class TourCMSController {
    async list(req, res) {
        try {
            const { 
                page = 1, 
                limit = 20, 
                search, 
                categoryId, 
                destinationId, 
                status, 
                isActive, 
                isFeatured, 
                difficulty,
                minPrice,
                maxPrice,
                minDuration,
                maxDuration,
                orderBy = 'created_at', 
                orderDirection = 'DESC' 
            } = req.query;
            
            const offset = (page - 1) * limit;
            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset),
                search,
                categoryId: categoryId ? parseInt(categoryId) : undefined,
                destinationId: destinationId ? parseInt(destinationId) : undefined,
                status,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
                difficulty,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                minDuration: minDuration ? parseInt(minDuration) : undefined,
                maxDuration: maxDuration ? parseInt(maxDuration) : undefined,
                orderBy,
                orderDirection
            };

            const tours = await tourCMSService.getAll({}, options);
            const total = await tourCMSService.count({});

            res.json({
                success: true,
                data: tours,
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
            const tour = await tourCMSService.create(req.body);
            res.status(201).json({ success: true, data: tour });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const tour = await tourCMSService.getById(req.params.id);
            tour.related_tours = await tourCMSService.getRelatedToursList(req.params.id);
            res.json({ success: true, data: tour });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async getBySlug(req, res) {
        try {
            const tour = await tourCMSService.findBySlug(req.params.slug);
            if (!tour) {
                return res.status(404).json({ success: false, message: 'Tour not found' });
            }
            tour.related_tours = await tourCMSService.getRelatedToursList(tour.id);
            res.json({ success: true, data: tour });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const tour = await tourCMSService.update(req.params.id, req.body);
            res.json({ success: true, data: tour });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await tourCMSService.delete(req.params.id);
            res.json({ success: true, message: 'Tour permanently removed from database' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async restore(req, res) {
        try {
            const tour = await tourCMSService.restore(req.params.id);
            res.json({ success: true, data: tour });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async publish(req, res) {
        try {
            const tour = await tourCMSService.publish(req.params.id);
            res.json({ success: true, data: tour });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async archive(req, res) {
        try {
            const tour = await tourCMSService.archive(req.params.id);
            res.json({ success: true, data: tour });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getActive(req, res) {
        try {
            const { limit, category, destination } = req.query;
            const options = {
                limit: limit ? parseInt(limit) : undefined,
                categoryId: category ? parseInt(category) : undefined,
                destinationId: destination ? parseInt(destination) : undefined
            };
            const tours = await tourCMSService.getActiveTours(options);
            res.json({ success: true, data: tours });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getFeatured(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 6;
            const tours = await tourCMSService.getFeaturedTours(limit);
            res.json({ success: true, data: tours });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getRelated(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 4;
            const tours = await tourCMSService.getRelatedTours(req.params.id, limit);
            res.json({ success: true, data: tours });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async addRelatedTour(req, res) {
        try {
            const { relatedTourId } = req.body;
            const result = await tourCMSService.addRelatedTour(req.params.id, relatedTourId);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async removeRelatedTour(req, res) {
        try {
            const result = await tourCMSService.removeRelatedTour(req.params.id, req.params.relatedTourId);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async setRelatedTours(req, res) {
        try {
            const { relatedTourIds } = req.body;
            const tours = await tourCMSService.setRelatedTours(req.params.id, relatedTourIds);
            res.json({ success: true, data: tours });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new TourCMSController();
