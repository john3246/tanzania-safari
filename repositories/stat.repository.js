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
                (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
                (SELECT COUNT(*) FROM bookings b JOIN booking_statuses bs ON b.status_id = bs.status_id WHERE bs.code IN ('confirmed', 'CONFIRMED')) as bookings_confirmed,
                (SELECT COUNT(*) FROM bookings b JOIN booking_statuses bs ON b.status_id = bs.status_id WHERE bs.code IN ('pending', 'PENDING')) as bookings_pending,
                (SELECT COUNT(*) FROM bookings b JOIN booking_statuses bs ON b.status_id = bs.status_id WHERE bs.code IN ('cancelled', 'CANCELLED')) as bookings_cancelled
        `;
        const result = await db.query(query);
        const stats = result.rows[0];
        
        // Mock dynamic visitors data for the dashboard line chart
        stats.visitorsByMonth = [
            Math.floor(Math.random() * 5000) + 10000,
            Math.floor(Math.random() * 5000) + 12000,
            Math.floor(Math.random() * 5000) + 14000,
            Math.floor(Math.random() * 5000) + 18000,
            Math.floor(Math.random() * 5000) + 15000,
            Math.floor(Math.random() * 5000) + 22000
        ];
        
        return stats;
    }
}

module.exports = new StatRepository();
