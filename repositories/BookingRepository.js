const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class BookingRepository extends BaseRepository {
    constructor() {
        super('bookings', 'booking_id');
    }

    async getBookingsWithDetails() {
        const query = `
            SELECT b.*, sp.package_name, u.first_name, u.last_name, u.email,
                   COALESCE(u.first_name || ' ' || COALESCE(u.last_name, ''), b.full_name, 'Guest') as full_name,
                   bs.status_name
            FROM bookings b
            LEFT JOIN safari_packages sp ON b.package_id = sp.package_id
            LEFT JOIN users u ON b.user_id = u.user_id
            LEFT JOIN booking_statuses bs ON b.status_id = bs.status_id
            ORDER BY b.created_at DESC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getBookingDetails(bookingId) {
        const query = `
            SELECT b.*, sp.package_name, u.first_name, u.last_name, u.email,
                   COALESCE(u.first_name || ' ' || COALESCE(u.last_name, ''), b.full_name) as full_name,
                   bs.status_name as current_status
            FROM bookings b
            LEFT JOIN safari_packages sp ON b.package_id = sp.package_id
            LEFT JOIN users u ON b.user_id = u.user_id
            LEFT JOIN booking_statuses bs ON b.status_id = bs.status_id
            WHERE b.booking_id = $1
        `;
        const result = await db.query(query, [bookingId]);
        return result.rows[0];
    }

    async getStatusName(statusId) {
        const query = 'SELECT status_name FROM booking_statuses WHERE status_id = $1';
        const result = await db.query(query, [statusId]);
        return result.rows[0]?.status_name;
    }
}

module.exports = new BookingRepository();
