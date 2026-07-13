const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class TourCMSRepository extends BaseRepository {
    constructor() {
        super('tours');
    }

    async findAllWithDetails(conditions = {}, options = {}) {
        let query = `
            SELECT t.*, 
                   tc.name as category_name,
                   tc.slug as category_slug,
                   d.name as destination_name,
                   d.slug as destination_slug
            FROM tours t
            LEFT JOIN tour_categories tc ON t.category_id = tc.id
            LEFT JOIN destinations d ON t.destination_id = d.id
            WHERE t.deleted_at IS NULL
        `;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `t.${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        if (options.search) {
            query += ` AND (t.title ILIKE $${index} OR t.overview ILIKE $${index} OR t.description ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.categoryId) {
            query += ` AND t.category_id = $${index}`;
            values.push(options.categoryId);
            index++;
        }

        if (options.destinationId) {
            query += ` AND t.destination_id = $${index}`;
            values.push(options.destinationId);
            index++;
        }

        if (options.status) {
            query += ` AND t.status = $${index}`;
            values.push(options.status);
            index++;
        }

        if (options.isActive !== undefined) {
            query += ` AND t.is_active = $${index}`;
            values.push(options.isActive);
            index++;
        }

        if (options.isFeatured !== undefined) {
            query += ` AND t.is_featured = $${index}`;
            values.push(options.isFeatured);
            index++;
        }

        if (options.difficulty) {
            query += ` AND t.difficulty = $${index}`;
            values.push(options.difficulty);
            index++;
        }

        if (options.minPrice) {
            query += ` AND t.price_usd >= $${index}`;
            values.push(options.minPrice);
            index++;
        }

        if (options.maxPrice) {
            query += ` AND t.price_usd <= $${index}`;
            values.push(options.maxPrice);
            index++;
        }

        if (options.minDuration) {
            query += ` AND t.duration_days >= $${index}`;
            values.push(options.minDuration);
            index++;
        }

        if (options.maxDuration) {
            query += ` AND t.duration_days <= $${index}`;
            values.push(options.maxDuration);
            index++;
        }

        if (options.orderBy) {
            query += ` ORDER BY t.${options.orderBy}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY t.created_at DESC`;
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
            SELECT t.*, 
                   tc.name as category_name,
                   tc.slug as category_slug,
                   d.name as destination_name,
                   d.slug as destination_slug
            FROM tours t
            LEFT JOIN tour_categories tc ON t.category_id = tc.id
            LEFT JOIN destinations d ON t.destination_id = d.id
            WHERE t.slug = $1 AND t.deleted_at IS NULL
        `;
        const result = await db.query(query, [slug]);
        return result.rows[0];
    }

    async findByIdWithDetails(id) {
        const query = `
            SELECT t.*, 
                   tc.name as category_name,
                   tc.slug as category_slug,
                   d.name as destination_name,
                   d.slug as destination_slug
            FROM tours t
            LEFT JOIN tour_categories tc ON t.category_id = tc.id
            LEFT JOIN destinations d ON t.destination_id = d.id
            WHERE t.id = $1 AND t.deleted_at IS NULL
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async getRelatedTours(tourId, limit = 4) {
        const query = `
            SELECT t.id, t.title, t.slug, t.price_usd, t.duration_days, t.featured_image_url,
                   tc.name as category_name,
                   d.name as destination_name
            FROM tours t
            LEFT JOIN tour_categories tc ON t.category_id = tc.id
            LEFT JOIN destinations d ON t.destination_id = d.id
            WHERE t.id != $1 AND t.deleted_at IS NULL AND t.is_active = TRUE
            ORDER BY RANDOM()
            LIMIT $2
        `;
        const result = await db.query(query, [tourId, limit]);
        return result.rows;
    }

    async getRelatedTours(tourId, limit = 4) {
        const query = `
            SELECT t.id, t.title, t.slug, t.price_usd, t.duration_days, t.featured_image_url,
                   tc.name as category_name,
                   d.name as destination_name
            FROM tours t
            LEFT JOIN tour_categories tc ON t.category_id = tc.id
            LEFT JOIN destinations d ON t.destination_id = d.id
            WHERE t.id != $1 AND t.deleted_at IS NULL AND t.is_active = TRUE
            ORDER BY RANDOM()
            LIMIT $2
        `;
        const result = await db.query(query, [tourId, limit]);
        return result.rows;
    }

    async getActiveTours(options = {}) {
        const conditions = { is_active: true, status: 'published' };
        return this.findAllWithDetails(conditions, options);
    }

    async getFeaturedTours(limit = 6) {
        const query = `
            SELECT t.*, 
                   tc.name as category_name,
                   tc.slug as category_slug,
                   d.name as destination_name,
                   d.slug as destination_slug
            FROM tours t
            LEFT JOIN tour_categories tc ON t.category_id = tc.id
            LEFT JOIN destinations d ON t.destination_id = d.id
            WHERE t.is_featured = TRUE AND t.is_active = TRUE AND t.status = 'published' AND t.deleted_at IS NULL
            ORDER BY t.created_at DESC
            LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows;
    }

    async getRelatedToursByCategory(categoryId, tourId, limit = 4) {
        const query = `
            SELECT t.id, t.title, t.slug, t.price_usd, t.duration_days, t.featured_image_url
            FROM tours t
            WHERE t.category_id = $1 AND t.id != $2 AND t.is_active = TRUE AND t.status = 'published' AND t.deleted_at IS NULL
            ORDER BY RANDOM()
            LIMIT $3
        `;
        const result = await db.query(query, [categoryId, tourId, limit]);
        return result.rows;
    }

    async addRelatedTour(tourId, relatedTourId) {
        const query = `
            INSERT INTO related_tours (tour_id, related_tour_id)
            VALUES ($1, $2)
            ON CONFLICT (tour_id, related_tour_id) DO NOTHING
            RETURNING *
        `;
        const result = await db.query(query, [tourId, relatedTourId]);
        return result.rows[0];
    }

    async removeRelatedTour(tourId, relatedTourId) {
        const query = `
            DELETE FROM related_tours
            WHERE tour_id = $1 AND related_tour_id = $2
            RETURNING *
        `;
        const result = await db.query(query, [tourId, relatedTourId]);
        return result.rows[0];
    }

    async getRelatedToursList(tourId) {
        const query = `
            SELECT t.*
            FROM related_tours rt
            JOIN tours t ON rt.related_tour_id = t.id
            WHERE rt.tour_id = $1 AND t.deleted_at IS NULL
            ORDER BY t.title
        `;
        const result = await db.query(query, [tourId]);
        return result.rows;
    }

    async setRelatedTours(tourId, relatedTourIds) {
        await db.query('BEGIN');
        try {
            await db.query('DELETE FROM related_tours WHERE tour_id = $1', [tourId]);
            
            for (const relatedTourId of relatedTourIds) {
                await db.query(
                    'INSERT INTO related_tours (tour_id, related_tour_id) VALUES ($1, $2)',
                    [tourId, relatedTourId]
                );
            }
            
            await db.query('COMMIT');
            return await this.getRelatedToursList(tourId);
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }

    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM tours WHERE deleted_at IS NULL`;
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

    async publish(id) {
        return this.update(id, { status: 'published', published_at: new Date() });
    }

    async archive(id) {
        return this.update(id, { status: 'archived' });
    }
}

module.exports = new TourCMSRepository();
