const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class DestinationRepository extends BaseRepository {
    constructor() {
        super('destinations');
    }

    async findAllWithTourCount(conditions = {}, options = {}) {
        let query = `
            SELECT d.*, 
                   COALESCE(tour_count.count, 0) as tour_count
            FROM destinations d
            LEFT JOIN (
                SELECT destination_id, COUNT(*) as count
                FROM tours
                WHERE deleted_at IS NULL AND is_active = TRUE
                GROUP BY destination_id
            ) tour_count ON d.id = tour_count.destination_id
            WHERE d.deleted_at IS NULL
        `;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `d.${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        if (options.search) {
            query += ` AND (d.name ILIKE $${index} OR d.short_description ILIKE $${index} OR d.description ILIKE $${index} OR d.region ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.country) {
            query += ` AND d.country = $${index}`;
            values.push(options.country);
            index++;
        }

        if (options.region) {
            query += ` AND d.region ILIKE $${index}`;
            values.push(`%${options.region}%`);
            index++;
        }

        if (options.isFeatured !== undefined) {
            query += ` AND d.is_featured = $${index}`;
            values.push(options.isFeatured);
            index++;
        }

        if (options.isActive !== undefined) {
            query += ` AND d.is_active = $${index}`;
            values.push(options.isActive);
            index++;
        }

        query += ` GROUP BY d.id`;

        if (options.orderBy) {
            query += ` ORDER BY d.${options.orderBy}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY d.display_order ASC, d.name ASC`;
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
            SELECT * FROM destinations
            WHERE slug = $1 AND deleted_at IS NULL
        `;
        const result = await db.query(query, [slug]);
        return result.rows[0];
    }

    async getActiveDestinations() {
        const query = `
            SELECT * FROM destinations
            WHERE is_active = TRUE AND deleted_at IS NULL
            ORDER BY display_order ASC, name ASC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getFeaturedDestinations(limit = 4) {
        const query = `
            SELECT d.*, 
                   COALESCE(tour_count.count, 0) as tour_count
            FROM destinations d
            LEFT JOIN (
                SELECT destination_id, COUNT(*) as count
                FROM tours
                WHERE deleted_at IS NULL AND is_active = TRUE
                GROUP BY destination_id
            ) tour_count ON d.id = tour_count.destination_id
            WHERE d.is_featured = TRUE AND d.is_active = TRUE AND d.deleted_at IS NULL
            GROUP BY d.id
            ORDER BY d.display_order ASC, d.name ASC
            LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows;
    }

    async getByRegion(region) {
        const query = `
            SELECT * FROM destinations
            WHERE region ILIKE $1 AND is_active = TRUE AND deleted_at IS NULL
            ORDER BY display_order ASC, name ASC
        `;
        const result = await db.query(query, [`%${region}%`]);
        return result.rows;
    }

    async getRegions() {
        const query = `
            SELECT DISTINCT region
            FROM destinations
            WHERE region IS NOT NULL AND deleted_at IS NULL
            ORDER BY region ASC
        `;
        const result = await db.query(query);
        return result.rows.map(row => row.region);
    }

    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM destinations WHERE deleted_at IS NULL`;
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

module.exports = new DestinationRepository();
