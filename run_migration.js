const db = require('./config/db');

async function migrate() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS booking_communications (
                communication_id SERIAL PRIMARY KEY,
                booking_id UUID REFERENCES bookings(booking_id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                subject VARCHAR(255),
                content TEXT NOT NULL,
                direction VARCHAR(20),
                sender_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) DEFAULT 0.00;
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2) DEFAULT 0.00;
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0.00;

            ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS responses JSONB DEFAULT '[]'::jsonb;
            ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            ALTER TABLE media_library ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
            ALTER TABLE reviews ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
            ALTER TABLE reviews ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
            ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment TEXT;
            ALTER TABLE safari_packages ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb;
        `);
        console.log("Database migrations applied successfully!");
    } catch (err) {
        console.error("Migration warning/failed:", err.message);
    }
}

module.exports = migrate;

if (require.main === module) {
    migrate().then(() => process.exit(0));
}
