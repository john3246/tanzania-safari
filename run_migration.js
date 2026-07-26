const db = require('./config/db');

// Each migration step runs independently so one failure (e.g. insufficient
// privileges for CREATE EXTENSION on managed Postgres) cannot skip the rest.
async function runStep(name, sql) {
    try {
        await db.query(sql);
        return true;
    } catch (err) {
        console.error(`Migration step "${name}" failed:`, err.message);
        return false;
    }
}

async function migrate() {
    // Postgres 13+ provides gen_random_uuid() natively; this is only a fallback
    // for older servers and is allowed to fail without blocking other steps.
    await runStep('pgcrypto extension', 'CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    await runStep('core tables and columns', `
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

    await runStep('live chat tables', `
        CREATE TABLE IF NOT EXISTS chats (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            external_id VARCHAR(50) UNIQUE NOT NULL,
            status VARCHAR(50) DEFAULT 'open',
            visitor_name VARCHAR(100),
            visitor_email VARCHAR(255),
            page_url TEXT,
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
            id SERIAL PRIMARY KEY,
            chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
            sender VARCHAR(20) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_chats_external_id ON chats(external_id);
        CREATE INDEX IF NOT EXISTS idx_chats_status ON chats(status);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
    `);

    await runStep('customers table', `
        CREATE TABLE IF NOT EXISTS customers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(200),
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            source VARCHAR(50) DEFAULT 'website',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_lower ON customers (LOWER(email));
    `);

    await runStep('notifications table', `
        CREATE TABLE IF NOT EXISTS notifications (
            notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            notification_type VARCHAR(50),
            notification_title VARCHAR(200) NOT NULL,
            notification_message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT false,
            related_entity_id VARCHAR(100),
            action_url TEXT,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications (is_read, sent_at DESC);
    `);

    console.log('Database migrations completed.');
}

module.exports = migrate;

if (require.main === module) {
    migrate().then(() => process.exit(0));
}
