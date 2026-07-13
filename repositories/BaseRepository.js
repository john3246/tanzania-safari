const db = require('../config/db');

class BaseRepository {
    constructor(tableName, idColumn = 'id') {
        this.tableName = tableName;
        this.idColumn = idColumn;
    }

    async findAll(conditions = {}, options = {}) {
        let query = `SELECT * FROM ${this.tableName}`;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `${key} = $${index++}`;
            }).join(' AND ');
            query += ` WHERE ${whereClause}`;
        }

        if (options.orderBy) {
            query += ` ORDER BY ${options.orderBy}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
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

    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE ${this.idColumn} = $1`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async findOne(conditions) {
        const result = await this.findAll(conditions, { limit: 1 });
        return result[0];
    }

    async create(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const columns = keys.join(', ');

        const query = `
            INSERT INTO ${this.tableName} (${columns})
            VALUES (${placeholders})
            RETURNING *
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    async update(id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        values.push(id); // ID is the last parameter

        const query = `
            UPDATE ${this.tableName}
            SET ${setClause}
            WHERE ${this.idColumn} = $${values.length}
            RETURNING *
        `;

        const result = await db.query(query, values);
        return result.rows[0];
    }

    async delete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE ${this.idColumn} = $1 RETURNING *`;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    // Support for Soft Deletes if column exists
    async softDelete(id) {
        return this.update(id, { deleted_at: new Date() });
    }
}

module.exports = BaseRepository;
