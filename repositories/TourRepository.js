const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class TourRepository extends BaseRepository {
    constructor() {
        super('safari_packages', 'package_id');
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

    async getItinerary(packageId) {
        const query = 'SELECT * FROM package_itinerary WHERE package_id = $1 ORDER BY day_number ASC';
        const result = await db.query(query, [packageId]);
        return result.rows;
    }

    async saveItinerary(packageId, itinerary) {
        await db.query('DELETE FROM package_itinerary WHERE package_id = $1', [packageId]);
        if (itinerary && itinerary.length > 0) {
            for (const item of itinerary) {
                await db.query(
                    `INSERT INTO package_itinerary (package_id, day_number, day_title, day_description, accommodation_type, meals_included)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [packageId, item.day_number, item.day_title, item.day_description, item.accommodation_type || null, item.meals_included || null]
                );
            }
        }
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

    async saveDestinations(packageId, parks) {
        await db.query('DELETE FROM package_destinations WHERE package_id = $1', [packageId]);
        if (parks && parks.length > 0) {
            for (const p of parks) {
                await db.query(
                    `INSERT INTO package_destinations (package_id, park_id, visit_day)
                     VALUES ($1, $2, $3)`,
                    [packageId, p.park_id, p.visit_day]
                );
            }
        }
    }
}

module.exports = new TourRepository();
