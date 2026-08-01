const auditLogService = require('../../services/AuditLogService');

class AuditLogController {
    async list(req, res) {
        try {
            const { page = 1, limit = 50, search, action, entityType, entityId, actorId, startDate, endDate, severity, orderBy = 'created_at', orderDirection = 'DESC' } = req.query;
            
            const offset = (page - 1) * limit;
            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset),
                search,
                action,
                entityType,
                entityId: entityId || undefined,
                actorId: actorId || undefined,
                startDate,
                endDate,
                severity,
                orderBy,
                orderDirection
            };

            const logs = await auditLogService.getAll({}, options);
            const total = await auditLogService.count({});

            res.json({
                success: true,
                data: logs,
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

    async getById(req, res) {
        try {
            const log = await auditLogService.getById(req.params.id);
            res.json({ success: true, data: log });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async getByEntity(req, res) {
        try {
            const { entityType, entityId } = req.params;
            const { limit = 50 } = req.query;
            const logs = await auditLogService.getLogsByEntity(entityType, entityId, { limit: parseInt(limit) });
            res.json({ success: true, data: logs });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByActor(req, res) {
        try {
            const { limit = 50 } = req.query;
            const logs = await auditLogService.getLogsByActor(req.params.actorId, { limit: parseInt(limit) });
            res.json({ success: true, data: logs });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByAction(req, res) {
        try {
            const { limit = 50 } = req.query;
            const logs = await auditLogService.getLogsByAction(req.params.action, { limit: parseInt(limit) });
            res.json({ success: true, data: logs });
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
            const logs = await auditLogService.getLogsByDateRange(startDate, endDate);
            res.json({ success: true, data: logs });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getRecent(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const logs = await auditLogService.getRecentLogs(limit);
            res.json({ success: true, data: logs });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getStats(req, res) {
        try {
            const stats = await auditLogService.getLogStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByEntityType(req, res) {
        try {
            const stats = await auditLogService.getLogsByEntityType();
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByActionStats(req, res) {
        try {
            const stats = await auditLogService.getLogsByAction();
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const log = await auditLogService.createLog(req.body);
            res.status(201).json({ success: true, data: log });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AuditLogController();
