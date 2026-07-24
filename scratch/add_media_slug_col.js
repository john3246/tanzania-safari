const db = require('../config/db');

async function migrate() {
    try {
        await db.query(`
            ALTER TABLE media_library 
            ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
        `);
        console.log("Migration successful: Added slug column to media_library table");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
