const db = require('../config/db');
async function run() {
    try {
        const s = await db.query("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'site_images'");
        console.log(s.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
