const fs = require('fs');
const path = require('path');
const db = require('./config/db');

function generateSlug(filename) {
    const nameWithoutExt = path.parse(filename).name;
    return nameWithoutExt
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getMimeType(ext) {
    const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.bmp'];
    const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];

    const cleanExt = ext.replace('.', '').toLowerCase();

    if (imageExts.includes(ext)) {
        if (cleanExt === 'jpg' || cleanExt === 'jpeg') return 'image/jpeg';
        if (cleanExt === 'svg') return 'image/svg+xml';
        return `image/${cleanExt}`;
    }
    if (videoExts.includes(ext)) {
        if (cleanExt === 'mov') return 'video/quicktime';
        if (cleanExt === 'mkv') return 'video/x-matroska';
        return `video/${cleanExt}`;
    }
    return 'application/octet-stream';
}

async function sync() {
    const publicImagesPath = path.join(__dirname, 'public/images');
    const uploadsPath = path.join(__dirname, 'uploads');
    
    let added = 0;
    let updated = 0;

    const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.bmp'];
    const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
    const allowedExts = [...imageExts, ...videoExts];

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
                if (allowedExts.includes(ext)) {
                    const relPath = fullPath.substring(basePath.length).replace(/\\/g, '/');
                    const finalUrl = (isPublic ? '/images' : '/uploads') + relPath;
                    const fileSlug = generateSlug(file);
                    const mimeType = getMimeType(ext);
                    const folderName = isPublic ? 'public/images' : 'uploads';

                    try {
                        const existing = await db.query('SELECT id, slug FROM media_library WHERE url = $1', [finalUrl]);
                        if (existing.rows.length === 0) {
                            await db.query(
                                `INSERT INTO media_library (filename, original_name, url, file_size, mime_type, folder, slug) 
                                 VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
                                [file, file, finalUrl, stat.size, mimeType, folderName, fileSlug]
                            );
                            added++;
                            console.log(`[ADDED] ${finalUrl} (slug: ${fileSlug}, mime: ${mimeType})`);
                        } else {
                            await db.query(
                                `UPDATE media_library 
                                 SET slug = $1, mime_type = $2, file_size = $3, updated_at = NOW() 
                                 WHERE id = $4`,
                                [fileSlug, mimeType, stat.size, existing.rows[0].id]
                            );
                            updated++;
                        }
                    } catch (e) {
                        console.error('Error processing media file:', finalUrl, e.message);
                    }
                }
            }
        }
    };

    console.log('Scanning local images & videos...');
    await walkDir(publicImagesPath, publicImagesPath, true);
    await walkDir(uploadsPath, uploadsPath, false);

    console.log(`Sync Complete: Added ${added} new media files, updated ${updated} existing records.`);
    process.exit(0);
}

sync().catch(console.error);
