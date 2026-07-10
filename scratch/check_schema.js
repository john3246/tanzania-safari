const db = require('../config/db');
async function run() {
  const tables = ['package_itinerary', 'package_destinations'];
  for (const t of tables) {
    const res = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}'`);
    console.log(`\nTable: ${t}`);
    res.rows.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
  }
  process.exit(0);
}
run();
