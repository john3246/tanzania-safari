const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class DestinationRepository extends BaseRepository {
    constructor() {
        super('national_parks', 'park_id');
    }

    // Helper to map DB row to CMS entity (keep park_* aliases for public front-end)
    mapRow(row) {
        if (!row) return null;
        const images = Array.isArray(row.image_urls)
            ? row.image_urls.filter(Boolean)
            : (typeof row.image_urls === 'string' ? (() => { try { return JSON.parse(row.image_urls); } catch { return []; } })() : []);
        const featured = row.image_url || images[0] || null;
        return {
            id: row.park_id,
            park_id: row.park_id,
            name: row.park_name,
            park_name: row.park_name,
            slug: row.park_slug,
            park_slug: row.park_slug,
            short_description: row.park_description ? row.park_description.substring(0, 200) : '',
            description: row.park_description,
            park_description: row.park_description,
            country: 'Tanzania',
            region: row.park_location || '',
            park_location: row.park_location || '',
            latitude: null,
            longitude: null,
            featured_image_url: featured,
            image_url: featured,
            image_urls: images,
            gallery_urls: images,
            is_featured: row.is_unesco_heritage || false,
            is_unesco_heritage: row.is_unesco_heritage || false,
            is_active: row.is_active,
            size_sq_km: row.size_sq_km,
            established_year: row.established_year,
            best_season: row.best_season,
            wildlife_highlights: row.wildlife_highlights,
            display_order: 0,
            seo_title: '',
            seo_description: '',
            seo_keywords: '',
            created_at: row.created_at,
            updated_at: row.updated_at,
            tour_count: row.tour_count !== undefined ? parseInt(row.tour_count) : undefined,
            safari_count: row.safari_count !== undefined
                ? parseInt(row.safari_count)
                : (row.tour_count !== undefined ? parseInt(row.tour_count) : 0)
        };
    }

    // Helper to map CMS data to DB payload
    mapPayload(data) {
        const payload = {};
        if (data.id !== undefined) payload.park_id = data.id;
        if (data.name !== undefined) payload.park_name = data.name;
        if (data.slug !== undefined) payload.park_slug = data.slug;
        if (data.description !== undefined) payload.park_description = data.description;
        if (data.region !== undefined) payload.park_location = data.region;
        if (data.is_featured !== undefined) payload.is_unesco_heritage = data.is_featured;
        if (data.is_active !== undefined) payload.is_active = data.is_active;
        if (data.gallery_urls !== undefined) payload.image_urls = data.gallery_urls;
        else if (data.featured_image_url !== undefined) payload.image_urls = [data.featured_image_url];
        return payload;
    }

    async findById(id) {
        const query = `SELECT * FROM national_parks WHERE park_id = $1`;
        const result = await db.query(query, [id]);
        return this.mapRow(result.rows[0]);
    }

    async findBySlug(slug) {
        const query = `SELECT np.*,
                   COUNT(DISTINCT CASE WHEN sp.is_active = TRUE THEN pd.package_id END) AS safari_count,
                   COALESCE(np.image_urls[1], '/images/destinations/' || np.park_slug || '/main.jpg') AS image_url
            FROM national_parks np
            LEFT JOIN package_destinations pd ON np.park_id = pd.park_id
            LEFT JOIN safari_packages sp ON pd.package_id = sp.package_id
            WHERE np.park_slug = $1
            GROUP BY np.park_id`;
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
        try {
            await db.query('DELETE FROM package_destinations WHERE park_id = $1', [id]);
        } catch (e) {}
        const result = await db.query('DELETE FROM national_parks WHERE park_id = $1 RETURNING *', [id]);
        return result.rows ? result.rows[0] : null;
    }

    async softDelete(id) {
        return this.delete(id);
    }

    async togglePublish(id, is_active) {
        return this.update(id, { is_active: Boolean(is_active) });
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
            query += ` AND (np.park_name ILIKE $${index} OR np.park_description ILIKE $${index} OR np.park_location ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.isActive !== undefined) {
            query += ` AND np.is_active = $${index}`;
            values.push(options.isActive);
            index++;
        }

        if (options.isFeatured !== undefined) {
            query += ` AND np.is_unesco_heritage = $${index}`;
            values.push(options.isFeatured);
            index++;
        }

        if (options.orderBy) {
            let orderCol = 'np.park_name';
            if (options.orderBy === 'name') orderCol = 'np.park_name';
            query += ` ORDER BY ${orderCol}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY np.park_name ASC`;
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
            SELECT np.*,
                   COUNT(DISTINCT CASE WHEN sp.is_active = TRUE THEN pd.package_id END) AS safari_count,
                   COALESCE(np.image_urls[1], '/images/destinations/' || np.park_slug || '/main.jpg') AS image_url
            FROM national_parks np
            LEFT JOIN package_destinations pd ON np.park_id = pd.park_id
            LEFT JOIN safari_packages sp ON pd.package_id = sp.package_id
            WHERE np.is_active = TRUE
            GROUP BY np.park_id
            ORDER BY np.park_name ASC
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
            WHERE np.is_unesco_heritage = TRUE AND np.is_active = TRUE
            ORDER BY np.park_name ASC
            LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows.map(row => this.mapRow(row));
    }

    async getByRegion(region) {
        const query = `
            SELECT * FROM national_parks
            WHERE park_location ILIKE $1 AND is_active = TRUE
            ORDER BY park_name ASC
        `;
        const result = await db.query(query, [`%${region}%`]);
        return result.rows.map(row => this.mapRow(row));
    }

    async getRegions() {
        const query = `
            SELECT DISTINCT park_location as region
            FROM national_parks
            WHERE park_location IS NOT NULL
            ORDER BY park_location ASC
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
