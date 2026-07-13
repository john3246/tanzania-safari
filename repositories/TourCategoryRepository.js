const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class TourCategoryRepository extends BaseRepository {
    constructor() {
        super('tour_categories');
    }

    async findAllWithTourCount(conditions = {}, options = {}) {
        let query = `
            SELECT tc.*, 
                   COALESCE(tour_count.count, 0) as tour_count
            FROM tour_categories tc
            LEFT JOIN (
                SELECT category_id, COUNT(*) as count
                FROM tours
                WHERE deleted_at IS NULL AND is_active = TRUE
                GROUP BY category_id
            ) tour_count ON tc.id = tour_count.category_id
            WHERE tc.deleted_at IS NULL
        `;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `tc.${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        if (options.search) {
            query += ` AND (tc.name ILIKE $${index} OR tc.description ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.isActive !== undefined) {
            query += ` AND tc.is_active = $${index}`;
            values.push(options.isActive);
            index++;
        }

        query += ` GROUP BY tc.id`;

        if (options.orderBy) {
            query += ` ORDER BY tc.${options.orderBy}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY tc.display_order ASC, tc.name ASC`;
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

    async findBySlug(slug) {
        const query = `
            SELECT * FROM tour_categories
            WHERE slug = $1 AND deleted_at IS NULL
        `;
        const result = await db.query(query, [slug]);
        return result.rows[0];
    }

    async getActiveCategories() {
        const query = `
            SELECT * FROM tour_categories
            WHERE is_active = TRUE AND deleted_at IS NULL
            ORDER BY display_order ASC, name ASC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getFeaturedCategories(limit = 6) {
        const query = `
            SELECT tc.*, 
                   COALESCE(tour_count.count, 0) as tour_count
            FROM tour_categories tc
            LEFT JOIN (
                SELECT category_id, COUNT(*) as count
                FROM tours
                WHERE deleted_at IS NULL AND is_active = TRUE
                GROUP BY category_id
            ) tour_count ON tc.id = tour_count.category_id
            WHERE tc.is_active = TRUE AND tc.deleted_at IS NULL
            GROUP BY tc.id
            ORDER BY tc.display_order ASC, tc.name ASC
            LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows;
    }

    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM tour_categories WHERE deleted_at IS NULL`;
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

    async softDelete(id) {
        return this.update(id, { deleted_at: new Date() });
    }

    async restore(id) {
        return this.update(id, { deleted_at: null });
    }
}

module.exports = new TourCategoryRepository();
