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
            WHERE LOWER(u.email) = LOWER($1)
        `;
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    async findByUsername(username) {
        // username column may not exist — treat as email local-part lookup
        try {
            const result = await db.query(
                `SELECT u.*, r.role_name as role_name 
                 FROM users u
                 LEFT JOIN user_roles r ON u.role_id = r.role_id
                 WHERE LOWER(SPLIT_PART(u.email, '@', 1)) = LOWER($1)
                 LIMIT 1`,
                [username]
            );
            return result.rows[0];
        } catch {
            return null;
        }
    }

    async findByIdWithRole(id) {
        const query = `
            SELECT u.*, r.role_name as role_name 
            FROM users u
            LEFT JOIN user_roles r ON u.role_id = r.role_id
            WHERE u.user_id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async findAllWithRole(conditions = {}, options = {}) {
        let query = `
            SELECT u.*, r.role_name as role_name 
            FROM users u
            LEFT JOIN user_roles r ON u.role_id = r.role_id
            WHERE 1=1
        `;
        const values = [];
        let index = 1;

        // Default: show active users unless explicitly filtered
        if (conditions.is_active === undefined) {
            query += ` AND u.is_active = true`;
        }

        const keys = Object.keys(conditions);
        for (const key of keys) {
            values.push(conditions[key]);
            query += ` AND u.${key} = $${index++}`;
        }

        if (options.search) {
            query += ` AND (u.first_name ILIKE $${index} OR u.last_name ILIKE $${index} OR u.email ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.roleId) {
            query += ` AND u.role_id = $${index}`;
            values.push(options.roleId);
            index++;
        }

        query += ` ORDER BY u.${options.orderBy || 'created_at'} ${options.orderDirection || 'DESC'}`;

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
        const values = [];
        let index = 1;
        for (const key of Object.keys(conditions)) {
            values.push(conditions[key]);
            query += ` AND ${key} = $${index++}`;
        }
        const result = await db.query(query, values);
        return parseInt(result.rows[0].count, 10);
    }

    async getUserPermissions(userId) {
        const query = `
            SELECT r.permissions 
            FROM users u
            JOIN user_roles r ON u.role_id = r.role_id
            WHERE u.user_id = $1
        `;
        const result = await db.query(query, [userId]);
        if (!result.rows.length || !result.rows[0].permissions) return [];
        const perms = result.rows[0].permissions;
        if (typeof perms === 'string') {
            try { return JSON.parse(perms); } catch { return []; }
        }
        return Array.isArray(perms) ? perms : [];
    }

    async updateLastLogin(userId) {
        await db.query(`UPDATE users SET last_login = NOW() WHERE user_id = $1`, [userId]);
    }

    async softDelete(id) {
        return this.update(id, { is_active: false });
    }

    async restore(id) {
        return this.update(id, { is_active: true });
    }

    async listRoles() {
        const result = await db.query(
            `SELECT role_id, role_name, permissions FROM user_roles ORDER BY role_id`
        );
        return result.rows;
    }
}

module.exports = new UserRepository();
