const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function renameImages() {
    try {
        // 1. Get slugs
        const packageRes = await db.query('SELECT package_id, package_slug FROM safari_packages');
        const parkRes = await db.query('SELECT park_id, park_slug FROM national_parks');
        
        const packages = packageRes.rows;
        const parks = parkRes.rows;
        
        // 2. List upload files
        const uploadDir = path.join(__dirname, 'uploads');
        const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
        
        console.log(`Found ${files.length} images in uploads.`);
        
        const targetDir = path.join(__dirname, 'public', 'images');
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
        
        let fileIdx = 0;
        
        // 3. Rename for packages
        for (const pkg of packages) {
            if (fileIdx >= files.length) break;
            
            const oldPath = path.join(uploadDir, files[fileIdx]);
            const newName = `${pkg.package_slug}.jpg`;
            const newPath = path.join(targetDir, newName);
            
            fs.copyFileSync(oldPath, newPath);
            console.log(`Copied ${files[fileIdx]} to ${newName}`);
            
            // Update DB
            await db.query('UPDATE safari_packages SET featured_image_url = $1, image_urls = array_append(image_urls, $1) WHERE package_id = $2', [`/images/${newName}`, pkg.package_id]);
            
            fileIdx++;
        }
        
        // 4. Rename for parks
        for (const park of parks) {
            if (fileIdx >= files.length) break;
            
            const oldPath = path.join(uploadDir, files[fileIdx]);
            const newName = `${park.park_slug}.jpg`;
            const newPath = path.join(targetDir, newName);
            
            fs.copyFileSync(oldPath, newPath);
            console.log(`Copied ${files[fileIdx]} to ${newName}`);
            
            // Update DB
            await db.query('UPDATE national_parks SET image_urls = ARRAY[$1]::text[] WHERE park_id = $2', [`/images/${newName}`, park.park_id]);
            
            fileIdx++;
        }
        
        console.log('Renaming and DB update complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

renameImages();
