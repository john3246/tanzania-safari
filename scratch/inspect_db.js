const db = require('../config/db');
async function inspect() {
  const tables = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('Tables:', tables.rows.map(r => r.table_name));
  
  for (const table of tables.rows.map(r => r.table_name)) {
    const columns = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
    console.log(`\nTable: ${table}`);
    columns.rows.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
  }
  process.exit(0);
}
inspect();
