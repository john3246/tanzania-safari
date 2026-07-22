const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class DestinationRepository extends BaseRepository {
    constructor() {
        super('national_parks', 'park_id');
    }

    // Helper to map DB row to CMS entity
    mapRow(row) {
        if (!row) return null;
        return {
            id: row.park_id,
            name: row.park_name,
            slug: row.park_slug,
            short_description: row.park_description ? row.park_description.substring(0, 200) : '',
            description: row.park_description,
            country: 'Tanzania',
            region: row.location,
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
            featured_image_url: row.featured_image_url,
            gallery_urls: row.gallery_urls || [],
            is_featured: row.is_featured,
            is_active: row.is_active,
            display_order: row.display_order,
            seo_title: row.meta_title,
            seo_description: row.meta_description,
            seo_keywords: Array.isArray(row.meta_keywords) ? row.meta_keywords.join(', ') : '',
            created_at: row.created_at,
            updated_at: row.updated_at,
            tour_count: row.tour_count !== undefined ? parseInt(row.tour_count) : undefined
        };
    }

    // Helper to map CMS data to DB payload
    mapPayload(data) {
        const payload = {};
        if (data.id !== undefined) payload.park_id = data.id;
        if (data.name !== undefined) payload.park_name = data.name;
        if (data.slug !== undefined) payload.park_slug = data.slug;
        if (data.description !== undefined) payload.park_description = data.description;
        if (data.region !== undefined) payload.location = data.region;
        if (data.latitude !== undefined) payload.latitude = data.latitude;
        if (data.longitude !== undefined) payload.longitude = data.longitude;
        if (data.featured_image_url !== undefined) payload.featured_image_url = data.featured_image_url;
        if (data.gallery_urls !== undefined) payload.gallery_urls = data.gallery_urls;
        if (data.is_featured !== undefined) payload.is_featured = data.is_featured;
        if (data.is_active !== undefined) payload.is_active = data.is_active;
        if (data.display_order !== undefined) payload.display_order = data.display_order;
        if (data.seo_title !== undefined) payload.meta_title = data.seo_title;
        if (data.seo_description !== undefined) payload.meta_description = data.seo_description;
        if (data.seo_keywords !== undefined) {
            payload.meta_keywords = data.seo_keywords.split(',').map(s => s.trim()).filter(Boolean);
        }
        return payload;
    }

    async findById(id) {
        const query = `SELECT * FROM national_parks WHERE park_id = $1`;
        const result = await db.query(query, [id]);
        return this.mapRow(result.rows[0]);
    }

    async findBySlug(slug) {
        const query = `SELECT * FROM national_parks WHERE park_slug = $1`;
        const result = await db.query(query, [slug]);
        return this.mapRow(result.rows[0]);
    }

    async create(data) {
        const payload = this.mapPayload(data);
        const keys = Object.keys(payload);
        const values = Object.values(payload);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
            INSERT INTO national_parks (${keys.join(', ')})
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
            UPDATE national_parks
            SET ${setClause}
            WHERE park_id = $${values.length}
            RETURNING *
        `;
        const result = await db.query(query, values);
        return this.mapRow(result.rows[0]);
    }

    async delete(id) {
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
            SELECT np.*, 
                   COALESCE(tour_count.count, 0) as tour_count
            FROM national_parks np
            LEFT JOIN (
                SELECT destination_id, COUNT(*) as count
                FROM (
                    -- Map safari_packages destinations
                    SELECT sp.package_id, pd.park_id as destination_id
                    FROM safari_packages sp
                    LEFT JOIN package_destinations pd ON sp.package_id = pd.package_id
                    WHERE sp.is_active = TRUE
                ) t
                GROUP BY destination_id
            ) tour_count ON np.park_id = tour_count.destination_id
            WHERE 1=1
        `;
        let values = [];
        let index = 1;

        if (options.search) {
            query += ` AND (np.park_name ILIKE $${index} OR np.park_description ILIKE $${index} OR np.location ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.isActive !== undefined) {
            query += ` AND np.is_active = $${index}`;
            values.push(options.isActive);
            index++;
        }

        if (options.isFeatured !== undefined) {
            query += ` AND np.is_featured = $${index}`;
            values.push(options.isFeatured);
            index++;
        }

        if (options.orderBy) {
            let orderCol = 'np.display_order';
            if (options.orderBy === 'name') orderCol = 'np.park_name';
            else if (options.orderBy === 'display_order') orderCol = 'np.display_order';
            
            query += ` ORDER BY ${orderCol}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY np.display_order ASC, np.park_name ASC`;
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

    async getActiveDestinations() {
        const query = `
            SELECT * FROM national_parks
            WHERE is_active = TRUE
            ORDER BY display_order ASC, park_name ASC
        `;
        const result = await db.query(query);
        return result.rows.map(row => this.mapRow(row));
    }

    async getFeaturedDestinations(limit = 4) {
        const query = `
            SELECT np.*, 
                   COALESCE(tour_count.count, 0) as tour_count
            FROM national_parks np
            LEFT JOIN (
                SELECT destination_id, COUNT(*) as count
                FROM (
                    SELECT sp.package_id, pd.park_id as destination_id
                    FROM safari_packages sp
                    LEFT JOIN package_destinations pd ON sp.package_id = pd.package_id
                    WHERE sp.is_active = TRUE
                ) t
                GROUP BY destination_id
            ) tour_count ON np.park_id = tour_count.destination_id
            WHERE np.is_featured = TRUE AND np.is_active = TRUE
            ORDER BY np.display_order ASC, np.park_name ASC
            LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows.map(row => this.mapRow(row));
    }

    async getByRegion(region) {
        const query = `
            SELECT * FROM national_parks
            WHERE location ILIKE $1 AND is_active = TRUE
            ORDER BY display_order ASC, park_name ASC
        `;
        const result = await db.query(query, [`%${region}%`]);
        return result.rows.map(row => this.mapRow(row));
    }

    async getRegions() {
        const query = `
            SELECT DISTINCT location as region
            FROM national_parks
            WHERE location IS NOT NULL
            ORDER BY location ASC
        `;
        const result = await db.query(query);
        return result.rows.map(row => row.region);
    }

    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM national_parks WHERE 1=1`;
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

module.exports = new DestinationRepository();
