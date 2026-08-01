const db = require('../config/db');

class EnquiryRepository {
    async create(data) {
        const query = `
            INSERT INTO contact_enquiries (
                full_name, email, phone, country, enquiry_type, 
                package_id, preferred_travel_date, number_of_travelers, 
                enquiry_message, ip_address, enquiry_status, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::inet, 'New', NOW())
            RETURNING enquiry_id
        `;
        const params = [
            data.full_name, data.email, data.phone || null, data.country || null,
            data.enquiry_type || 'General', data.package_id || null,
            data.travel_date || null, data.travelers || null,
            data.message || 'Enquiry', data.ip_address || null
        ];
        try {
            const result = await db.query(query, params);
            return result.rows[0];
        } catch (err) {
            // Retry without ip if inet cast fails
            if (String(err.message || '').toLowerCase().includes('inet') || err.code === '22P02') {
                const result = await db.query(`
                    INSERT INTO contact_enquiries (
                        full_name, email, phone, country, enquiry_type,
                        package_id, preferred_travel_date, number_of_travelers,
                        enquiry_message, enquiry_status, created_at
                    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'New',NOW())
                    RETURNING enquiry_id
                `, params.slice(0, 9));
                return result.rows[0];
            }
            throw err;
        }
    }

    async createGroupRequest(data) {
        const query = `
            INSERT INTO contact_enquiries (
                full_name, email, phone, country, enquiry_type,
                package_id, departure_id, preferred_travel_date, number_of_travelers,
                seats_held, deposit_percent, deposit_amount_usd, deposit_due_at,
                enquiry_message, ip_address, enquiry_status, seats_adjusted, created_at
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::inet,'New',false,NOW()
            )
            RETURNING enquiry_id, departure_id, seats_held, deposit_amount_usd, deposit_due_at
        `;
        const params = [
            data.full_name,
            data.email,
            data.phone || null,
            data.country || null,
            data.enquiry_type || 'Group',
            data.package_id || null,
            data.departure_id || null,
            data.travel_date || null,
            data.travelers || 1,
            data.seats_held || data.travelers || 1,
            data.deposit_percent != null ? data.deposit_percent : 30,
            data.deposit_amount_usd != null ? data.deposit_amount_usd : null,
            data.deposit_due_at || null,
            data.message || 'Group safari request',
            data.ip_address || null
        ];
        try {
            const result = await db.query(query, params);
            return result.rows[0];
        } catch (err) {
            if (String(err.message || '').toLowerCase().includes('inet') || err.code === '22P02') {
                const result = await db.query(`
                    INSERT INTO contact_enquiries (
                        full_name, email, phone, country, enquiry_type,
                        package_id, departure_id, preferred_travel_date, number_of_travelers,
                        seats_held, deposit_percent, deposit_amount_usd, deposit_due_at,
                        enquiry_message, enquiry_status, seats_adjusted, created_at
                    ) VALUES (
                        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'New',false,NOW()
                    )
                    RETURNING enquiry_id, departure_id, seats_held, deposit_amount_usd, deposit_due_at
                `, params.slice(0, 14));
                return result.rows[0];
            }
            throw err;
        }
    }

    async getAll() {
        const query = `
            SELECT ce.*, sp.package_name,
                   gd.departure_slug, gd.start_date AS departure_start,
                   gd.title_override
            FROM contact_enquiries ce
            LEFT JOIN safari_packages sp ON ce.package_id = sp.package_id
            LEFT JOIN group_departures gd ON ce.departure_id = gd.departure_id
            ORDER BY ce.created_at DESC
        `;
        try {
            const result = await db.query(query);
            return result.rows;
        } catch (err) {
            // Fallback if group columns / join not available yet
            const result = await db.query(`
                SELECT ce.*, sp.package_name
                FROM contact_enquiries ce
                LEFT JOIN safari_packages sp ON ce.package_id = sp.package_id
                ORDER BY ce.created_at DESC
            `);
            return result.rows;
        }
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
