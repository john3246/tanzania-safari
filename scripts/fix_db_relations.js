const db = require('../config/db');

async function fixDB() {
    try {
        console.log("Fixing database relations...");

        // 1. Add reset_token columns to users
        await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)');
        await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP');
        console.log("Added reset_token columns to users table.");

        // 2. Create media table
        const createMediaTable = `
            CREATE TABLE IF NOT EXISTS media (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                original_filename VARCHAR(255) NOT NULL,
                mime_type VARCHAR(100),
                file_size INTEGER,
                path VARCHAR(255) NOT NULL,
                url VARCHAR(255) NOT NULL,
                thumbnail_url VARCHAR(255),
                webp_url VARCHAR(255),
                alt_text VARCHAR(255),
                caption TEXT,
                folder VARCHAR(255) DEFAULT 'root',
                tags JSONB DEFAULT '[]',
                entity_type VARCHAR(100),
                entity_id INTEGER,
                uploaded_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP
            );
        `;
        await db.query(createMediaTable);
        console.log("Created media table.");

        console.log("Database relations fixed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error fixing database relations:", err);
        process.exit(1);
    }
}

fixDB();
