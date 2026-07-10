const db = require('../config/db');

class ReviewRepository {
    async getTestimonials(limit = 6) {
        const query = `
            SELECT r.*, u.first_name, u.last_name, sp.package_name AS safari_name
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            LEFT JOIN safari_packages sp ON r.package_id = sp.package_id
            WHERE r.is_approved = true AND r.rating >= 4
            ORDER BY r.created_at DESC LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows;
    }

    async getFeatured(limit = 6) {
        const query = `
            SELECT r.*, u.first_name, u.last_name, sp.package_name AS safari_name
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.user_id
            LEFT JOIN safari_packages sp ON r.package_id = sp.package_id
            WHERE r.is_approved = true AND r.is_featured = true
            ORDER BY r.created_at DESC LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows;
    }
}

module.exports = new ReviewRepository();
