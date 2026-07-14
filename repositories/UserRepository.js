const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class UserRepository extends BaseRepository {
    constructor() {
        super('users', 'user_id');
    }

    async findByEmail(email) {
        const query = `
            SELECT u.*, r.role_name as role_name 
            FROM users u
            LEFT JOIN user_roles r ON u.role_id = r.role_id
            WHERE u.email = $1 AND u.is_active = true
        `;
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    async findByUsername(username) {
        const query = `
            SELECT u.*, r.role_name as role_name 
            FROM users u
            LEFT JOIN user_roles r ON u.role_id = r.role_id
            WHERE u.username = $1 AND u.is_active = true
        `;
        const result = await db.query(query, [username]);
        return result.rows[0];
    }

    async findByIdWithRole(id) {
        const query = `
            SELECT u.*, r.role_name as role_name 
            FROM users u
            LEFT JOIN user_roles r ON u.role_id = r.role_id
            WHERE u.user_id = $1 AND u.is_active = true
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async findAllWithRole(conditions = {}, options = {}) {
        let query = `
            SELECT u.*, r.role_name as role_name 
            FROM users u
            LEFT JOIN user_roles r ON u.role_id = r.role_id
            WHERE u.is_active = true
        `;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `u.${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        if (options.search) {
            query += ` AND (u.first_name ILIKE $${index} OR u.last_name ILIKE $${index} OR u.email ILIKE $${index} OR u.username ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.roleId) {
            query += ` AND u.role_id = $${index}`;
            values.push(options.roleId);
            index++;
        }

        if (options.orderBy) {
            query += ` ORDER BY u.${options.orderBy}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY u.created_at DESC`;
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

    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM users WHERE is_active = true`;
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

    async getUserPermissions(userId) {
        const query = `
            SELECT r.permissions 
            FROM users u
            JOIN user_roles r ON u.role_id = r.role_id
            WHERE u.user_id = $1
        `;
        const result = await db.query(query, [userId]);
        if (result.rows.length === 0 || !result.rows[0].permissions) {
            return [];
        }
        
        // If it's a JSON string or JSONB array, return it parsed or directly
        const perms = result.rows[0].permissions;
        if (typeof perms === 'string') {
            try { return JSON.parse(perms); } catch (e) { return []; }
        }
        return Array.isArray(perms) ? perms : [];
    }

    async updateLastLogin(userId) {
        const query = `UPDATE users SET last_login = NOW() WHERE id = $1`;
        await db.query(query, [userId]);
    }

    async softDelete(id) {
        return this.update(id, { is_active: false });
    }

    async restore(id) {
        return this.update(id, { is_active: true });
    }
}

module.exports = new UserRepository();
