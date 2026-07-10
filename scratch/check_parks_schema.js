const db = require('../config/db');
async function run() {
    try {
        const s = await db.query("SELECT * FROM national_parks LIMIT 1");
        console.log(s.rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
