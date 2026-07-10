const db = require('../config/db');

class BookingRepository {
    async create(data) {
        const {
            booking_reference, user_id, package_id, start_date, end_date,
            number_of_adults, number_of_children, children_ages,
            special_requests, dietary_restrictions, medical_conditions,
            status_id, booking_source, total_price_usd
        } = data;

        const query = `
            INSERT INTO bookings (
                booking_reference, user_id, package_id, booking_date, start_date, end_date,
                number_of_adults, number_of_children, children_ages, special_requests,
                dietary_restrictions, medical_conditions, status_id, booking_source,
                total_price_usd, created_at, updated_at
            ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
            RETURNING booking_id, booking_reference
        `;

        const params = [
            booking_reference, user_id, package_id, start_date, end_date,
            number_of_adults, number_of_children, children_ages,
            special_requests, dietary_restrictions, medical_conditions,
            status_id, booking_source, total_price_usd
        ];

        const result = await db.query(query, params);
        return result.rows[0];
    }

    async getAll() {
        const query = `
            SELECT b.*, sp.package_name, 
                   u.first_name as user_first_name, u.last_name as user_last_name, u.email as user_email,
                   bs.status_code, bs.status_name
            FROM bookings b
            LEFT JOIN safari_packages sp ON b.package_id = sp.package_id
            LEFT JOIN users u ON b.user_id = u.user_id
            LEFT JOIN booking_statuses bs ON b.status_id = bs.status_id
            ORDER BY b.created_at DESC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getById(id) {
        const query = `
            SELECT b.*, sp.package_name, sp.duration_days, sp.base_price_usd,
                   u.first_name, u.last_name, u.email, u.phone,
                   bs.status_code, bs.status_name
            FROM bookings b
            LEFT JOIN safari_packages sp ON b.package_id = sp.package_id
            LEFT JOIN users u ON b.user_id = u.user_id
            LEFT JOIN booking_statuses bs ON b.status_id = bs.status_id
            WHERE b.booking_id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async updateStatus(id, statusId) {
        const query = 'UPDATE bookings SET status_id = $1, updated_at = NOW() WHERE booking_id = $2';
        await db.query(query, [statusId, id]);
    }

    async getBookingWithUserDetails(id) {
        const query = `
            SELECT b.*, u.email, COALESCE(u.first_name || ' ' || u.last_name, 'Guest') as full_name, sp.package_name
            FROM bookings b
            LEFT JOIN users u ON b.user_id = u.user_id
            JOIN safari_packages sp ON b.package_id = sp.package_id
            WHERE b.booking_id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async getStatusIdByCode(code) {
        const query = 'SELECT status_id FROM booking_statuses WHERE LOWER(status_code) = LOWER($1)';
        const result = await db.query(query, [code]);
        return result.rows.length > 0 ? result.rows[0].status_id : null;
    }
}

module.exports = new BookingRepository();
