const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runMigrations() {
    const migrationsDir = path.join(__dirname, 'migrations');
    
    try {
        const files = fs.readdirSync(migrationsDir).sort();
        
        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(`Running migration: ${file}`);
                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');
                
                await db.query(sql);
                console.log(`Successfully completed migration: ${file}`);
            }
        }
        console.log('All migrations executed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        // Close the pool if we are running as a standalone script
        if (require.main === module) {
            db.pool.end();
        }
    }
}

if (require.main === module) {
    runMigrations();
}

module.exports = runMigrations;
