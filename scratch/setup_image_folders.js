const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function run() {
    try {
        console.log('Starting image folder structure setup...');

        // Base paths
        const publicImages = path.join(__dirname, '../public/images');
        const safarisDir = path.join(publicImages, 'safaris');
        const destDir = path.join(publicImages, 'destinations');

        // Ensure base directories exist
        if (!fs.existsSync(safarisDir)) fs.mkdirSync(safarisDir, { recursive: true });
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

        // Placeholder source
        const placeholderPath = path.join(publicImages, 'placeholder.jpeg');
        const hasPlaceholder = fs.existsSync(placeholderPath);

        // 1. Process Safaris
        const safarisRes = await db.query('SELECT package_id, package_slug FROM safari_packages');
        for (const safari of safarisRes.rows) {
            const slug = safari.package_slug;
            if (!slug) continue;

            const folderPath = path.join(safarisDir, slug);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
                console.log(`Created folder: ${folderPath}`);
            }

            const mainImagePath = path.join(folderPath, 'main.jpg');
            if (!fs.existsSync(mainImagePath) && hasPlaceholder) {
                fs.copyFileSync(placeholderPath, mainImagePath);
            }

            const dbPath = `/images/safaris/${slug}/main.jpg`;
            await db.query(
                'UPDATE safari_packages SET featured_image_url = $1, image_urls = ARRAY[$1]::text[] WHERE package_id = $2',
                [dbPath, safari.package_id]
            );
        }

        // 2. Process Destinations
        const destRes = await db.query('SELECT park_id, park_slug FROM national_parks');
        for (const dest of destRes.rows) {
            const slug = dest.park_slug;
            if (!slug) continue;

            const folderPath = path.join(destDir, slug);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
                console.log(`Created folder: ${folderPath}`);
            }

            const mainImagePath = path.join(folderPath, 'main.jpg');
            if (!fs.existsSync(mainImagePath) && hasPlaceholder) {
                fs.copyFileSync(placeholderPath, mainImagePath);
            }

            const dbPath = `/images/destinations/${slug}/main.jpg`;
            await db.query(
                'UPDATE national_parks SET image_urls = ARRAY[$1]::text[] WHERE park_id = $2',
                [dbPath, dest.park_id]
            );
        }

        console.log('Successfully set up all slug-based image folders and updated the database!');
    } catch (e) {
        console.error('Error during setup:', e);
    } finally {
        process.exit(0);
    }
}

run();
