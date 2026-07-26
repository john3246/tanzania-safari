const BaseRepository = require('./BaseRepository');
const db = require('../config/db');
const crypto = require('crypto');

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
        
        // Auto-generate UUID if not provided for creation
        if (data.id) {
            payload.package_id = data.id;
        } else {
            payload.package_id = crypto.randomUUID();
        }

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
        if (data.highlights !== undefined) payload.highlights = Array.isArray(data.highlights) ? data.highlights : [];
        if (data.included !== undefined) payload.included_features = Array.isArray(data.included) ? data.included : [];
        if (data.excluded !== undefined) payload.excluded_features = Array.isArray(data.excluded) ? data.excluded : [];
        if (data.travel_tips !== undefined) {
            payload.best_months = Array.isArray(data.travel_tips) ? data.travel_tips.join(', ') : String(data.travel_tips);
        }
        if (data.featured_image_url !== undefined) payload.featured_image_url = data.featured_image_url;
        if (data.gallery_urls !== undefined) payload.image_urls = Array.isArray(data.gallery_urls) ? data.gallery_urls : [];
        if (data.is_featured !== undefined) payload.is_featured = Boolean(data.is_featured);
        if (data.is_active !== undefined) payload.is_active = Boolean(data.is_active);
        if (data.itinerary !== undefined) {
            payload.itinerary = JSON.stringify(Array.isArray(data.itinerary) ? data.itinerary : []);
        }
        if (data.seo_title !== undefined) payload.meta_title = data.seo_title;
        if (data.seo_description !== undefined) payload.meta_description = data.seo_description;
        if (data.seo_keywords !== undefined) {
            payload.meta_keywords = typeof data.seo_keywords === 'string' 
                ? data.seo_keywords.split(',').map(s => s.trim()).filter(Boolean)
                : (Array.isArray(data.seo_keywords) ? data.seo_keywords : []);
        }
        return payload;
    }

    async syncPackageItinerary(packageId, itineraryArray) {
        if (!Array.isArray(itineraryArray)) return;
        try {
            await db.query('DELETE FROM package_itinerary WHERE package_id = $1', [packageId]);
            for (let i = 0; i < itineraryArray.length; i++) {
                const item = itineraryArray[i];
                await db.query(
                    `INSERT INTO package_itinerary (package_id, day_number, title, description)
                     VALUES ($1, $2, $3, $4)`,
                    [packageId, item.day || item.day_number || (i + 1), item.title || '', item.description || '']
                );
            }
        } catch (e) {}
    }

    async create(data) {
        const result = await super.create(data);
        if (data.itinerary && Array.isArray(data.itinerary)) {
            await this.syncPackageItinerary(result.id || data.id, data.itinerary);
        }
        return result;
    }

    async update(id, data) {
        const result = await super.update(id, data);
        if (data.itinerary && Array.isArray(data.itinerary)) {
            await this.syncPackageItinerary(id, data.itinerary);
        }
        return result;
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

        if (conditions.is_active !== undefined) {
            query += ` AND sp.is_active = $${index++}`;
            values.push(conditions.is_active);
        }
        if (conditions.is_featured !== undefined) {
            query += ` AND sp.is_featured = $${index++}`;
            values.push(conditions.is_featured);
        }
        if (options.categoryId) {
            query += ` AND sp.category_id = $${index++}`;
            values.push(options.categoryId);
        }
        if (options.destinationId) {
            query += ` AND pd.park_id = $${index++}`;
            values.push(options.destinationId);
        }
        if (options.search) {
            query += ` AND (sp.package_name ILIKE $${index} OR sp.short_description ILIKE $${index} OR sp.detailed_description ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }
        if (options.difficulty) {
            query += ` AND sp.difficulty_level = $${index++}`;
            values.push(options.difficulty);
        }
        if (options.minPrice) {
            query += ` AND sp.base_price_usd >= $${index++}`;
            values.push(options.minPrice);
        }
        if (options.maxPrice) {
            query += ` AND sp.base_price_usd <= $${index++}`;
            values.push(options.maxPrice);
        }

        const validOrderBy = {
            'created_at': 'sp.created_at',
            'package_name': 'sp.package_name',
            'base_price_usd': 'sp.base_price_usd',
            'duration_days': 'sp.duration_days'
        };
        const sortColumn = validOrderBy[options.orderBy] || 'sp.created_at';
        const sortOrder = options.orderDirection === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY ${sortColumn} ${sortOrder}`;

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
        return this.mapRow(result.rows[0]);
    }

    async findBySlug(slug) {
        const query = `
            SELECT sp.*, 
                   pc.category_name as category_name,
                   pc.category_slug as category_slug
            FROM safari_packages sp
            LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
            WHERE sp.package_slug = $1
        `;
        const result = await db.query(query, [slug]);
        return this.mapRow(result.rows[0]);
    }

    async getActiveTours(options = {}) {
        options.is_active = true;
        return this.findAllWithDetails({ is_active: true }, options);
    }

    async getFeaturedTours(limit = 6) {
        return this.findAllWithDetails({ is_active: true, is_featured: true }, { limit });
    }

    async softDelete(id) {
        return this.update(id, { is_active: false });
    }

    async publish(id) {
        return this.update(id, { is_active: true });
    }

    async archive(id) {
        return this.update(id, { is_active: false });
    }

    async restore(id) {
        return this.update(id, { is_active: true });
    }

    async togglePublish(id, is_active) {
        return this.update(id, { is_active: Boolean(is_active) });
    }

    async getRelatedToursList(id) {
        return [];
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

    async delete(id) {
        try {
            await db.query('DELETE FROM public.booking_travelers WHERE booking_id IN (SELECT booking_id FROM public.bookings WHERE package_id = $1)', [id]);
        } catch (e) {}
        try {
            await db.query('DELETE FROM public.booking_communications WHERE booking_id IN (SELECT booking_id FROM public.bookings WHERE package_id = $1)', [id]);
        } catch (e) {}
        try {
            await db.query('DELETE FROM public.guide_assignments WHERE booking_id IN (SELECT booking_id FROM public.bookings WHERE package_id = $1)', [id]);
        } catch (e) {}
        try {
            await db.query('DELETE FROM public.bookings WHERE package_id = $1', [id]);
        } catch (e) {}
        try {
            await db.query('DELETE FROM public.contact_enquiries WHERE package_id = $1', [id]);
        } catch (e) {}
        try {
            await db.query('DELETE FROM public.package_destinations WHERE package_id = $1', [id]);
        } catch (e) {}
        try {
            await db.query('DELETE FROM public.package_itinerary WHERE package_id = $1', [id]);
        } catch (e) {}
        try {
            await db.query('DELETE FROM public.package_accommodations WHERE package_id = $1', [id]);
        } catch (e) {}
        try {
            await db.query('DELETE FROM public.reviews WHERE package_id = $1', [id]);
        } catch (e) {}
        
        const result = await db.query('DELETE FROM public.safari_packages WHERE package_id = $1 RETURNING *', [id]);
        return result.rows ? result.rows[0] : null;
    }
}

module.exports = new TourCMSRepository();
