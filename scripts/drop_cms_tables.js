const db = require('../config/db');

async function drop() {
    try {
        console.log("Dropping new CMS tables...");
        await db.query(`
            DROP TABLE IF EXISTS related_tours CASCADE;
            DROP TABLE IF EXISTS tours CASCADE;
            DROP TABLE IF EXISTS tour_categories CASCADE;
            DROP TABLE IF EXISTS destinations CASCADE;
        `);
        console.log("Dropped tables successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Drop failed:", err);
        process.exit(1);
    }
}

drop();
