const db = require('../config/db');
async function inspect() {
  const tables = ['safari_packages', 'national_parks', 'blog_posts', 'users', 'system_settings'];
  for (const table of tables) {
    try {
      const columns = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
      console.log(`\nTable: ${table}`);
      columns.rows.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
    } catch (e) {
      console.log(`\nTable: ${table} - Error or does not exist`);
    }
  }
  process.exit(0);
}
inspect();
