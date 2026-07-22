const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class TourCMSRepository extends BaseRepository {
    constructor() {
        super('safari_packages', 'package_id');
    }

    // Helper to map DB row to CMS entity
    mapRow(row) {
        if (!row) return null;
        return {
            id: row.package_id,
            title: row.package_name,
            slug: row.package_slug,
            overview: row.short_description,
            description: row.detailed_description,
            price_usd: parseFloat(row.base_price_usd),
            duration_days: row.duration_days,
            duration_nights: row.duration_nights,
            category_id: row.category_id,
            destination_id: row.destination_id || null,
            difficulty: row.difficulty_level,
            group_size_min: row.minimum_pax,
            group_size_max: row.maximum_pax,
            age_minimum: row.child_age_limit || 6,
            highlights: row.highlights || [],
            included: row.included_features || [],
            excluded: row.excluded_features || [],
            travel_tips: row.best_months ? row.best_months.split(',').map(s => s.trim()) : [],
            itinerary: row.itinerary || [],
            faqs: [],
            featured_image_url: row.featured_image_url,
            gallery_urls: row.image_urls || [],
            gallery_order: [],
            is_featured: row.is_featured,
            is_active: row.is_active,
            status: row.is_active ? 'published' : 'draft',
            seo_title: row.meta_title,
            seo_description: row.meta_description,
            seo_keywords: Array.isArray(row.meta_keywords) ? row.meta_keywords.join(', ') : '',
            created_at: row.created_at,
            updated_at: row.updated_at,
            category_name: row.category_name || null,
            category_slug: row.category_slug || null,
            destination_name: row.destination_name || null,
            destination_slug: row.destination_slug || null
        };
    }

    // Helper to map CMS data to DB payload
    mapPayload(data) {
        const payload = {};
        if (data.id !== undefined) payload.package_id = data.id;
        if (data.title !== undefined) payload.package_name = data.title;
        if (data.slug !== undefined) payload.package_slug = data.slug;
        if (data.overview !== undefined) payload.short_description = data.overview;
        if (data.description !== undefined) payload.detailed_description = data.description;
        if (data.price_usd !== undefined) payload.base_price_usd = data.price_usd;
        if (data.duration_days !== undefined) payload.duration_days = data.duration_days;
        if (data.duration_nights !== undefined) {
            payload.duration_nights = data.duration_nights !== null ? data.duration_nights : Math.max(0, (data.duration_days || 1) - 1);
        } else if (data.duration_days !== undefined) {
            payload.duration_nights = Math.max(0, data.duration_days - 1);
        }
        if (data.category_id !== undefined) payload.category_id = data.category_id;
        if (data.difficulty !== undefined) payload.difficulty_level = data.difficulty;
        if (data.group_size_min !== undefined) payload.minimum_pax = data.group_size_min;
        if (data.group_size_max !== undefined) payload.maximum_pax = data.group_size_max;
        if (data.age_minimum !== undefined) payload.child_age_limit = data.age_minimum;
        if (data.highlights !== undefined) payload.highlights = data.highlights;
        if (data.included !== undefined) payload.included_features = data.included;
        if (data.excluded !== undefined) payload.excluded_features = data.excluded;
        if (data.travel_tips !== undefined) payload.best_months = data.travel_tips.join(', ');
        if (data.featured_image_url !== undefined) payload.featured_image_url = data.featured_image_url;
        if (data.gallery_urls !== undefined) payload.image_urls = data.gallery_urls;
        if (data.is_featured !== undefined) payload.is_featured = data.is_featured;
        if (data.is_active !== undefined) payload.is_active = data.is_active;
        if (data.seo_title !== undefined) payload.meta_title = data.seo_title;
        if (data.seo_description !== undefined) payload.meta_description = data.seo_description;
        if (data.seo_keywords !== undefined) {
            payload.meta_keywords = data.seo_keywords.split(',').map(s => s.trim()).filter(Boolean);
        }
        return payload;
    }

    async findAllWithDetails(conditions = {}, options = {}) {
        let query = `
            SELECT sp.*, 
                   pc.category_name as category_name,
                   pc.category_slug as category_slug,
                   np.park_name as destination_name,
                   np.park_slug as destination_slug,
                   pd.park_id as destination_id
            FROM safari_packages sp
            LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
            LEFT JOIN package_destinations pd ON sp.package_id = pd.package_id
            LEFT JOIN national_parks np ON pd.park_id = np.park_id
            WHERE 1=1
        `;
        let values = [];
        let index = 1;

        if (options.search) {
            query += ` AND (sp.package_name ILIKE $${index} OR sp.short_description ILIKE $${index} OR sp.detailed_description ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.categoryId) {
            query += ` AND sp.category_id = $${index}`;
            values.push(options.categoryId);
            index++;
        }

        if (options.destinationId) {
            query += ` AND pd.park_id = $${index}`;
            values.push(options.destinationId);
            index++;
        }

        if (options.isActive !== undefined) {
            query += ` AND sp.is_active = $${index}`;
            values.push(options.isActive);
            index++;
        }

        if (options.isFeatured !== undefined) {
            query += ` AND sp.is_featured = $${index}`;
            values.push(options.isFeatured);
            index++;
        }

        if (options.status) {
            const isAct = options.status === 'published';
            query += ` AND sp.is_active = $${index}`;
            values.push(isAct);
            index++;
        }

        query += ` ORDER BY sp.created_at DESC`;

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

    async findBySlug(slug) {
        const query = `
            SELECT sp.*, 
                   pc.category_name as category_name,
                   pc.category_slug as category_slug,
                   np.park_name as destination_name,
                   np.park_slug as destination_slug,
                   pd.park_id as destination_id
            FROM safari_packages sp
            LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
            LEFT JOIN package_destinations pd ON sp.package_id = pd.package_id
            LEFT JOIN national_parks np ON pd.park_id = np.park_id
            WHERE sp.package_slug = $1
        `;
        const result = await db.query(query, [slug]);
        const tour = this.mapRow(result.rows[0]);
        if (tour) {
            tour.itinerary = await this.getItineraryList(tour.id);
        }
        return tour;
    }

    async findByIdWithDetails(id) {
        const query = `
            SELECT sp.*, 
                   pc.category_name as category_name,
                   pc.category_slug as category_slug,
                   np.park_name as destination_name,
                   np.park_slug as destination_slug,
                   pd.park_id as destination_id
            FROM safari_packages sp
            LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
            LEFT JOIN package_destinations pd ON sp.package_id = pd.package_id
            LEFT JOIN national_parks np ON pd.park_id = np.park_id
            WHERE sp.package_id = $1
        `;
        const result = await db.query(query, [id]);
        const tour = this.mapRow(result.rows[0]);
        if (tour) {
            tour.itinerary = await this.getItineraryList(id);
        }
        return tour;
    }

    async getItineraryList(packageId) {
        const query = `
            SELECT day_number as day, day_title as title, day_description as description
            FROM package_itinerary
            WHERE package_id = $1
            ORDER BY day_number ASC
        `;
        const result = await db.query(query, [packageId]);
        return result.rows;
    }

    async create(data) {
        const payload = this.mapPayload(data);
        const keys = Object.keys(payload);
        const values = Object.values(payload);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
            INSERT INTO safari_packages (${keys.join(', ')})
            VALUES (${placeholders})
            RETURNING *
        `;
        const result = await db.query(query, values);
        const tour = this.mapRow(result.rows[0]);

        if (data.destination_id) {
            await db.query(`
                INSERT INTO package_destinations (package_id, park_id, visit_day, activities)
                VALUES ($1, $2, 1, ARRAY[]::text[])
            `, [tour.id, data.destination_id]);
        }

        if (data.itinerary) {
            await this.saveItineraryList(tour.id, data.itinerary);
        }

        return this.findByIdWithDetails(tour.id);
    }

    async update(id, data) {
        const payload = this.mapPayload(data);
        const keys = Object.keys(payload);
        const values = Object.values(payload);
        
        if (keys.length > 0) {
            const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
            values.push(id);
            const query = `
                UPDATE safari_packages
                SET ${setClause}
                WHERE package_id = $${values.length}
                RETURNING *
            `;
            await db.query(query, values);
        }

        if (data.destination_id !== undefined) {
            await db.query(`DELETE FROM package_destinations WHERE package_id = $1`, [id]);
            if (data.destination_id) {
                await db.query(`
                    INSERT INTO package_destinations (package_id, park_id, visit_day, activities)
                    VALUES ($1, $2, 1, ARRAY[]::text[])
                `, [id, data.destination_id]);
            }
        }

        if (data.itinerary !== undefined) {
            await this.saveItineraryList(id, data.itinerary);
        }

        return this.findByIdWithDetails(id);
    }

    async saveItineraryList(packageId, itinerary) {
        await db.query(`DELETE FROM package_itinerary WHERE package_id = $1`, [packageId]);
        for (const item of itinerary) {
            await db.query(`
                INSERT INTO package_itinerary (package_id, day_number, day_title, day_description)
                VALUES ($1, $2, $3, $4)
            `, [packageId, item.day, item.title, item.description]);
        }
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

    async publish(id) {
        return this.update(id, { is_active: true });
    }

    async archive(id) {
        return this.update(id, { is_active: false });
    }

    async getRelatedToursList(id) {
        return []; // Related packages doesn't exist natively on legacy schema, return empty list
    }

    async getRelatedTours(id, limit = 4) {
        return [];
    }

    async setRelatedTours(id, ids) {
        return [];
    }

    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM safari_packages WHERE 1=1`;
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

module.exports = new TourCMSRepository();
