const db = require('../config/db');

class EnquiryRepository {
    async create(data) {
        const query = `
            INSERT INTO contact_enquiries (
                full_name, email, phone, country, enquiry_type, 
                package_id, preferred_travel_date, number_of_travelers, 
                enquiry_message, ip_address, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            RETURNING enquiry_id
        `;
        const params = [
            data.full_name, data.email, data.phone || null, data.country || null,
            data.enquiry_type || 'General', data.package_id || null,
            data.travel_date || null, data.travelers || null,
            data.message, data.ip_address || null
        ];
        const result = await db.query(query, params);
        return result.rows[0];
    }

    async getAll() {
        const query = `
            SELECT ce.*, sp.package_name
            FROM contact_enquiries ce
            LEFT JOIN safari_packages sp ON ce.package_id = sp.package_id
            ORDER BY ce.created_at DESC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getById(id) {
        const query = `
            SELECT ce.*, sp.package_name 
            FROM contact_enquiries ce 
            LEFT JOIN safari_packages sp ON ce.package_id = sp.package_id 
            WHERE ce.enquiry_id = $1
        `;
        const result = await db.query(query, [id]);
        return result.rows[0];
    }

    async respond(id, notes) {
        const query = `
            UPDATE contact_enquiries 
            SET enquiry_status = 'Responded', response_notes = $1, responded_at = NOW()
            WHERE enquiry_id = $2
        `;
        await db.query(query, [notes, id]);
    }
}

module.exports = new EnquiryRepository();
