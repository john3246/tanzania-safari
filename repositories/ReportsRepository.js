const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class ReportsRepository extends BaseRepository {
    constructor() {
        super('reports');
    }

    async getBookingsReport(filters = {}) {
        let query = `
            SELECT 
                b.id,
                b.booking_reference,
                b.created_at,
                b.travel_date,
                b.number_of_travelers,
                b.total_amount,
                b.status,
                t.title as tour_title,
                u.email as customer_email,
                u.first_name as customer_first_name,
                u.last_name as customer_last_name,
                bs.name as status_name
            FROM bookings b
            LEFT JOIN tours t ON b.tour_id = t.id
            LEFT JOIN users u ON b.user_id = u.id
            LEFT JOIN booking_statuses bs ON b.status = bs.id
            WHERE b.deleted_at IS NULL
        `;
        let values = [];
        let index = 1;

        if (filters.startDate) {
            query += ` AND b.created_at >= $${index}`;
            values.push(filters.startDate);
            index++;
        }

        if (filters.endDate) {
            query += ` AND b.created_at <= $${index}`;
            values.push(filters.endDate);
            index++;
        }

        if (filters.status) {
            query += ` AND b.status = $${index}`;
            values.push(filters.status);
            index++;
        }

        if (filters.tourId) {
            query += ` AND b.tour_id = $${index}`;
            values.push(filters.tourId);
            index++;
        }

        query += ` ORDER BY b.created_at DESC`;

        if (filters.limit) {
            query += ` LIMIT $${index++}`;
            values.push(filters.limit);
        }

        const result = await db.query(query, values);
        return result.rows;
    }

    async getToursReport(filters = {}) {
        let query = `
            SELECT 
                t.id,
                t.title,
                t.slug,
                t.price_usd,
                t.duration_days,
                t.is_active,
                t.status,
                tc.name as category_name,
                d.name as destination_name,
                COUNT(b.id) as booking_count,
                COALESCE(SUM(b.total_amount), 0) as total_revenue,
                COALESCE(SUM(b.number_of_travelers), 0) as total_travelers
            FROM tours t
            LEFT JOIN tour_categories tc ON t.category_id = tc.id
            LEFT JOIN destinations d ON t.destination_id = d.id
            LEFT JOIN bookings b ON t.id = b.tour_id AND b.deleted_at IS NULL
            WHERE t.deleted_at IS NULL
        `;
        let values = [];
        let index = 1;

        if (filters.categoryId) {
            query += ` AND t.category_id = $${index}`;
            values.push(filters.categoryId);
            index++;
        }

        if (filters.destinationId) {
            query += ` AND t.destination_id = $${index}`;
            values.push(filters.destinationId);
            index++;
        }

        if (filters.isActive !== undefined) {
            query += ` AND t.is_active = $${index}`;
            values.push(filters.isActive);
            index++;
        }

        query += ` GROUP BY t.id, t.title, t.slug, t.price_usd, t.duration_days, t.is_active, t.status, tc.name, d.name`;
        query += ` ORDER BY total_revenue DESC`;

        if (filters.limit) {
            query += ` LIMIT $${index++}`;
            values.push(filters.limit);
        }

        const result = await db.query(query, values);
        return result.rows;
    }

    async getCustomersReport(filters = {}) {
        let query = `
            SELECT 
                u.id,
                u.username,
                u.email,
                u.first_name,
                u.last_name,
                u.created_at,
                r.name as role_name,
                COUNT(b.id) as booking_count,
                COALESCE(SUM(b.total_amount), 0) as total_spent,
                MAX(b.created_at) as last_booking_date
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN bookings b ON u.id = b.user_id AND b.deleted_at IS NULL
            WHERE u.deleted_at IS NULL
        `;
        let values = [];
        let index = 1;

        if (filters.roleId) {
            query += ` AND u.role_id = $${index}`;
            values.push(filters.roleId);
            index++;
        }

        if (filters.startDate) {
            query += ` AND u.created_at >= $${index}`;
            values.push(filters.startDate);
            index++;
        }

        if (filters.endDate) {
            query += ` AND u.created_at <= $${index}`;
            values.push(filters.endDate);
            index++;
        }

        query += ` GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.created_at, r.name`;
        query += ` ORDER BY total_spent DESC`;

        if (filters.limit) {
            query += ` LIMIT $${index++}`;
            values.push(filters.limit);
        }

        const result = await db.query(query, values);
        return result.rows;
    }

    async getEmailStatsReport(filters = {}) {
        let query = `
            SELECT 
                el.id,
                el.recipient_email,
                el.subject,
                el.template_id,
                et.name as template_name,
                el.status,
                el.sent_at,
                el.error_message
            FROM email_logs el
            LEFT JOIN email_templates et ON el.template_id = et.id
            WHERE 1=1
        `;
        let values = [];
        let index = 1;

        if (filters.startDate) {
            query += ` AND el.sent_at >= $${index}`;
            values.push(filters.startDate);
            index++;
        }

        if (filters.endDate) {
            query += ` AND el.sent_at <= $${index}`;
            values.push(filters.endDate);
            index++;
        }

        if (filters.status) {
            query += ` AND el.status = $${index}`;
            values.push(filters.status);
            index++;
        }

        if (filters.templateId) {
            query += ` AND el.template_id = $${index}`;
            values.push(filters.templateId);
            index++;
        }

        query += ` ORDER BY el.sent_at DESC`;

        if (filters.limit) {
            query += ` LIMIT $${index++}`;
            values.push(filters.limit);
        }

        const result = await db.query(query, values);
        return result.rows;
    }

    async getEmailStatsSummary() {
        const query = `
            SELECT 
                COUNT(*) as total_emails,
                COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                COUNT(DISTINCT recipient_email) as unique_recipients,
                COUNT(DISTINCT template_id) as templates_used
            FROM email_logs
        `;
        const result = await db.query(query);
        return result.rows[0];
    }

    async getRevenueReport(filters = {}) {
        let query = `
            SELECT 
                DATE_TRUNC('month', b.created_at) as month,
                COUNT(*) as booking_count,
                SUM(b.total_amount) as total_revenue,
                AVG(b.total_amount) as avg_booking_value,
                SUM(b.number_of_travelers) as total_travelers
            FROM bookings b
            WHERE b.deleted_at IS NULL AND b.status = 2
        `;
        let values = [];
        let index = 1;

        if (filters.startDate) {
            query += ` AND b.created_at >= $${index}`;
            values.push(filters.startDate);
            index++;
        }

        if (filters.endDate) {
            query += ` AND b.created_at <= $${index}`;
            values.push(filters.endDate);
            index++;
        }

        query += ` GROUP BY DATE_TRUNC('month', b.created_at) ORDER BY month ASC`;

        const result = await db.query(query, values);
        return result.rows;
    }

    async getDashboardStats() {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
                (SELECT COUNT(*) FROM tours WHERE deleted_at IS NULL) as total_tours,
                (SELECT COUNT(*) FROM bookings WHERE deleted_at IS NULL) as total_bookings,
                (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE deleted_at IS NULL AND status = 2) as total_revenue,
                (SELECT COUNT(*) FROM bookings WHERE deleted_at IS NULL AND status = 1) as pending_bookings,
                (SELECT COUNT(*) FROM bookings WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '30 days') as recent_bookings,
                (SELECT COUNT(*) FROM email_logs WHERE sent_at >= NOW() - INTERVAL '30 days') as recent_emails,
                (SELECT COUNT(*) FROM audit_logs WHERE created_at >= NOW() - INTERVAL '7 days') as recent_audit_logs
        `;
        const result = await db.query(query);
        return result.rows[0];
    }
}

module.exports = new ReportsRepository();
