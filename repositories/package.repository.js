const db = require('../config/db');

const DEST_ALIASES = {
    serengeti: 'serengeti-national-park',
    ngorongoro: 'ngorongoro-conservation-area',
    tarangire: 'tarangire-national-park',
    zanzibar: 'zanzibar',
    manyara: 'lake-manyara-national-park',
    kilimanjaro: 'mount-kilimanjaro-national-park',
    meru: 'arusha-national-park',
    arusha: 'arusha-national-park'
};

function resolveDestinationSlug(destination) {
    const raw = String(destination || '').trim();
    if (!raw) return '';
    const key = raw.toLowerCase();
    return DEST_ALIASES[key] || raw;
}

function durationSql(duration) {
    switch (duration) {
        case '1-3': return 'sp.duration_days BETWEEN 1 AND 3';
        case '4-6': return 'sp.duration_days BETWEEN 4 AND 6';
        case '4-7': return 'sp.duration_days BETWEEN 4 AND 7';
        case '7-9': return 'sp.duration_days BETWEEN 7 AND 9';
        case '8+': return 'sp.duration_days >= 8';
        case '10+': return 'sp.duration_days >= 10';
        default: return null;
    }
}

/** Extra slugs treated as the same hub (e.g. Great Migration ↔ Migration Safaris). */
const CATEGORY_SLUG_ALIASES = {
    'great-migration': ['great-migration', 'migrations'],
    migrations: ['migrations', 'great-migration'],
    'mountain-climbing': ['mountain-climbing', 'kilimanjaro'],
    kilimanjaro: ['kilimanjaro', 'mountain-climbing']
};

/** Name/slug keywords so Fly-In, Budget, etc. still match tours stored under another hub. */
const CATEGORY_KEYWORDS = {
    'fly-in': ['%fly-in%', '%fly in%', '%fly-out%', '%fly out%'],
    budget: ['%budget%'],
    'family-safaris': ['%family%'],
    'day-trips': ['%day trip%', '%day-trip%', '%one day%', '%1-day%', '%1 day%'],
    'photography-tours': ['%photo%'],
    'cultural-tours': ['%cultural%', '%maasai%', '%hadzabe%', '%datoga%'],
    'luxury-safaris': ['%luxury%'],
    'wildlife-safaris': ['%wildlife%', '%game drive%', '%big five%', '%big cat%'],
    zanzibar: ['%zanzibar%'],
    'group-safaris': ['%group%'],
    kilimanjaro: ['%kilimanjaro%', '%machame%', '%marangu%', '%lemosho%', '%mount meru%', '%meru trek%'],
    'mountain-climbing': ['%kilimanjaro%', '%mount meru%', '%meru trek%', '%machame%', '%lemosho%', '%marangu%'],
    migrations: ['%migration%', '%wildebeest%', '%ndutu%', '%mara river%', '%calving%'],
    'great-migration': ['%migration%', '%wildebeest%', '%ndutu%', '%mara river%', '%calving%']
};

/**
 * Match packages by category slug, alias, or itinerary keywords.
 * Returns the next unused param index.
 */
function applyCategoryFilter(conditions, params, paramIndex, category) {
    if (!category || category === 'all') return paramIndex;

    const slugs = CATEGORY_SLUG_ALIASES[category] || [category];
    const keywords = CATEGORY_KEYWORDS[category] || [];
    const parts = [`pc.category_slug = ANY($${paramIndex}::text[])`];
    params.push(slugs);
    paramIndex += 1;

    for (const kw of keywords) {
        parts.push(
            `(sp.package_name ILIKE $${paramIndex} OR sp.package_slug ILIKE $${paramIndex} OR COALESCE(sp.short_description, '') ILIKE $${paramIndex})`
        );
        params.push(kw);
        paramIndex += 1;
    }

    if (category === 'day-trips') {
        parts.push('sp.duration_days = 1');
    }

    conditions.push(`(${parts.join(' OR ')})`);
    return paramIndex;
}

class PackageRepository {
    /**
     * Get all packages with filters and pagination
     */
    async getAll(filters = {}) {
        let {
            category,
            destination,
            duration,
            difficulty,
            minPrice,
            maxPrice,
            search,
            sort = 'featured',
            limit = 9,
            page = 1
        } = filters;

        limit = parseInt(limit) || 9;
        const offset = (parseInt(page) - 1) * limit;

        const conditions = ['sp.is_active = true'];
        // Hide fixed-date group products from general browse; allow when Group category is requested.
        if (category !== 'group-safaris') {
            conditions.push('(sp.is_group_tour IS NOT TRUE)');
        }
        const params = [];
        let paramIndex = 1;

        paramIndex = applyCategoryFilter(conditions, params, paramIndex, category);

        if (destination && destination !== 'all') {
            const destSlug = resolveDestinationSlug(destination);
            conditions.push(`EXISTS (
                SELECT 1 FROM package_destinations pd 
                JOIN national_parks np ON pd.park_id = np.park_id 
                WHERE pd.package_id = sp.package_id AND np.park_slug = $${paramIndex++}
            )`);
            params.push(destSlug);
        }

        if (duration && duration !== 'all') {
            const durSql = durationSql(duration);
            if (durSql) conditions.push(durSql);
        }

        if (difficulty && difficulty !== 'all') {
            conditions.push(`LOWER(sp.difficulty_level) = LOWER($${paramIndex++})`);
            params.push(difficulty);
        }

        if (minPrice && !isNaN(parseInt(minPrice))) {
            conditions.push(`sp.base_price_usd >= $${paramIndex++}`);
            params.push(parseInt(minPrice));
        }

        if (maxPrice && !isNaN(parseInt(maxPrice))) {
            conditions.push(`sp.base_price_usd <= $${paramIndex++}`);
            params.push(parseInt(maxPrice));
        }

        if (search && search.trim()) {
            conditions.push(`(sp.package_name ILIKE $${paramIndex} OR sp.short_description ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let orderBy = '';
        switch (sort) {
            case 'price-asc': orderBy = 'ORDER BY sp.base_price_usd ASC'; break;
            case 'price-desc': orderBy = 'ORDER BY sp.base_price_usd DESC'; break;
            case 'duration-asc': orderBy = 'ORDER BY sp.duration_days ASC'; break;
            case 'rating': orderBy = 'ORDER BY avg_rating DESC NULLS LAST'; break;
            case 'random': orderBy = 'ORDER BY RANDOM()'; break;
            case 'featured':
            default: orderBy = 'ORDER BY sp.is_featured DESC, sp.created_at DESC'; break;
        }

        const query = `
            SELECT sp.*, pc.category_name, pc.category_slug,
                   COALESCE(AVG(r.rating), 0) as avg_rating,
                   COUNT(DISTINCT r.review_id) as review_count,
                   COALESCE(sp.featured_image_url, sp.image_urls[1], '/images/safaris/' || sp.package_slug || '/main.jpg') as image_url,
                   (SELECT json_agg(json_build_object('park_name', np.park_name, 'park_slug', np.park_slug))
                    FROM package_destinations pd 
                    JOIN national_parks np ON pd.park_id = np.park_id 
                    WHERE pd.package_id = sp.package_id) as destinations
            FROM safari_packages sp
            LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
            LEFT JOIN reviews r ON sp.package_id = r.package_id AND r.is_approved = true
            ${whereClause}
            GROUP BY sp.package_id, pc.category_name, pc.category_slug
            ${orderBy}
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;

        params.push(limit, offset);
        const result = await db.query(query, params);
        return result.rows;
    }

    async count(filters = {}) {
        const { category, destination, duration, difficulty, minPrice, maxPrice, search } = filters;
        const conditions = ['sp.is_active = true'];
        if (category !== 'group-safaris') {
            conditions.push('(sp.is_group_tour IS NOT TRUE)');
        }
        const params = [];
        let paramIndex = 1;

        paramIndex = applyCategoryFilter(conditions, params, paramIndex, category);

        if (destination && destination !== 'all') {
            const destSlug = resolveDestinationSlug(destination);
            conditions.push(`EXISTS (
                SELECT 1 FROM package_destinations pd 
                JOIN national_parks np ON pd.park_id = np.park_id 
                WHERE pd.package_id = sp.package_id AND np.park_slug = $${paramIndex++}
            )`);
            params.push(destSlug);
        }

        if (duration && duration !== 'all') {
            const durSql = durationSql(duration);
            if (durSql) conditions.push(durSql);
        }

        if (difficulty && difficulty !== 'all') {
            conditions.push(`LOWER(sp.difficulty_level) = LOWER($${paramIndex++})`);
            params.push(difficulty);
        }

        if (minPrice && !isNaN(parseInt(minPrice))) {
            conditions.push(`sp.base_price_usd >= $${paramIndex++}`);
            params.push(parseInt(minPrice));
        }

        if (maxPrice && !isNaN(parseInt(maxPrice))) {
            conditions.push(`sp.base_price_usd <= $${paramIndex++}`);
            params.push(parseInt(maxPrice));
        }

        if (search && search.trim()) {
            conditions.push(`(sp.package_name ILIKE $${paramIndex} OR sp.short_description ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const query = `
            SELECT COUNT(DISTINCT sp.package_id) as total
            FROM safari_packages sp
            LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
            ${whereClause}
        `;

        const result = await db.query(query, params);
        return parseInt(result.rows[0].total);
    }

    async getBySlug(slug) {
        const query = `
            SELECT sp.*, pc.category_name, pc.category_slug,
                   COALESCE(AVG(r.rating), 0) as avg_rating,
                   COUNT(DISTINCT r.review_id) as review_count
            FROM safari_packages sp
            LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
            LEFT JOIN reviews r ON sp.package_id = r.package_id AND r.is_approved = true
            WHERE sp.package_slug = $1 AND sp.is_active = true
            GROUP BY sp.package_id, pc.category_name, pc.category_slug
        `;
        const result = await db.query(query, [slug]);
        return result.rows[0];
    }

    async getFeatured(limit = 6) {
        const query = `
            SELECT sp.*, pc.category_name, pc.category_slug,
                   COALESCE(AVG(r.rating), 0) as avg_rating,
                   COUNT(DISTINCT r.review_id) as review_count,
                   COALESCE(sp.featured_image_url, sp.image_urls[1], '/images/safaris/' || sp.package_slug || '/main.jpg') as image_url
            FROM safari_packages sp
            LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
            LEFT JOIN reviews r ON sp.package_id = r.package_id AND r.is_approved = true
            WHERE sp.is_active = true AND sp.is_featured = true AND (sp.is_group_tour IS NOT TRUE)
            GROUP BY sp.package_id, pc.category_name, pc.category_slug
            ORDER BY RANDOM()
            LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows;
    }

    async getItinerary(packageId) {
        try {
            const query = 'SELECT day_number as day, day_title as title, day_description as description, accommodation_type as accommodation FROM package_itinerary WHERE package_id = $1 ORDER BY day_number ASC';
            const result = await db.query(query, [packageId]);
            if (result.rows && result.rows.length > 0) return result.rows;
        } catch (e) {}

        try {
            const pkgRes = await db.query('SELECT itinerary FROM safari_packages WHERE package_id = $1', [packageId]);
            if (pkgRes.rows[0] && Array.isArray(pkgRes.rows[0].itinerary)) {
                return pkgRes.rows[0].itinerary.map((item, idx) => ({
                    day: item.day || item.day_number || (idx + 1),
                    title: item.title || item.day_title || `Day ${idx + 1}`,
                    description: item.description || item.day_description || '',
                    accommodation: item.accommodation || item.accommodation_type || ''
                }));
            }
        } catch (e) {}

        return [];
    }

    async getDestinations(packageId) {
        const query = `
            SELECT pd.*, np.park_name, np.park_slug
            FROM package_destinations pd
            JOIN national_parks np ON pd.park_id = np.park_id
            WHERE pd.package_id = $1
            ORDER BY pd.visit_day ASC
        `;
        const result = await db.query(query, [packageId]);
        return result.rows;
    }

    async getAllAdmin() {
        const query = `
            SELECT sp.*, pc.category_name, pc.category_slug
            FROM safari_packages sp
            LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
            ORDER BY sp.created_at DESC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getById(id) {
        const query = `
            SELECT sp.*, pc.category_name 
            FROM safari_packages sp
            LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
            WHERE sp.package_id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = new PackageRepository();
