const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class TourCategoryRepository extends BaseRepository {
    constructor() {
        super('package_categories', 'category_id');
    }

    // Helper to map DB row to CMS entity
    mapRow(row) {
        if (!row) return null;
        return {
            id: row.category_id,
            name: row.category_name,
            slug: row.category_slug,
            description: row.category_description,
            icon: row.icon_class,
            is_active: row.is_active,
            display_order: row.display_order,
            created_at: row.created_at,
            updated_at: row.updated_at,
            tour_count: row.tour_count !== undefined ? parseInt(row.tour_count) : undefined
        };
    }

    // Helper to map CMS data to DB payload
    mapPayload(data) {
        const payload = {};
        if (data.id !== undefined) payload.category_id = data.id;
        if (data.name !== undefined) payload.category_name = data.name;
        if (data.slug !== undefined) payload.category_slug = data.slug;
        if (data.description !== undefined) payload.category_description = data.description;
        if (data.icon !== undefined) payload.icon_class = data.icon;
        if (data.is_active !== undefined) payload.is_active = data.is_active;
        if (data.display_order !== undefined) payload.display_order = data.display_order;
        return payload;
    }

    async findById(id) {
        const query = `SELECT * FROM package_categories WHERE category_id = $1`;
        const result = await db.query(query, [id]);
        return this.mapRow(result.rows[0]);
    }

    async findBySlug(slug) {
        const query = `SELECT * FROM package_categories WHERE category_slug = $1`;
        const result = await db.query(query, [slug]);
        return this.mapRow(result.rows[0]);
    }

    async create(data) {
        const payload = this.mapPayload(data);
        const keys = Object.keys(payload);
        const values = Object.values(payload);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
            INSERT INTO package_categories (${keys.join(', ')})
            VALUES (${placeholders})
            RETURNING *
        `;
        const result = await db.query(query, values);
        return this.mapRow(result.rows[0]);
    }

    async update(id, data) {
        const payload = this.mapPayload(data);
        const keys = Object.keys(payload);
        const values = Object.values(payload);
        if (keys.length === 0) return this.findById(id);
        const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        values.push(id);
        const query = `
            UPDATE package_categories
            SET ${setClause}
            WHERE category_id = $${values.length}
            RETURNING *
        `;
        const result = await db.query(query, values);
        return this.mapRow(result.rows[0]);
    }

    async delete(id) {
        // Soft delete (sets is_active to false in legacy schema, as there is no deleted_at)
        return this.update(id, { is_active: false });
    }

    async softDelete(id) {
        return this.update(id, { is_active: false });
    }

    async restore(id) {
        return this.update(id, { is_active: true });
    }

    async findAllWithTourCount(conditions = {}, options = {}) {
        let query = `
            SELECT pc.*, 
                   COALESCE(tour_count.count, 0) as tour_count
            FROM package_categories pc
            LEFT JOIN (
                SELECT category_id, COUNT(*) as count
                FROM safari_packages
                WHERE is_active = TRUE
                GROUP BY category_id
            ) tour_count ON pc.category_id = tour_count.category_id
            WHERE 1=1
        `;
        let values = [];
        let index = 1;

        if (options.search) {
            query += ` AND (pc.category_name ILIKE $${index} OR pc.category_description ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.isActive !== undefined) {
            query += ` AND pc.is_active = $${index}`;
            values.push(options.isActive);
            index++;
        }

        if (options.orderBy) {
            // Map orderBy property
            let orderCol = 'pc.display_order';
            if (options.orderBy === 'name') orderCol = 'pc.category_name';
            else if (options.orderBy === 'display_order') orderCol = 'pc.display_order';
            
            query += ` ORDER BY ${orderCol}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY pc.display_order ASC, pc.category_name ASC`;
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
        return result.rows.map(row => this.mapRow(row));
    }

    async getActiveCategories() {
        const query = `
            SELECT * FROM package_categories
            WHERE is_active = TRUE
            ORDER BY display_order ASC, category_name ASC
        `;
        const result = await db.query(query);
        return result.rows.map(row => this.mapRow(row));
    }

    async getFeaturedCategories(limit = 6) {
        const query = `
            SELECT pc.*, 
                   COALESCE(tour_count.count, 0) as tour_count
            FROM package_categories pc
            LEFT JOIN (
                SELECT category_id, COUNT(*) as count
                FROM safari_packages
                WHERE is_active = TRUE
                GROUP BY category_id
            ) tour_count ON pc.category_id = tour_count.category_id
            WHERE pc.is_active = TRUE
            ORDER BY pc.display_order ASC, pc.category_name ASC
            LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows.map(row => this.mapRow(row));
    }

    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM package_categories WHERE 1=1`;
        let values = [];
        let index = 1;

        if (conditions.is_active !== undefined) {
            query += ` AND is_active = $${index++}`;
            values.push(conditions.is_active);
        }

        const result = await db.query(query, values);
        return parseInt(result.rows[0].count);
    }
}

module.exports = new TourCategoryRepository();
