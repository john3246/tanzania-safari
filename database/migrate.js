const db = require('../config/db');
const fs = require('fs');
const sql = fs.readFileSync('./database/migrations.sql', 'utf8');
db.query(sql)
  .then(() => { console.log('Migration completed successfully'); process.exit(0); })
  .catch(e => { console.error('Migration error:', e.message); process.exit(1); });
