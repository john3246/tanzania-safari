const db = require('../config/db');

class UserRepository {
    async findByEmail(email) {
        const query = `
            SELECT u.*, ur.role_name 
            FROM users u 
            LEFT JOIN user_roles ur ON u.role_id = ur.role_id 
            WHERE u.email = $1 AND u.is_active = true
        `;
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    async findById(id) {
        const query = `
            SELECT u.*, ur.role_name FROM users u 
            LEFT JOIN user_roles ur ON u.role_id = ur.role_id 
            WHERE u.user_id = $1 AND u.is_active = true
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async create(data) {
        const { email, password_hash, first_name, last_name, phone, role_id, country_id } = data;
        const query = `
            INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id, country_id, is_active, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
            RETURNING user_id
        `;
        const params = [email, password_hash, first_name, last_name, phone, role_id || 1, country_id || null];
        const result = await db.query(query, params);
        return result.rows[0];
    }

    async getAll() {
        const query = `
            SELECT u.user_id, u.email, u.first_name, u.last_name, u.phone, u.is_active, u.created_at,
                   c.country_name, ur.role_name
            FROM users u
            LEFT JOIN countries c ON u.country_id = c.country_id
            LEFT JOIN user_roles ur ON u.role_id = ur.role_id
            ORDER BY u.created_at DESC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async update(id, data) {
        const fields = [];
        const params = [];
        let index = 1;

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                fields.push(`${key} = $${index++}`);
                params.push(value);
            }
        });

        if (fields.length === 0) return;

        params.push(id);
        const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = $${index}`;
        await db.query(query, params);
    }

    async delete(id) {
        const query = 'DELETE FROM users WHERE user_id = $1';
        await db.query(query, [id]);
    }
}

module.exports = new UserRepository();
