const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class BookingCMSRepository extends BaseRepository {
    constructor() {
        super('bookings');
    }

    async findAllWithDetails(conditions = {}, options = {}) {
        let query = `
            SELECT b.*, 
                   t.title as tour_title,
                   t.slug as tour_slug,
                   t.price_usd as tour_price,
                   tc.name as category_name,
                   d.name as destination_name,
                   u.username as customer_username,
                   u.email as customer_email,
                   u.first_name as customer_first_name,
                   u.last_name as customer_last_name,
                   bs.name as status_name,
                   bs.color as status_color
            FROM bookings b
            LEFT JOIN tours t ON b.tour_id = t.id
            LEFT JOIN tour_categories tc ON t.category_id = tc.id
            LEFT JOIN destinations d ON t.destination_id = d.id
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN booking_statuses bs ON b.status = bs.id
            WHERE b.deleted_at IS NULL
        `;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `b.${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        if (options.search) {
            query += ` AND (b.booking_reference ILIKE $${index} OR u.email ILIKE $${index} OR u.first_name ILIKE $${index} OR u.last_name ILIKE $${index} OR t.title ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.status) {
            query += ` AND b.status = $${index}`;
            values.push(options.status);
            index++;
        }

        if (options.tourId) {
            query += ` AND b.tour_id = $${index}`;
            values.push(options.tourId);
            index++;
        }

        if (options.userId) {
            query += ` AND b.user_id = $${index}`;
            values.push(options.userId);
            index++;
        }

        if (options.startDate) {
            query += ` AND b.travel_date >= $${index}`;
            values.push(options.startDate);
            index++;
        }

        if (options.endDate) {
            query += ` AND b.travel_date <= $${index}`;
            values.push(options.endDate);
            index++;
        }

        if (options.orderBy) {
            query += ` ORDER BY b.${options.orderBy}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY b.created_at DESC`;
        }

        if (options.limit) {
            query += ` LIMIT $${index++}`;
            values.push(options.limit);
        }

        if (options.offset) {
            query += ` OFFSET $${index++}`;
            values.push(options.offset);
        }

        const result = await db.query(query, values);
        return result.rows;
    }

    async findByReference(reference) {
        const query = `
            SELECT b.*, 
                   t.title as tour_title,
                   t.slug as tour_slug,
                   u.username as customer_username,
                   u.email as customer_email,
                   u.first_name as customer_first_name,
                   u.last_name as customer_last_name,
                   bs.name as status_name
            FROM bookings b
            LEFT JOIN tours t ON b.tour_id = t.id
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN booking_statuses bs ON b.status = bs.id
            WHERE b.booking_reference = $1 AND b.deleted_at IS NULL
        `;
        const result = await db.query(query, [reference]);
        return result.rows[0];
    }

    async getByStatus(statusId, options = {}) {
        return this.findAllWithDetails({ status: statusId }, options);
    }

    async getByTour(tourId, options = {}) {
        return this.findAllWithDetails({ tour_id: tourId }, options);
    }

    async getByUser(userId, options = {}) {
        return this.findAllWithDetails({ user_id: userId }, options);
    }

    async getByDateRange(startDate, endDate, options = {}) {
        return this.findAllWithDetails({}, { ...options, startDate, endDate });
    }

    async getBookingStats() {
        const query = `
            SELECT 
                COUNT(*) as total_bookings,
                SUM(total_amount) as total_revenue,
                COUNT(DISTINCT user_id) as unique_customers,
                COUNT(DISTINCT tour_id) as unique_tours,
                AVG(total_amount) as avg_booking_value,
                COUNT(CASE WHEN status = 1 THEN 1 END) as pending_count,
                COUNT(CASE WHEN status = 2 THEN 1 END) as confirmed_count,
                COUNT(CASE WHEN status = 3 THEN 1 END) as cancelled_count,
                COUNT(CASE WHEN status = 4 THEN 1 END) as completed_count
            FROM bookings
            WHERE deleted_at IS NULL
        `;
        const result = await db.query(query);
        return result.rows[0];
    }

    async getRevenueByMonth(year) {
        const query = `
            SELECT 
                EXTRACT(MONTH FROM created_at) as month,
                SUM(total_amount) as revenue,
                COUNT(*) as bookings
            FROM bookings
            WHERE EXTRACT(YEAR FROM created_at) = $1 AND deleted_at IS NULL
            GROUP BY EXTRACT(MONTH FROM created_at)
            ORDER BY month
        `;
        const result = await db.query(query, [year]);
        return result.rows;
    }

    async getTopTours(limit = 10) {
        const query = `
            SELECT 
                t.id,
                t.title,
                t.slug,
                COUNT(b.id) as booking_count,
                SUM(b.total_amount) as total_revenue
            FROM tours t
            LEFT JOIN bookings b ON t.id = b.tour_id AND b.deleted_at IS NULL
            WHERE t.deleted_at IS NULL
            GROUP BY t.id, t.title, t.slug
            ORDER BY booking_count DESC
            LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows;
    }

    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM bookings WHERE deleted_at IS NULL`;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        const result = await db.query(query, values);
        return parseInt(result.rows[0].count);
    }

    async softDelete(id) {
        return this.update(id, { deleted_at: new Date() });
    }

    async restore(id) {
        return this.update(id, { deleted_at: null });
    }

    async updateStatus(id, statusId) {
        return this.update(id, { status: statusId });
    }
}

module.exports = new BookingCMSRepository();
