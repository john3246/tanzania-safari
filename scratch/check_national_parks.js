const db = require('../config/db');
async function run() {
  const t = 'national_parks';
  const res = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${t}'`);
  console.log(`\nTable: ${t}`);
  res.rows.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
  process.exit(0);
}
run();
