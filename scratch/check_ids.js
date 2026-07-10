const db = require('../config/db');
async function run() {
    try {
        const b = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_id'");
        const e = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'contact_enquiries' AND column_name = 'enquiry_id'");
        const p = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'safari_packages' AND column_name = 'package_id'");
        console.log({bookings: b.rows, enquiries: e.rows, packages: p.rows});
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
