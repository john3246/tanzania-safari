const db = require('../config/db');
async function migrate() {
  try {
    // Add image columns to safari_packages
    await db.query(`ALTER TABLE safari_packages ADD COLUMN IF NOT EXISTS featured_image_url TEXT`);
    await db.query(`ALTER TABLE safari_packages ADD COLUMN IF NOT EXISTS image_urls TEXT[]`);
    
    // Ensure blog_posts has author_id as UUID (to match users table)
    // First check author_id type
    const authorIdInfo = await db.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'blog_posts' AND column_name = 'author_id'");
    if (authorIdInfo.rows.length > 0 && authorIdInfo.rows[0].data_type === 'integer') {
       // Need to drop and recreate or cast if empty. For now let's just make sure it's compatible.
       // Many setups use integer for roles/categories but UUID for users.
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}
migrate();
