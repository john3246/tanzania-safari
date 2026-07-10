const db = require('../config/db');

async function testSearch() {
  const search = 'kilimanjaro';
  const query = 'SELECT package_name FROM safari_packages WHERE package_name ILIKE $1 OR short_description ILIKE $2';
  try {
    const res = await db.query(query, ['%' + search + '%', '%' + search + '%']);
    console.log('Search Results:', res.rows);
  } catch(e) {
    console.error(e);
  }
  
  const schema = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'safari_packages'");
  console.log('Columns:', schema.rows.map(r => r.column_name));
  
  process.exit(0);
}
testSearch();
