const BaseService = require('./BaseService');
const reportsRepository = require('../repositories/ReportsRepository');

class ReportsService extends BaseService {
    constructor() {
        super(reportsRepository);
    }

    async getBookingsReport(filters = {}) {
        return await this.repository.getBookingsReport(filters);
    }

    async getToursReport(filters = {}) {
        return await this.repository.getToursReport(filters);
    }

    async getCustomersReport(filters = {}) {
        return await this.repository.getCustomersReport(filters);
    }

    async getEmailStatsReport(filters = {}) {
        return await this.repository.getEmailStatsReport(filters);
    }

    async getEmailStatsSummary() {
        return await this.repository.getEmailStatsSummary();
    }

    async getRevenueReport(filters = {}) {
        return await this.repository.getRevenueReport(filters);
    }

    async getDashboardStats() {
        return await this.repository.getDashboardStats();
    }
}

module.exports = new ReportsService();
