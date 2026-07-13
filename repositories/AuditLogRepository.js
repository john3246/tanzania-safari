const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class AuditLogRepository extends BaseRepository {
    constructor() {
        super('audit_logs');
    }

    async findAllWithDetails(conditions = {}, options = {}) {
        let query = `
            SELECT al.*, 
                   u.username as actor_username,
                   u.first_name as actor_first_name,
                   u.last_name as actor_last_name,
                   u.email as actor_email
            FROM audit_logs al
            LEFT JOIN users u ON al.actor_id = u.id
            WHERE 1=1
        `;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `al.${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        if (options.search) {
            query += ` AND (al.action ILIKE $${index} OR al.entity_type ILIKE $${index} OR al.description ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.action) {
            query += ` AND al.action = $${index}`;
            values.push(options.action);
            index++;
        }

        if (options.entityType) {
            query += ` AND al.entity_type = $${index}`;
            values.push(options.entityType);
            index++;
        }

        if (options.entityId) {
            query += ` AND al.entity_id = $${index}`;
            values.push(options.entityId);
            index++;
        }

        if (options.actorId) {
            query += ` AND al.actor_id = $${index}`;
            values.push(options.actorId);
            index++;
        }

        if (options.startDate) {
            query += ` AND al.created_at >= $${index}`;
            values.push(options.startDate);
            index++;
        }

        if (options.endDate) {
            query += ` AND al.created_at <= $${index}`;
            values.push(options.endDate);
            index++;
        }

        if (options.severity) {
            query += ` AND al.severity = $${index}`;
            values.push(options.severity);
            index++;
        }

        if (options.orderBy) {
            query += ` ORDER BY al.${options.orderBy}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY al.created_at DESC`;
        }

        if (options.limit) {
            query += ` LIMIT $${index++}`;
            values.push(options.limit);
        }

        if (options.offset) {
            query += ` OFFSET $${index++}`;
            values.push(options.offset);
        }

        const result = await db.query(query, values);
        return result.rows;
    }

    async getLogsByEntity(entityType, entityId, options = {}) {
        return this.findAllWithDetails({ entity_type: entityType, entity_id: entityId }, options);
    }

    async getLogsByActor(actorId, options = {}) {
        return this.findAllWithDetails({ actor_id: actorId }, options);
    }

    async getLogsByAction(action, options = {}) {
        return this.findAllWithDetails({ action }, options);
    }

    async getLogsByDateRange(startDate, endDate, options = {}) {
        return this.findAllWithDetails({}, { ...options, startDate, endDate });
    }

    async getRecentLogs(limit = 50) {
        return this.findAllWithDetails({}, { limit, orderBy: 'created_at', orderDirection: 'DESC' });
    }

    async getLogStats() {
        const query = `
            SELECT 
                COUNT(*) as total_logs,
                COUNT(DISTINCT actor_id) as unique_actors,
                COUNT(DISTINCT entity_type) as unique_entities,
                COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity_count,
                COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_severity_count,
                COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_severity_count,
                COUNT(CASE WHEN action = 'create' THEN 1 END) as create_count,
                COUNT(CASE WHEN action = 'update' THEN 1 END) as update_count,
                COUNT(CASE WHEN action = 'delete' THEN 1 END) as delete_count,
                COUNT(CASE WHEN action = 'view' THEN 1 END) as view_count
            FROM audit_logs
        `;
        const result = await db.query(query);
        return result.rows[0];
    }

    async getLogsByEntityType() {
        const query = `
            SELECT entity_type, COUNT(*) as count
            FROM audit_logs
            GROUP BY entity_type
            ORDER BY count DESC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getLogsByAction() {
        const query = `
            SELECT action, COUNT(*) as count
            FROM audit_logs
            GROUP BY action
            ORDER BY count DESC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM audit_logs WHERE 1=1`;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        const result = await db.query(query, values);
        return parseInt(result.rows[0].count);
    }

    // Audit logs are read-only, no delete/update methods
}

module.exports = new AuditLogRepository();
