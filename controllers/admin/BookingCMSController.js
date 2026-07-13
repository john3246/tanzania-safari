const bookingCMSService = require('../../services/BookingCMSService');

class BookingCMSController {
    async list(req, res) {
        try {
            const { page = 1, limit = 20, search, status, tourId, userId, startDate, endDate, orderBy = 'created_at', orderDirection = 'DESC' } = req.query;
            
            const offset = (page - 1) * limit;
            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset),
                search,
                status: status ? parseInt(status) : undefined,
                tourId: tourId ? parseInt(tourId) : undefined,
                userId: userId ? parseInt(userId) : undefined,
                startDate,
                endDate,
                orderBy,
                orderDirection
            };

            const bookings = await bookingCMSService.getAll({}, options);
            const total = await bookingCMSService.count({});

            res.json({
                success: true,
                data: bookings,
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
            const booking = await bookingCMSService.create(req.body);
            res.status(201).json({ success: true, data: booking });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const booking = await bookingCMSService.getById(req.params.id);
            res.json({ success: true, data: booking });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async getByReference(req, res) {
        try {
            const booking = await bookingCMSService.findByReference(req.params.reference);
            if (!booking) {
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }
            res.json({ success: true, data: booking });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const booking = await bookingCMSService.update(req.params.id, req.body);
            res.json({ success: true, data: booking });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await bookingCMSService.softDelete(req.params.id);
            res.json({ success: true, message: 'Booking deleted' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async restore(req, res) {
        try {
            const booking = await bookingCMSService.restore(req.params.id);
            res.json({ success: true, data: booking });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { statusId } = req.body;
            const booking = await bookingCMSService.updateStatus(req.params.id, statusId);
            res.json({ success: true, data: booking });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getByStatus(req, res) {
        try {
            const { limit = 50 } = req.query;
            const bookings = await bookingCMSService.getByStatus(req.params.statusId, { limit: parseInt(limit) });
            res.json({ success: true, data: bookings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByTour(req, res) {
        try {
            const { limit = 50 } = req.query;
            const bookings = await bookingCMSService.getByTour(req.params.tourId, { limit: parseInt(limit) });
            res.json({ success: true, data: bookings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByUser(req, res) {
        try {
            const { limit = 50 } = req.query;
            const bookings = await bookingCMSService.getByUser(req.params.userId, { limit: parseInt(limit) });
            res.json({ success: true, data: bookings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({ success: false, message: 'Start date and end date required' });
            }
            const bookings = await bookingCMSService.getByDateRange(startDate, endDate);
            res.json({ success: true, data: bookings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getStats(req, res) {
        try {
            const stats = await bookingCMSService.getBookingStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getRevenueByMonth(req, res) {
        try {
            const year = parseInt(req.params.year) || new Date().getFullYear();
            const revenue = await bookingCMSService.getRevenueByMonth(year);
            res.json({ success: true, data: revenue });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getTopTours(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const tours = await bookingCMSService.getTopTours(limit);
            res.json({ success: true, data: tours });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new BookingCMSController();
