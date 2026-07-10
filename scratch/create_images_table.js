const db = require('../config/db');
async function run() {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS site_images (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            path VARCHAR(255) NOT NULL,
            alt_text TEXT,
            entity_type VARCHAR(50),
            entity_id UUID,
            uploaded_by UUID REFERENCES users(user_id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log('site_images table created');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
