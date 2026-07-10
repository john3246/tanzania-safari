const db = require('../config/db');
async function run() {
  try {
    const r = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables:', r.rows.map(t => t.table_name));
    
    // Check safari_packages and national_parks specifically if they exist
    const tables = r.rows.map(t => t.table_name);
    if (tables.includes('safari_packages')) {
       const p = await db.query('SELECT package_name, featured_image_url FROM safari_packages LIMIT 3');
       console.log('Packages:', p.rows);
    } else if (tables.includes('packages')) {
       const p = await db.query('SELECT package_name, featured_image_url FROM packages LIMIT 3');
       console.log('Packages:', p.rows);
    }
    
    if (tables.includes('national_parks')) {
       const d = await db.query('SELECT park_name, image_url FROM national_parks LIMIT 3');
       console.log('Parks:', d.rows);
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
run();
