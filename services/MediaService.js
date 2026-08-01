const BaseService = require('./BaseService');
const mediaRepository = require('../repositories/MediaRepository');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class MediaService extends BaseService {
    constructor() {
        super(mediaRepository);
    }

    generateSlug(filename) {
        const nameWithoutExt = path.parse(filename).name;
        return nameWithoutExt
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    async scanLocalDirectories() {
        const publicImagesPath = path.join(__dirname, '../public/images');
        const uploadsPath = path.join(__dirname, '../uploads');
        let allFiles = [];

        const imageExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.bmp'];
        const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
        const allowedExts = [...imageExts, ...videoExts];

        const walkDir = (dir, basePath, isPublic) => {
            if (!fs.existsSync(dir)) return;
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    walkDir(fullPath, basePath, isPublic);
                } else {
                    const ext = path.extname(file).toLowerCase();
                    if (allowedExts.includes(ext)) {
                        const relPath = fullPath.substring(basePath.length).replace(/\\/g, '/');
                        const finalUrl = (isPublic ? '/images' : '/uploads') + relPath;
                        const isVideo = videoExts.includes(ext);
                        const mimeType = isVideo ? (ext === '.mov' ? 'video/quicktime' : `video/${ext.replace('.', '')}`) : (ext === '.svg' ? 'image/svg+xml' : `image/${ext.replace('.', '')}`);

                        allFiles.push({
                            id: crypto.randomUUID(),
                            filename: file,
                            original_name: file,
                            url: finalUrl,
                            slug: this.generateSlug(file),
                            file_size: stat.size,
                            created_at: stat.birthtime,
                            mime_type: mimeType,
                            folder: isPublic ? 'public/images' : 'uploads',
                            is_scanned: true
                        });
                    }
                }
            }
        };

        walkDir(publicImagesPath, publicImagesPath, true);
        walkDir(uploadsPath, uploadsPath, false);
        return allFiles;
    }

    async syncDiskFilesToDatabase() {
        try {
            const scannedFiles = await this.scanLocalDirectories();
            const db = require('../config/db');
            
            const existingRes = await db.query('SELECT url, slug FROM media_library WHERE deleted_at IS NULL');
            const existingUrls = new Set(existingRes.rows.map(r => r.url));
            const urlToSlug = new Map(existingRes.rows.map(r => [r.url, r.slug]));

            for (const file of scannedFiles) {
                if (!existingUrls.has(file.url)) {
                    await db.query(
                        `INSERT INTO media_library (id, filename, original_name, url, slug, file_size, mime_type, folder, created_at)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                         ON CONFLICT DO NOTHING`,
                        [file.id, file.filename, file.original_name, file.url, file.slug, file.file_size, file.mime_type, file.folder]
                    );
                } else if (!urlToSlug.get(file.url)) {
                    await db.query(
                        `UPDATE media_library SET slug = $1 WHERE url = $2 AND (slug IS NULL OR slug = '')`,
                        [file.slug, file.url]
                    );
                }
            }
        } catch (err) {
            console.error('Error syncing disk files to database:', err.message);
        }
    }

    async getAll(conditions = {}, options = {}) {
        try {
            // 1. Scan disk files (public/images and uploads)
            const diskFiles = await this.scanLocalDirectories();

            // 2. Auto-sync missing disk files to database asynchronously
            this.syncDiskFilesToDatabase().catch(err => console.error('Background sync warning:', err.message));

            // 3. Query PostgreSQL database
            let dbFiles = [];
            try {
                dbFiles = await this.repository.findAllWithDetails(conditions, options);
            } catch (dbErr) {
                console.warn('Database query fallback to disk files:', dbErr.message);
            }

            // 4. Merge disk files & DB records by URL (disk files guarantee images on Render)
            const map = new Map();
            
            // Add disk files first
            diskFiles.forEach(f => {
                map.set(f.url, f);
            });

            // Add/override with DB files
            dbFiles.forEach(f => {
                if (f.url) {
                    map.set(f.url, {
                        id: f.id,
                        filename: f.filename || path.basename(f.url),
                        original_name: f.original_name || f.filename,
                        url: f.url,
                        slug: f.slug || this.generateSlug(f.filename || f.url),
                        file_size: f.file_size || 0,
                        mime_type: f.mime_type || 'image/jpeg',
                        folder: f.folder || 'public/images',
                        created_at: f.created_at || new Date()
                    });
                }
            });

            const allMerged = Array.from(map.values());
            
            // Apply search filtering if provided
            let filtered = allMerged;
            if (options.search) {
                const searchLower = options.search.toLowerCase();
                filtered = filtered.filter(f => 
                    (f.filename || '').toLowerCase().includes(searchLower) ||
                    (f.slug || '').toLowerCase().includes(searchLower) ||
                    (f.url || '').toLowerCase().includes(searchLower)
                );
            }

            return {
                data: filtered,
                total: filtered.length
            };
        } catch (error) {
            console.error('Error fetching media assets:', error);
            const fallbackDiskFiles = await this.scanLocalDirectories();
            return {
                data: fallbackDiskFiles,
                total: fallbackDiskFiles.length
            };
        }
    }

    async getById(id) {
        const media = await this.repository.findById(id);
        if (!media || media.deleted_at) {
            throw new Error('Media not found');
        }
        if (!media.slug && media.filename) {
            media.slug = this.generateSlug(media.filename);
        }
        return media;
    }

    async processUpload(file, body, userId) {
        if (!file) throw new Error('No file provided');

        const { alt_text, caption, folder } = body || {};
        // services/ → project root uploads/
        const uploadDir = path.join(__dirname, '../uploads');

        const targetFolder = (folder || 'profiles').replace(/[^a-z0-9/_-]/gi, '') || 'profiles';
        const folderPath = path.join(uploadDir, targetFolder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const baseName = path.parse(file.originalname).name.replace(/[^a-z0-9_-]/gi, '-').slice(0, 40) || 'upload';
        const uniqueName = `${baseName}-${crypto.randomBytes(8).toString('hex')}${ext}`;
        const outputPath = path.join(folderPath, uniqueName);
        const publicPath = `/uploads/${targetFolder}/${uniqueName}`;
        const fileSlug = this.generateSlug(file.originalname);

        // Multer already wrote temp file — copy into destination
        const sourcePath = file.path;
        if (!sourcePath || !fs.existsSync(sourcePath)) {
            throw new Error('Uploaded temp file missing');
        }
        fs.copyFileSync(sourcePath, outputPath);

        let webpPath = null;
        let thumbnailPath = null;
        try {
            if (file.mimetype && file.mimetype.startsWith('image/')) {
                webpPath = outputPath.replace(ext, '.webp');
                await sharp(sourcePath)
                    .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(webpPath);

                thumbnailPath = outputPath.replace(ext, '-thumb.webp');
                await sharp(sourcePath)
                    .resize({ width: 400, height: 300, fit: 'cover' })
                    .webp({ quality: 70 })
                    .toFile(thumbnailPath);
            }
        } catch (imgErr) {
            console.warn('Image optimize skipped:', imgErr.message);
        }

        try {
            fs.unlinkSync(sourcePath);
        } catch (_) {}

        // Match media_library schema (url, original_name, …)
        const mediaData = {
            filename: uniqueName,
            original_name: file.originalname,
            mime_type: file.mimetype,
            file_size: file.size,
            url: publicPath,
            slug: fileSlug,
            alt_text: alt_text || null,
            caption: caption || null,
            folder: targetFolder,
            uploaded_by: userId || null
        };

        let saved = null;
        try {
            saved = await this.repository.create(mediaData);
        } catch (dbErr) {
            console.warn('media_library insert failed (file still saved):', dbErr.message);
        }

        return {
            ...(saved || {}),
            id: saved?.id,
            filename: uniqueName,
            path: publicPath,
            url: publicPath,
            slug: fileSlug,
            thumbnail_url: thumbnailPath ? `/uploads/${targetFolder}/${path.basename(thumbnailPath)}` : null,
            webp_url: webpPath ? `/uploads/${targetFolder}/${path.basename(webpPath)}` : null
        };
    }

    async processMultipleUploads(files, body, userId) {
        if (!files || files.length === 0) throw new Error('No files provided');

        const uploads = [];
        for (const file of files) {
            try {
                const media = await this.processUpload(file, body, userId);
                uploads.push(media);
            } catch (error) {
                console.error('Error processing file:', file.originalname, error);
            }
        }

        return uploads;
    }

    async update(id, data) {
        const { filename, slug, alt_text, url, file_size, mime_type, folder } = data;
        const db = require('../config/db');
        
        const check = await db.query('SELECT * FROM media_library WHERE id = $1 OR url = $2', [id, url]);
        if (check.rows.length === 0) {
            await db.query(
                `INSERT INTO media_library (id, filename, original_name, url, slug, file_size, mime_type, folder, alt_text, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
                [id, filename || 'file', filename || 'file', url || `/uploads/${filename}`, slug || 'slug', file_size || 0, mime_type || 'image/jpeg', folder || 'public/images', alt_text || '']
            );
        } else {
            const rowId = check.rows[0].id;
            await db.query(
                `UPDATE media_library 
                 SET filename = COALESCE($1, filename), 
                     slug = COALESCE($2, slug), 
                     alt_text = COALESCE($3, alt_text), 
                     updated_at = NOW() 
                 WHERE id = $4`,
                [filename, slug, alt_text, rowId]
            );
        }
        const updated = await db.query('SELECT * FROM media_library WHERE id = $1 OR url = $2', [id, url]);
        return updated.rows[0];
    }

    async deleteMedia(id) {
        const db = require('../config/db');
        
        let media = null;
        try {
            const res = await db.query('SELECT * FROM media_library WHERE id = $1', [id]);
            if (res.rows.length > 0) media = res.rows[0];
        } catch (e) {}

        const targetUrl = media ? (media.url || media.path || '') : '';

        const projectRoot = path.join(__dirname, '..');
        let filesToDelete = [];

        if (targetUrl.startsWith('/images/')) {
            filesToDelete.push(path.join(projectRoot, 'public', targetUrl));
        } else if (targetUrl.startsWith('/uploads/')) {
            filesToDelete.push(path.join(projectRoot, targetUrl));
        }

        for (const file of filesToDelete) {
            try {
                if (file && fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            } catch (err) {
                console.error('Failed to unlink file:', file, err.message);
            }
        }

        try {
            await db.query('DELETE FROM media_library WHERE id = $1 OR url = $2', [id, targetUrl]);
        } catch (dbErr) {
            console.error('Failed DB delete row:', dbErr.message);
        }

        return { success: true };
    }

    async softDelete(id) {
        return await this.repository.softDelete(id);
    }

    async restore(id) {
        return await this.repository.restore(id);
    }

    async replaceMedia(id, file) {
        const media = await this.repository.findById(id);
        if (!media) throw new Error('Media not found');

        if (!file) throw new Error('No new file provided');

        const uploadDir = path.join(__dirname, '../../uploads');
        const folderPath = path.join(uploadDir, media.folder);
        const outputPath = path.join(folderPath, media.filename);

        // Delete old files
        const filesToDelete = [outputPath];
        if (media.webp_url) {
            filesToDelete.push(path.join(uploadDir, media.webp_url.replace('/uploads/', '')));
        }
        if (media.thumbnail_url) {
            filesToDelete.push(path.join(uploadDir, media.thumbnail_url.replace('/uploads/', '')));
        }

        for (const file of filesToDelete) {
            try {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
            } catch (err) {
                console.error('Failed to delete old file:', err);
            }
        }

        // Process new file
        let webpPath = null;
        let thumbnailPath = null;

        if (file.mimetype.startsWith('image/')) {
            fs.writeFileSync(outputPath, fs.readFileSync(file.path));

            webpPath = outputPath.replace(path.extname(outputPath), '.webp');
            await sharp(file.path)
                .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(webpPath);

            thumbnailPath = outputPath.replace(path.extname(outputPath), '-thumb.webp');
            await sharp(file.path)
                .resize({ width: 400, height: 300, fit: 'cover' })
                .webp({ quality: 70 })
                .toFile(thumbnailPath);
        } else {
            fs.writeFileSync(outputPath, fs.readFileSync(file.path));
        }

        // Delete temp file
        try {
            fs.unlinkSync(file.path);
        } catch (err) {
            console.error('Error deleting temporary file:', err);
        }

        // Update DB
        const updateData = {
            original_filename: file.originalname,
            mime_type: file.mimetype,
            file_size: file.size,
            webp_url: webpPath ? `/uploads/${media.folder}/${path.basename(webpPath)}` : null,
            thumbnail_url: thumbnailPath ? `/uploads/${media.folder}/${path.basename(thumbnailPath)}` : null
        };

        await this.repository.update(id, updateData);
        return this.repository.findById(id);
    }

    async getFolders() {
        return await this.repository.getFolders();
    }

    async getByFolder(folder, options = {}) {
        return await this.repository.getByFolder(folder, options);
    }

    async getByEntity(entityType, entityId, options = {}) {
        return await this.repository.getByEntity(entityType, entityId, options);
    }

    async getByTags(tags, options = {}) {
        return await this.repository.getByTags(tags, options);
    }

    async search(query, options = {}) {
        return await this.repository.search(query, options);
    }

    async count(conditions = {}) {
        return await this.repository.count(conditions);
    }

    async getUsageStats() {
        return await this.repository.getUsageStats();
    }

    async createFolder(folderName) {
        const uploadDir = path.join(__dirname, '../../uploads');
        const folderPath = path.join(uploadDir, folderName);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
            return { success: true, message: 'Folder created' };
        }

        throw new Error('Folder already exists');
    }
}

module.exports = new MediaService();
