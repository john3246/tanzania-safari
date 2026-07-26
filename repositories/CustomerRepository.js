const db = require('../config/db');

class CustomerRepository {
    async upsert({ name, email, phone = null, source = 'website' }) {
        if (!email) return null;
        const cleanEmail = String(email).trim().toLowerCase();
        const cleanName = (name || '').trim() || null;

        const existing = await db.query(
            'SELECT * FROM customers WHERE LOWER(email) = $1',
            [cleanEmail]
        );

        if (existing.rows.length > 0) {
            const result = await db.query(
                `UPDATE customers SET
                    name = COALESCE($2, name),
                    phone = COALESCE($3, phone),
                    source = CASE WHEN source = 'newsletter' AND $4 <> 'newsletter' THEN $4 ELSE source END,
                    updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1
                 RETURNING *`,
                [existing.rows[0].id, cleanName, phone, source]
            );
            return result.rows[0];
        }

        const result = await db.query(
            `INSERT INTO customers (name, email, phone, source)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [cleanName, cleanEmail, phone, source]
        );
        return result.rows[0];
    }

    async upsertFromChat({ name, email }) {
        return this.upsert({ name, email, source: 'chat' });
    }

    async upsertFromNewsletter(email) {
        return this.upsert({ name: null, email, source: 'newsletter' });
    }

    async upsertFromEnquiry({ name, email, phone }) {
        return this.upsert({ name, email, phone, source: 'enquiry' });
    }

    async upsertFromBooking({ name, email, phone }) {
        return this.upsert({ name, email, phone, source: 'booking' });
    }

    async findAll({ search = '', limit = 200, offset = 0 } = {}) {
        const params = [];
        let where = '';
        if (search) {
            params.push(`%${search}%`);
            where = `WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1`;
        }
        params.push(limit);
        params.push(offset);
        const limIdx = params.length - 1;
        const offIdx = params.length;

        const result = await db.query(
            `SELECT * FROM customers
             ${where}
             ORDER BY updated_at DESC
             LIMIT $${limIdx} OFFSET $${offIdx}`,
            params
        );
        return result.rows;
    }
}

module.exports = new CustomerRepository();
