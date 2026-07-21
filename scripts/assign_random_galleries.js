const db = require('../config/db');
const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = 'production';

async function run() {
    try {

        const optimizedDir = path.join(__dirname, '..', 'public', 'images', 'optimized');
        const files = fs.readdirSync(optimizedDir);
        
        // Find all gallery images
        const galleryImages = files
            .filter(f => f.startsWith('gallery-') && f.endsWith('.webp'))
            .map(f => '/images/optimized/' + f);
            
        if (galleryImages.length === 0) {
            console.log('No gallery images found.');
            process.exit(0);
        }

        console.log(`Found ${galleryImages.length} gallery images. Assigning...`);

        function getRandomImages(count) {
            const shuffled = [...galleryImages].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        }

        // 1. Update national_parks
        const parksRes = await db.query('SELECT park_id, image_urls FROM national_parks');
        for (const park of parksRes.rows) {
            let currentImages = park.image_urls || [];
            if (!Array.isArray(currentImages)) currentImages = [currentImages];
            
            // Add 2 random gallery images
            const randomImages = getRandomImages(2);
            // Combine and ensure unique
            const newImages = [...new Set([...currentImages, ...randomImages])];
            
            await db.query('UPDATE national_parks SET image_urls = ARRAY[$1]::text[] WHERE park_id = $2', [newImages, park.park_id]);
        }
        console.log(`Updated ${parksRes.rowCount} national parks.`);

        // 2. Update safari_packages
        const safarisRes = await db.query('SELECT package_id, image_urls, featured_image_url FROM safari_packages');
        for (const safari of safarisRes.rows) {
            let currentImages = safari.image_urls || [];
            if (!Array.isArray(currentImages)) {
                if (typeof currentImages === 'string') {
                    currentImages = [currentImages];
                } else {
                    currentImages = [];
                }
            }
            if (safari.featured_image_url && !currentImages.includes(safari.featured_image_url)) {
                currentImages.unshift(safari.featured_image_url);
            }
            
            // Add 3 random gallery images
            const randomImages = getRandomImages(3);
            const newImages = [...new Set([...currentImages, ...randomImages])];
            // Update the DB
            await db.query('UPDATE safari_packages SET image_urls = ARRAY[$1]::text[] WHERE package_id = $2', [newImages, safari.package_id]);
        }
        console.log(`Updated ${safarisRes.rowCount} safari packages.`);

        console.log('Random image assignment complete!');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

run();
