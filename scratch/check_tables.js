const db = require('../config/db');
async function run() {
    try {
        const s = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log(s.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
