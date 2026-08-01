const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

/**
 * Matches schema in database/tanzania.sql:
 * log_id, user_id, action_performed, entity_type, entity_id,
 * old_values, new_values, ip_address, user_agent, created_at
 */
class AuditLogRepository extends BaseRepository {
    constructor() {
        super('audit_logs', 'log_id');
    }

    async create(data) {
        const result = await db.query(
            `INSERT INTO audit_logs
                (user_id, action_performed, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                data.user_id || null,
                data.action_performed || data.action || 'update',
                data.entity_type || null,
                data.entity_id || null,
                data.old_values ? JSON.stringify(data.old_values) : null,
                data.new_values ? JSON.stringify(data.new_values) : null,
                data.ip_address || null,
                data.user_agent || null
            ]
        );
        return result.rows[0];
    }

    async findAllWithDetails(conditions = {}, options = {}) {
        let query = `
            SELECT al.*,
                   u.first_name as actor_first_name,
                   u.last_name as actor_last_name,
                   u.email as actor_email
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.user_id
            WHERE 1=1
        `;
        const values = [];
        let index = 1;

        if (options.search) {
            query += ` AND (al.action_performed ILIKE $${index} OR al.entity_type ILIKE $${index} OR COALESCE(al.entity_id,'') ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.action) {
            query += ` AND al.action_performed = $${index}`;
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
            values.push(String(options.entityId));
            index++;
        }

        if (options.actorId) {
            query += ` AND al.user_id = $${index}`;
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

        query += ` ORDER BY al.created_at DESC`;

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

    async getRecentLogs(limit = 50) {
        return this.findAllWithDetails({}, { limit });
    }

    async getLogStats() {
        const result = await db.query(`
            SELECT
                COUNT(*)::int as total_logs,
                COUNT(DISTINCT user_id)::int as unique_actors,
                COUNT(DISTINCT entity_type)::int as unique_entities,
                COUNT(*) FILTER (WHERE action_performed ILIKE '%create%')::int as create_count,
                COUNT(*) FILTER (WHERE action_performed ILIKE '%update%')::int as update_count,
                COUNT(*) FILTER (WHERE action_performed ILIKE '%delete%')::int as delete_count
            FROM audit_logs
        `);
        return result.rows[0];
    }

    async count(conditions = {}) {
        const result = await db.query(`SELECT COUNT(*)::int as count FROM audit_logs`);
        return result.rows[0].count;
    }

    async getLogsByEntity(entityType, entityId, options = {}) {
        return this.findAllWithDetails({}, {
            ...options,
            entityType,
            entityId: entityId != null ? String(entityId) : undefined
        });
    }

    async getLogsByActor(actorId, options = {}) {
        return this.findAllWithDetails({}, { ...options, actorId });
    }

    async getLogsByAction(action, options = {}) {
        return this.findAllWithDetails({}, { ...options, action });
    }

    async getLogsByDateRange(startDate, endDate, options = {}) {
        return this.findAllWithDetails({}, { ...options, startDate, endDate });
    }

    async getLogsByEntityType() {
        const result = await db.query(`
            SELECT entity_type, COUNT(*)::int as count
            FROM audit_logs GROUP BY entity_type ORDER BY count DESC
        `);
        return result.rows;
    }

    async getLogsByAction() {
        const result = await db.query(`
            SELECT action_performed as action, COUNT(*)::int as count
            FROM audit_logs GROUP BY action_performed ORDER BY count DESC
        `);
        return result.rows;
    }
}

module.exports = new AuditLogRepository();
