const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class PermissionRepository extends BaseRepository {
    constructor() {
        super('permissions');
    }

    async findAllWithRoleCount(conditions = {}, options = {}) {
        let query = `
            SELECT p.*, 
                   COALESCE(rc.role_count, 0) as role_count
            FROM permissions p
            LEFT JOIN (
                SELECT rp.permission_id, COUNT(DISTINCT rp.role_id) as role_count
                FROM role_permissions rp
                GROUP BY rp.permission_id
            ) rc ON p.id = rc.permission_id
            WHERE 1=1
        `;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `p.${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        if (options.search) {
            query += ` AND (p.name ILIKE $${index} OR p.description ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.orderBy) {
            query += ` ORDER BY p.${options.orderBy}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY p.name ASC`;
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

    async getPermissionsByRole(roleId) {
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

    async groupByPrefix() {
        const query = `
            SELECT 
                SUBSTRING(name FROM 1 FOR POSITION('.' IN name) - 1) as prefix,
                array_agg(name ORDER BY name) as permissions
            FROM permissions
            WHERE name LIKE '%.%'
            GROUP BY prefix
            ORDER BY prefix
        `;
        const result = await db.query(query);
        return result.rows;
    }
}

module.exports = new PermissionRepository();
