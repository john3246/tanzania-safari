const fs = require('fs');
const path = require('path');
const db = require('./config/db');

async function sync() {
    const publicImagesPath = path.join(__dirname, 'public/images');
    const uploadsPath = path.join(__dirname, 'uploads');
    let added = 0;

    const walkDir = async (dir, basePath, isPublic) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                await walkDir(fullPath, basePath, isPublic);
            } else {
                const ext = path.extname(file).toLowerCase();
                if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) {
                    const relPath = fullPath.substring(basePath.length).replace(/\\/g, '/');
                    const finalUrl = (isPublic ? '/images' : '/uploads') + relPath;
                    
                    try {
                        const existing = await db.query('SELECT id FROM media_library WHERE url = $1', [finalUrl]);
                        if (existing.rows.length === 0) {
                            await db.query(
                                'INSERT INTO media_library (filename, original_name, url, file_size, mime_type, folder) VALUES ($1, $2, $3, $4, $5, $6)', 
                                [file, file, finalUrl, stat.size, 'image/' + ext.replace('.', ''), isPublic ? 'public/images' : 'uploads']
                            );
                            added++;
                            console.log('Added ' + finalUrl);
                        }
                    } catch (e) {
                        console.error('Error inserting', finalUrl, e.message);
                    }
                }
            }
        }
    };

    await walkDir(publicImagesPath, publicImagesPath, true);
    await walkDir(uploadsPath, uploadsPath, false);
    console.log('Added ' + added + ' images to database.');
    process.exit(0);
}

sync().catch(console.error);
