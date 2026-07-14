const db = require('../config/db');
db.query('SELECT park_name, park_slug, image_urls FROM national_parks')
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(() => process.exit());
