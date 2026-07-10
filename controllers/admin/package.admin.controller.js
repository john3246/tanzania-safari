const packageRepository = require('../../repositories/package.repository');
const db = require('../../config/db');

class PackageAdminController {
    async getAll(req, res) {
        try {
            const packages = await packageRepository.getAllAdmin();
            res.json({ success: true, data: packages });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching packages' });
        }
    }

    async create(req, res) {
        try {
            const data = req.body;
            const query = `
                INSERT INTO safari_packages (
                    package_name, package_slug, category_id, short_description, detailed_description,
                    duration_days, duration_nights, base_price_usd, difficulty_level, is_featured,
                    included_features, excluded_features, minimum_pax, maximum_pax, is_private, 
                    is_customizable, featured_image_url, image_urls, is_active, created_at, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, true, NOW(), NOW())
                RETURNING package_id
            `;
            const result = await db.query(query, [
                data.package_name, data.package_slug, data.category_id || null, data.short_description, data.detailed_description,
                data.duration_days, data.duration_nights || data.duration_days, data.base_price_usd, data.difficulty_level || 'Easy',
                data.is_featured || false, data.included_features || [], data.excluded_features || [],
                data.minimum_pax || 1, data.maximum_pax || 12, data.is_private !== false, data.is_customizable !== false,
                data.featured_image_url || null, data.image_urls || []
            ]);
            res.json({ success: true, data: { package_id: result.rows[0].package_id } });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error creating package' });
        }
    }

    async update(req, res) {
        try {
            const data = req.body;
            await db.query(`
                UPDATE safari_packages SET
                    package_name = $1, package_slug = $2, category_id = $3,
                    short_description = $4, detailed_description = $5,
                    duration_days = $6, duration_nights = $7, base_price_usd = $8,
                    difficulty_level = $9, is_featured = $10, included_features = $11,
                    excluded_features = $12, minimum_pax = $13, maximum_pax = $14,
                    is_private = $15, is_customizable = $16, is_active = $17,
                    featured_image_url = $18, image_urls = $19,
                    updated_at = NOW()
                WHERE package_id = $20
            `, [
                data.package_name, data.package_slug, data.category_id || null, data.short_description, data.detailed_description,
                data.duration_days, data.duration_nights || data.duration_days, data.base_price_usd,
                data.difficulty_level, data.is_featured || false, data.included_features || [], data.excluded_features || [],
                data.minimum_pax || 1, data.maximum_pax || 12, data.is_private !== false, data.is_customizable !== false,
                data.is_active !== false, data.featured_image_url || null, data.image_urls || [], req.params.id
            ]);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error updating package' });
        }
    }

    async delete(req, res) {
        try {
            await db.query('UPDATE safari_packages SET is_active = false WHERE package_id = $1', [req.params.id]);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error deleting package' });
        }
    }

    async getItinerary(req, res) {
        try {
            const result = await db.query('SELECT * FROM package_itinerary WHERE package_id = $1 ORDER BY day_number ASC', [req.params.id]);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching itinerary' });
        }
    }

    async saveItinerary(req, res) {
        try {
            const { itinerary } = req.body;
            const packageId = req.params.id;
            
            await db.query('BEGIN');
            await db.query('DELETE FROM package_itinerary WHERE package_id = $1', [packageId]);
            
            if (itinerary && itinerary.length > 0) {
                for (const item of itinerary) {
                    await db.query(
                        `INSERT INTO package_itinerary (package_id, day_number, day_title, day_description, accommodation_type, meals_included)
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [packageId, item.day_number, item.day_title, item.day_description, item.accommodation_type, item.meals_included]
                    );
                }
            }
            await db.query('COMMIT');
            res.json({ success: true });
        } catch (error) {
            await db.query('ROLLBACK');
            res.status(500).json({ success: false, message: 'Error saving itinerary' });
        }
    }

    async getDestinations(req, res) {
        try {
            const result = await db.query(`
                SELECT pd.*, np.park_name, np.park_slug
                FROM package_destinations pd
                JOIN national_parks np ON pd.park_id = np.park_id
                WHERE pd.package_id = $1
                ORDER BY pd.visit_day ASC
            `, [req.params.id]);
            res.json({ success: true, data: result.rows });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error fetching destinations' });
        }
    }

    async saveDestinations(req, res) {
        try {
            const { destinations } = req.body;
            const packageId = req.params.id;
            
            await db.query('BEGIN');
            await db.query('DELETE FROM package_destinations WHERE package_id = $1', [packageId]);
            
            if (destinations && destinations.length > 0) {
                for (const item of destinations) {
                    await db.query(
                        `INSERT INTO package_destinations (package_id, park_id, visit_day, activities)
                         VALUES ($1, $2, $3, $4)`,
                        [packageId, item.park_id, item.visit_day, item.activities || []]
                    );
                }
            }
            await db.query('COMMIT');
            res.json({ success: true });
        } catch (error) {
            await db.query('ROLLBACK');
            res.status(500).json({ success: false, message: 'Error saving destinations' });
        }
    }
}

module.exports = new PackageAdminController();
