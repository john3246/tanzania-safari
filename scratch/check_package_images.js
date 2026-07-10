const db = require('../config/db');
async function run() {
    try {
        const s = await db.query("SELECT package_id, package_name, is_active, is_featured, featured_image_url FROM safari_packages");
        console.log(JSON.stringify(s.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
