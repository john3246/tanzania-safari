const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class RoleRepository extends BaseRepository {
    constructor() {
        super('roles');
    }

    async findAllWithPermissions(conditions = {}, options = {}) {
        let query = `
            SELECT r.*, 
                   COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}') as permissions
            FROM roles r
            LEFT JOIN role_permissions rp ON r.id = rp.role_id
            LEFT JOIN permissions p ON rp.permission_id = p.id
            WHERE 1=1
        `;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `r.${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        if (options.search) {
            query += ` AND (r.name ILIKE $${index} OR r.description ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        query += ` GROUP BY r.id`;

        if (options.orderBy) {
            query += ` ORDER BY r.${options.orderBy}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY r.created_at DESC`;
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

    async findByIdWithPermissions(id) {
        const query = `
            SELECT r.*, 
                   COALESCE(array_agg(DISTINCT p.id) FILTER (WHERE p.id IS NOT NULL), '{}') as permission_ids,
                   COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), '{}') as permissions
            FROM roles r
            LEFT JOIN role_permissions rp ON r.id = rp.role_id
            LEFT JOIN permissions p ON rp.permission_id = p.id
            WHERE r.id = $1
            GROUP BY r.id
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async getRolePermissions(roleId) {
        const query = `
            SELECT p.*
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = $1
            ORDER BY p.name
        `;
        const result = await db.query(query, [roleId]);
        return result.rows;
    }

    async assignPermission(roleId, permissionId) {
        const query = `
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES ($1, $2)
            ON CONFLICT (role_id, permission_id) DO NOTHING
            RETURNING *
        `;
        const result = await db.query(query, [roleId, permissionId]);
        return result.rows[0];
    }

    async removePermission(roleId, permissionId) {
        const query = `
            DELETE FROM role_permissions
            WHERE role_id = $1 AND permission_id = $2
            RETURNING *
        `;
        const result = await db.query(query, [roleId, permissionId]);
        return result.rows[0];
    }

    async setPermissions(roleId, permissionIds) {
        await db.query('BEGIN');
        try {
            // Remove existing permissions
            await db.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);
            
            // Add new permissions
            for (const permissionId of permissionIds) {
                await db.query(
                    'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
                    [roleId, permissionId]
                );
            }
            
            await db.query('COMMIT');
            return await this.findByIdWithPermissions(roleId);
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }

    async getUserCount(roleId) {
        const query = 'SELECT COUNT(*) as count FROM users WHERE role_id = $1 AND deleted_at IS NULL';
        const result = await db.query(query, [roleId]);
        return parseInt(result.rows[0].count);
    }
}

module.exports = new RoleRepository();
