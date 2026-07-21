process.env.NODE_ENV = 'production';
const db = require('../config/db');

async function mapImages() {
    try {
        console.log('--- Destinations ---');
        const dests = await db.query('SELECT * FROM national_parks LIMIT 1');
        console.log(dests.rows[0]);

        console.log('\n--- Safaris ---');
        const safaris = await db.query('SELECT * FROM safari_packages LIMIT 1');
        console.log(safaris.rows[0]);
        
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

mapImages();
