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
                (SELECT COALESCE(SUM(views_count), 0) FROM blog_posts) as total_views,
                (SELECT COALESCE(SUM(total_price_usd), 0) FROM bookings b JOIN booking_statuses bs ON b.status_id = bs.status_id WHERE bs.code IN ('confirmed', 'CONFIRMED')) as total_revenue,
                (SELECT COUNT(*) FROM bookings b JOIN booking_statuses bs ON b.status_id = bs.status_id WHERE bs.code IN ('confirmed', 'CONFIRMED')) as bookings_confirmed,
                (SELECT COUNT(*) FROM bookings b JOIN booking_statuses bs ON b.status_id = bs.status_id WHERE bs.code IN ('pending', 'PENDING')) as bookings_pending,
                (SELECT COUNT(*) FROM bookings b JOIN booking_statuses bs ON b.status_id = bs.status_id WHERE bs.code IN ('cancelled', 'CANCELLED')) as bookings_cancelled
        `;
        const result = await db.query(query);
        const stats = result.rows[0];
        
        // Get dynamic bookings by month for the line chart (last 6 months)
        const temporalQuery = `
            WITH months AS (
                SELECT generate_series(
                    date_trunc('month', current_date) - interval '5 months',
                    date_trunc('month', current_date),
                    interval '1 month'
                ) AS month_start
            )
            SELECT 
                to_char(m.month_start, 'Mon') as month_label,
                COUNT(b.booking_id) as booking_count
            FROM months m
            LEFT JOIN bookings b ON date_trunc('month', b.created_at) = m.month_start
            GROUP BY m.month_start, month_label
            ORDER BY m.month_start ASC
        `;
        
        try {
            const tempResult = await db.query(temporalQuery);
            stats.visitorLabels = tempResult.rows.map(r => r.month_label);
            stats.visitorsByMonth = tempResult.rows.map(r => parseInt(r.booking_count, 10));
        } catch(e) {
            console.error("Error fetching temporal booking data:", e);
            stats.visitorLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            stats.visitorsByMonth = [0, 0, 0, 0, 0, 0];
        }
        
        return stats;
    }
}

module.exports = new StatRepository();
