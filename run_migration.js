const db = require('./config/db');

async function migrate() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS booking_communications (
                communication_id SERIAL PRIMARY KEY,
                booking_id UUID REFERENCES bookings(booking_id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL, -- e.g., 'email', 'note', 'status_change', 'system'
                subject VARCHAR(255),
                content TEXT NOT NULL,
                direction VARCHAR(20), -- 'inbound', 'outbound', 'internal'
                sender_id UUID REFERENCES users(user_id) ON DELETE SET NULL, -- Null if system generated
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Add missing columns to bookings for financials if needed
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0.00;
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2) DEFAULT 0.00;
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0.00;
        `);
        console.log("Migration successful!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
