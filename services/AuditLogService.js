const BaseService = require('./BaseService');
const auditLogRepository = require('../repositories/AuditLogRepository');

class AuditLogService extends BaseService {
    constructor() {
        super(auditLogRepository);
    }

    async getAll(conditions = {}, options = {}) {
        return await this.repository.findAllWithDetails(conditions, options);
    }

    async getById(id) {
        const log = await this.repository.findById(id);
        if (!log) {
            throw new Error('Audit log not found');
        }
        return log;
    }

    async getLogsByEntity(entityType, entityId, options = {}) {
        return await this.repository.getLogsByEntity(entityType, entityId, options);
    }

    async getLogsByActor(actorId, options = {}) {
        return await this.repository.getLogsByActor(actorId, options);
    }

    async getLogsByAction(action, options = {}) {
        return await this.repository.getLogsByAction(action, options);
    }

    async getLogsByDateRange(startDate, endDate, options = {}) {
        return await this.repository.getLogsByDateRange(startDate, endDate, options);
    }

    async getRecentLogs(limit = 50) {
        return await this.repository.getRecentLogs(limit);
    }

    async getLogStats() {
        return await this.repository.getLogStats();
    }

    async getLogsByEntityType() {
        return await this.repository.getLogsByEntityType();
    }

    async getLogsByAction() {
        return await this.repository.getLogsByAction();
    }

    async count(conditions = {}) {
        return await this.repository.count(conditions);
    }

    // Create a new audit log entry
    async createLog(data) {
        return await this.repository.create(data);
    }
}

module.exports = new AuditLogService();
