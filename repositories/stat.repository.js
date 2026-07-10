const db = require('../config/db');

class StatRepository {
    async getGlobalStats() {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM safari_packages WHERE is_active = true) as total_packages,
                (SELECT COUNT(*) FROM national_parks WHERE is_active = true) as total_destinations,
                (SELECT COUNT(*) FROM guides WHERE is_available = true) as total_guides,
                (SELECT COUNT(*) FROM reviews WHERE is_approved = true) as total_reviews,
                (SELECT COUNT(*) FROM bookings) as total_bookings,
                (SELECT COUNT(*) FROM contact_enquiries) as total_enquiries,
                (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users
        `;
        const result = await db.query(query);
        return result.rows[0];
    }
}

module.exports = new StatRepository();
