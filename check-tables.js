const db = require('./config/db');

async function testQueries() {
    console.log('Testing database queries...\n');
    
    try {
        // Test stats
        const stats = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM safari_packages WHERE is_active = true) as packages,
                (SELECT COUNT(*) FROM national_parks WHERE is_active = true) as parks,
                (SELECT COUNT(*) FROM package_categories WHERE is_active = true) as categories
        `);
        console.log('Stats:', stats.rows[0]);
        
        // Test featured packages
        const packages = await db.query(`
            SELECT package_name, base_price_usd, duration_days
            FROM safari_packages
            WHERE is_active = true AND is_featured = true
            LIMIT 3
        `);
        console.log('\nFeatured Packages:');
        packages.rows.forEach(pkg => {
            console.log(`  - ${pkg.package_name}: $${pkg.base_price_usd}`);
        });
        
        // Test destinations
        const destinations = await db.query(`
            SELECT park_name
            FROM national_parks
            WHERE is_active = true
            LIMIT 3
        `);
        console.log('\nDestinations:');
        destinations.rows.forEach(dest => {
            console.log(`  - ${dest.park_name}`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
    
    process.exit();
}

testQueries();