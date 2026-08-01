const db = require('../config/db');

function slugifyDate(startDate, packageSlug) {
    const d = new Date(startDate);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const dd = String(d.getUTCDate()).padStart(2, '0');
    const mon = months[d.getUTCMonth()];
    const yyyy = d.getUTCFullYear();
    const base = (packageSlug || 'safari').replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 40);
    return `join-${base}-${dd}${mon}${yyyy}`;
}

function mapDeparture(row) {
    if (!row) return null;
    const capacity = Number(row.capacity) || 0;
    const seatsBooked = Number(row.seats_booked) || 0;
    const seatsLeft = Math.max(0, capacity - seatsBooked);
    const basePrice = row.price_usd != null ? Number(row.price_usd) : Number(row.base_price_usd || 0);
    const discount = Number(row.discount_percent) || 0;
    const salePrice = discount > 0 ? Math.round(basePrice * (1 - discount / 100)) : basePrice;
    let status = row.status || 'open';
    if (status !== 'cancelled' && status !== 'guaranteed') {
        if (seatsLeft <= 0) status = 'full';
        else if (seatsLeft <= 2) status = 'almost_full';
    }
    return {
        departure_id: row.departure_id,
        package_id: row.package_id,
        departure_slug: row.departure_slug,
        title: row.title_override || row.package_name,
        title_override: row.title_override,
        start_date: row.start_date,
        end_date: row.end_date,
        capacity,
        seats_booked: seatsBooked,
        seats_left: seatsLeft,
        price_usd: basePrice,
        discount_percent: discount,
        sale_price_usd: salePrice,
        status,
        is_featured: row.is_featured,
        is_active: row.is_active,
        admin_notes: row.admin_notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        package_name: row.package_name,
        package_slug: row.package_slug,
        duration_days: row.duration_days,
        duration_nights: row.duration_nights,
        featured_image_url: row.featured_image_url,
        short_description: row.short_description,
        physical_rating: row.physical_rating || row.difficulty_level || 'Easy',
        min_age: row.min_age != null ? row.min_age : 3,
        group_max_pax: row.group_max_pax || row.maximum_pax || capacity,
        highlights: Array.isArray(row.highlights) ? row.highlights : []
    };
}

class GroupDepartureRepository {
    async listPublic({ limit = 50, upcomingOnly = true, year = null, month = null } = {}) {
        const params = [];
        let where = `gd.is_active = true AND sp.is_active = true AND sp.is_group_tour = true AND gd.status <> 'cancelled'`;
        if (upcomingOnly) {
            where += ` AND gd.start_date >= CURRENT_DATE`;
        }
        if (year && Number.isFinite(year)) {
            params.push(year);
            where += ` AND EXTRACT(YEAR FROM gd.start_date) = $${params.length}`;
        }
        if (month && Number.isFinite(month) && month >= 1 && month <= 12) {
            params.push(month);
            where += ` AND EXTRACT(MONTH FROM gd.start_date) = $${params.length}`;
        }
        params.push(Math.min(parseInt(limit, 10) || 50, 200));
        const result = await db.query(`
            SELECT gd.*, sp.package_name, sp.package_slug, sp.duration_days, sp.duration_nights,
                   sp.featured_image_url, sp.short_description, sp.base_price_usd,
                   sp.physical_rating, sp.min_age, sp.group_max_pax, sp.maximum_pax, sp.difficulty_level,
                   sp.highlights
            FROM group_departures gd
            JOIN safari_packages sp ON sp.package_id = gd.package_id
            WHERE ${where}
            ORDER BY gd.start_date ASC
            LIMIT $${params.length}
        `, params);
        return result.rows.map(mapDeparture);
    }

    async getBySlug(slug) {
        const result = await db.query(`
            SELECT gd.*, sp.package_name, sp.package_slug, sp.duration_days, sp.duration_nights,
                   sp.featured_image_url, sp.short_description, sp.detailed_description,
                   sp.base_price_usd, sp.physical_rating, sp.min_age, sp.group_max_pax,
                   sp.maximum_pax, sp.difficulty_level, sp.highlights, sp.included_features,
                   sp.excluded_features, sp.itinerary, sp.inclusions_html, sp.exclusions_html,
                   sp.packing_list_html, sp.visa_info_html, sp.image_urls
            FROM group_departures gd
            JOIN safari_packages sp ON sp.package_id = gd.package_id
            WHERE gd.departure_slug = $1 AND gd.is_active = true AND sp.is_active = true
            LIMIT 1
        `, [slug]);
        const row = result.rows[0];
        if (!row) return null;
        const mapped = mapDeparture(row);
        return {
            ...mapped,
            detailed_description: row.detailed_description,
            highlights: row.highlights || [],
            included_features: row.included_features || [],
            excluded_features: row.excluded_features || [],
            itinerary: row.itinerary || [],
            inclusions_html: row.inclusions_html,
            exclusions_html: row.exclusions_html,
            packing_list_html: row.packing_list_html,
            visa_info_html: row.visa_info_html,
            image_urls: row.image_urls || []
        };
    }

    async listAdmin({ package_id, includeInactive = true } = {}) {
        const params = [];
        const conditions = ['sp.is_group_tour = true'];
        if (package_id) {
            params.push(package_id);
            conditions.push(`gd.package_id = $${params.length}`);
        }
        if (!includeInactive) {
            conditions.push('gd.is_active = true');
        }
        const result = await db.query(`
            SELECT gd.*, sp.package_name, sp.package_slug, sp.duration_days, sp.duration_nights,
                   sp.featured_image_url, sp.base_price_usd, sp.physical_rating, sp.min_age,
                   sp.group_max_pax, sp.maximum_pax
            FROM group_departures gd
            JOIN safari_packages sp ON sp.package_id = gd.package_id
            WHERE ${conditions.join(' AND ')}
            ORDER BY gd.start_date DESC
        `, params);
        return result.rows.map(mapDeparture);
    }

    async listGroupPackages() {
        const result = await db.query(`
            SELECT sp.package_id, sp.package_name, sp.package_slug, sp.duration_days,
                   sp.base_price_usd, sp.featured_image_url, sp.is_active, sp.physical_rating,
                   sp.min_age, sp.group_max_pax, sp.short_description,
                   (SELECT COUNT(*) FROM group_departures gd
                    WHERE gd.package_id = sp.package_id AND gd.is_active = true
                      AND gd.start_date >= CURRENT_DATE) AS upcoming_departures
            FROM safari_packages sp
            WHERE sp.is_group_tour = true
            ORDER BY sp.package_name ASC
        `);
        return result.rows;
    }

    async create(data) {
        let slug = data.departure_slug;
        if (!slug) {
            const pkg = await db.query(
                'SELECT package_slug, duration_days FROM safari_packages WHERE package_id = $1',
                [data.package_id]
            );
            const row = pkg.rows[0];
            if (!row) throw new Error('Package not found');
            slug = slugifyDate(data.start_date, row.package_slug);
        }
        let endDate = data.end_date;
        if (!endDate && data.start_date) {
            const pkg = await db.query(
                'SELECT duration_days FROM safari_packages WHERE package_id = $1',
                [data.package_id]
            );
            const days = Number(pkg.rows[0]?.duration_days) || 1;
            const start = new Date(data.start_date);
            start.setUTCDate(start.getUTCDate() + Math.max(0, days - 1));
            endDate = start.toISOString().slice(0, 10);
        }
        const result = await db.query(`
            INSERT INTO group_departures (
                package_id, departure_slug, title_override, start_date, end_date,
                capacity, seats_booked, price_usd, discount_percent, status,
                is_featured, is_active, admin_notes
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            RETURNING *
        `, [
            data.package_id,
            slug,
            data.title_override || null,
            data.start_date,
            endDate,
            data.capacity || 6,
            data.seats_booked || 0,
            data.price_usd != null ? data.price_usd : null,
            data.discount_percent || 0,
            data.status || 'open',
            data.is_featured === true,
            data.is_active !== false,
            data.admin_notes || null
        ]);
        return mapDeparture(result.rows[0]);
    }

    async update(id, data) {
        const fields = [];
        const params = [];
        const allow = [
            'title_override', 'start_date', 'end_date', 'capacity', 'seats_booked',
            'price_usd', 'discount_percent', 'status', 'is_featured', 'is_active',
            'admin_notes', 'departure_slug', 'package_id'
        ];
        for (const key of allow) {
            if (data[key] !== undefined) {
                params.push(data[key]);
                fields.push(`${key} = $${params.length}`);
            }
        }
        if (!fields.length) return this.getById(id);
        fields.push('updated_at = NOW()');
        params.push(id);
        const result = await db.query(
            `UPDATE group_departures SET ${fields.join(', ')} WHERE departure_id = $${params.length} RETURNING *`,
            params
        );
        return mapDeparture(result.rows[0]);
    }

    async getById(id) {
        const result = await db.query(`
            SELECT gd.*, sp.package_name, sp.package_slug, sp.duration_days, sp.base_price_usd,
                   sp.featured_image_url, sp.physical_rating, sp.min_age, sp.group_max_pax, sp.maximum_pax
            FROM group_departures gd
            JOIN safari_packages sp ON sp.package_id = gd.package_id
            WHERE gd.departure_id = $1
        `, [id]);
        return mapDeparture(result.rows[0]);
    }

    async remove(id) {
        const result = await db.query(
            'DELETE FROM group_departures WHERE departure_id = $1 RETURNING departure_id',
            [id]
        );
        return result.rowCount > 0;
    }

    async adjustSeats(id, delta) {
        const result = await db.query(`
            UPDATE group_departures
            SET seats_booked = GREATEST(0, LEAST(capacity, seats_booked + $1)),
                updated_at = NOW(),
                status = CASE
                    WHEN GREATEST(0, LEAST(capacity, seats_booked + $1)) >= capacity THEN 'full'
                    WHEN status = 'cancelled' THEN status
                    WHEN GREATEST(0, LEAST(capacity, seats_booked + $1)) <= capacity - 2
                         AND status = 'full' THEN 'open'
                    ELSE status
                END
            WHERE departure_id = $2
            RETURNING *
        `, [delta, id]);
        return mapDeparture(result.rows[0]);
    }
}

module.exports = new GroupDepartureRepository();
module.exports.slugifyDate = slugifyDate;
