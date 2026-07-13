const reportsService = require('../../services/ReportsService');

class ReportsController {
    async getBookingsReport(req, res) {
        try {
            const { startDate, endDate, status, tourId, limit } = req.query;
            const filters = {
                startDate,
                endDate,
                status: status ? parseInt(status) : undefined,
                tourId: tourId ? parseInt(tourId) : undefined,
                limit: limit ? parseInt(limit) : undefined
            };
            const report = await reportsService.getBookingsReport(filters);
            res.json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getToursReport(req, res) {
        try {
            const { categoryId, destinationId, isActive, limit } = req.query;
            const filters = {
                categoryId: categoryId ? parseInt(categoryId) : undefined,
                destinationId: destinationId ? parseInt(destinationId) : undefined,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                limit: limit ? parseInt(limit) : undefined
            };
            const report = await reportsService.getToursReport(filters);
            res.json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getCustomersReport(req, res) {
        try {
            const { roleId, startDate, endDate, limit } = req.query;
            const filters = {
                roleId: roleId ? parseInt(roleId) : undefined,
                startDate,
                endDate,
                limit: limit ? parseInt(limit) : undefined
            };
            const report = await reportsService.getCustomersReport(filters);
            res.json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getEmailStatsReport(req, res) {
        try {
            const { startDate, endDate, status, templateId, limit } = req.query;
            const filters = {
                startDate,
                endDate,
                status,
                templateId: templateId ? parseInt(templateId) : undefined,
                limit: limit ? parseInt(limit) : undefined
            };
            const report = await reportsService.getEmailStatsReport(filters);
            res.json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getEmailStatsSummary(req, res) {
        try {
            const summary = await reportsService.getEmailStatsSummary();
            res.json({ success: true, data: summary });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getRevenueReport(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const filters = { startDate, endDate };
            const report = await reportsService.getRevenueReport(filters);
            res.json({ success: true, data: report });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getDashboardStats(req, res) {
        try {
            const stats = await reportsService.getDashboardStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new ReportsController();
