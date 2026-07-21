process.env.NODE_ENV = 'production';
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const db = require('../config/db');

async function run() {
    try {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        const targetDir = path.join(__dirname, '..', 'public', 'images', 'optimized');
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        const files = fs.readdirSync(uploadDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i));
        console.log(`Found ${files.length} images to process.`);

        // Known mappings
        const specificMappings = {
            'kilimanjaro2.jpg': 'mount-kilimanjaro-national-park',
            'giraff.jpeg': 'serengeti-national-park'
            // We can map others if needed, but we will fallback to sequential mapping
        };

        const parkRes = await db.query('SELECT park_id, park_slug FROM national_parks');
        const packageRes = await db.query('SELECT package_id, package_slug FROM safari_packages');
        
        let parks = parkRes.rows;
        let packages = packageRes.rows;

        let fileIdx = 0;

        // Process Parks
        for (const park of parks) {
            let selectedFile = null;
            // check if we have a specific mapping
            for (const [file, slug] of Object.entries(specificMappings)) {
                if (slug === park.park_slug && files.includes(file)) {
                    selectedFile = file;
                    break;
                }
            }

            if (!selectedFile && fileIdx < files.length) {
                // skip mapped files
                while (fileIdx < files.length && Object.keys(specificMappings).includes(files[fileIdx])) {
                    fileIdx++;
                }
                if (fileIdx < files.length) {
                    selectedFile = files[fileIdx];
                    fileIdx++;
                }
            }

            if (selectedFile) {
                const oldPath = path.join(uploadDir, selectedFile);
                const newName = `${park.park_slug}.webp`;
                const newPath = path.join(targetDir, newName);
                
                await sharp(oldPath)
                    .resize({ width: 1200, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(newPath);
                
                console.log(`Optimized ${selectedFile} -> ${newName}`);

                // Update DB
                // Depending on schema, park has image_urls
                const dbUrl = `/images/optimized/${newName}`;
                await db.query('UPDATE national_parks SET image_urls = ARRAY[$1]::text[] WHERE park_id = $2', [dbUrl, park.park_id]);
                // Some schemas have featured_image_url for parks?
                try {
                    await db.query('UPDATE national_parks SET featured_image_url = $1 WHERE park_id = $2', [dbUrl, park.park_id]);
                } catch (e) {
                    // ignore if column doesn't exist
                }
            }
        }

        // Process Packages
        for (const pkg of packages) {
            if (fileIdx >= files.length) break;
            
            // skip mapped files
            while (fileIdx < files.length && Object.keys(specificMappings).includes(files[fileIdx])) {
                fileIdx++;
            }
            
            if (fileIdx < files.length) {
                const selectedFile = files[fileIdx];
                const oldPath = path.join(uploadDir, selectedFile);
                const newName = `${pkg.package_slug}.webp`;
                const newPath = path.join(targetDir, newName);
                
                await sharp(oldPath)
                    .resize({ width: 1200, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(newPath);
                
                console.log(`Optimized ${selectedFile} -> ${newName}`);

                // Update DB
                const dbUrl = `/images/optimized/${newName}`;
                await db.query('UPDATE safari_packages SET featured_image_url = $1 WHERE package_id = $2', [dbUrl, pkg.package_id]);
                
                fileIdx++;
            }
        }

        // Process remaining images
        while (fileIdx < files.length) {
            const selectedFile = files[fileIdx];
            if (!Object.keys(specificMappings).includes(selectedFile)) {
                const oldPath = path.join(uploadDir, selectedFile);
                const newName = `gallery-${fileIdx}.webp`;
                const newPath = path.join(targetDir, newName);
                
                await sharp(oldPath)
                    .resize({ width: 1200, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(newPath);
                
                console.log(`Optimized ${selectedFile} -> ${newName}`);
            }
            fileIdx++;
        }

        console.log('All images optimized and DB updated successfully.');
        process.exit(0);

    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

run();
