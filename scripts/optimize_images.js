const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const db = require('../config/db');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const destPublicDir = path.join(__dirname, '..', 'public', 'images', 'destinations');
const safariPublicDir = path.join(__dirname, '..', 'public', 'images', 'safaris');

async function processImage(sourcePath, destPath) {
    if (!fs.existsSync(sourcePath)) {
        console.warn(`Warning: Source file not found: ${sourcePath}`);
        return null;
    }
    
    // Create directory if not exists
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    try {
        await sharp(sourcePath)
            .resize({ width: 1200, withoutEnlargement: true }) // Optimize size for web hero
            .webp({ quality: 80 })
            .toFile(destPath);
        console.log(`Optimized: ${path.basename(destPath)}`);
        return true;
    } catch (e) {
        console.error(`Error processing ${sourcePath}:`, e);
        return false;
    }
}

async function optimizeImages() {
    try {
        console.log('Fetching destinations from DB...');
        const dests = await db.query('SELECT park_id, park_slug, park_name, featured_image_url FROM national_parks');
        
        for (const dest of dests.rows) {
            let imgUrl = dest.featured_image_url;
            if (imgUrl && imgUrl.startsWith('/uploads/')) {
                const filename = path.basename(imgUrl);
                const sourcePath = path.join(uploadsDir, filename);
                const newFilename = `tanzania-safari-${dest.park_slug}.webp`;
                const destPath = path.join(destPublicDir, dest.park_slug, newFilename);
                const newDbUrl = `/images/destinations/${dest.park_slug}/${newFilename}`;

                if (await processImage(sourcePath, destPath)) {
                    await db.query('UPDATE national_parks SET featured_image_url = $1 WHERE park_id = $2', [newDbUrl, dest.park_id]);
                    console.log(`Updated DB for ${dest.park_name}`);
                }
            } else if (imgUrl && imgUrl.startsWith('/images/destinations/')) {
               // If it's already in public, let's optimize it too if it's not webp
               if (!imgUrl.endsWith('.webp')) {
                    const sourcePath = path.join(__dirname, '..', 'public', imgUrl);
                    const newFilename = `tanzania-safari-${dest.park_slug}.webp`;
                    const destPath = path.join(destPublicDir, dest.park_slug, newFilename);
                    const newDbUrl = `/images/destinations/${dest.park_slug}/${newFilename}`;

                    if (await processImage(sourcePath, destPath)) {
                        await db.query('UPDATE national_parks SET featured_image_url = $1 WHERE park_id = $2', [newDbUrl, dest.park_id]);
                        console.log(`Updated DB for ${dest.park_name} (from public)`);
                    }
               }
            }
        }

        console.log('Fetching safaris from DB...');
        const safaris = await db.query('SELECT package_id, package_slug, package_name, featured_image_url, image_urls FROM safari_packages');
        
        for (const safari of safaris.rows) {
            let imgUrl = safari.featured_image_url;
            if (imgUrl && imgUrl.startsWith('/uploads/')) {
                const filename = path.basename(imgUrl);
                const sourcePath = path.join(uploadsDir, filename);
                const newFilename = `safari-${safari.package_slug}-featured.webp`;
                const destPath = path.join(safariPublicDir, safari.package_slug, newFilename);
                const newDbUrl = `/images/safaris/${safari.package_slug}/${newFilename}`;

                if (await processImage(sourcePath, destPath)) {
                    await db.query('UPDATE safari_packages SET featured_image_url = $1 WHERE package_id = $2', [newDbUrl, safari.package_id]);
                    console.log(`Updated DB featured image for ${safari.package_name}`);
                }
            }

            // Process image_urls (JSON array)
            if (safari.image_urls && Array.isArray(safari.image_urls)) {
                let newImageUrls = [];
                for (let i = 0; i < safari.image_urls.length; i++) {
                    let gImg = safari.image_urls[i];
                    if (gImg && gImg.startsWith('/uploads/')) {
                        const filename = path.basename(gImg);
                        const sourcePath = path.join(uploadsDir, filename);
                        const newFilename = `safari-${safari.package_slug}-${i+1}.webp`;
                        const destPath = path.join(safariPublicDir, safari.package_slug, newFilename);
                        const newDbUrl = `/images/safaris/${safari.package_slug}/${newFilename}`;
                        
                        if (await processImage(sourcePath, destPath)) {
                            newImageUrls.push(newDbUrl);
                        } else {
                            newImageUrls.push(gImg);
                        }
                    } else {
                        newImageUrls.push(gImg);
                    }
                }
                
                // Update JSON array in DB
                await db.query('UPDATE safari_packages SET image_urls = $1 WHERE package_id = $2', [JSON.stringify(newImageUrls), safari.package_id]);
            }
        }
        
        // Also process remaining images in uploads that are not in DB and put them in a generic webp format
        console.log('Processing remaining uploads...');
        const allUploads = fs.readdirSync(uploadsDir);
        let count = 1;
        for (const file of allUploads) {
            if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
                const sourcePath = path.join(uploadsDir, file);
                const destPath = path.join(__dirname, '..', 'public', 'images', 'optimized', `safari-misc-${count}.webp`);
                if (!fs.existsSync(path.dirname(destPath))) {
                    fs.mkdirSync(path.dirname(destPath), { recursive: true });
                }
                await processImage(sourcePath, destPath);
                count++;
            }
        }

        console.log('Done organizing images.');

    } catch (e) {
        console.error('Error in optimization script:', e);
    }
    process.exit(0);
}

optimizeImages();
