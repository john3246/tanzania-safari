const db = require('../config/db');

async function migrate() {
    try {
        await db.query(`
            ALTER TABLE contact_enquiries 
            ADD COLUMN IF NOT EXISTS responses JSONB DEFAULT '[]'::jsonb;
        `);
        console.log("Migration successful: Added responses JSONB column to contact_enquiries");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
