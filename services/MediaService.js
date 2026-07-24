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

    async scanLocalDirectories() {
        const publicImagesPath = path.join(__dirname, '../public/images');
        const uploadsPath = path.join(__dirname, '../uploads');
        let allFiles = [];

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
                    if (['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) {
                        const relPath = fullPath.substring(basePath.length).replace(/\\/g, '/');
                        const finalUrl = (isPublic ? '/images' : '/uploads') + relPath;

                        allFiles.push({
                            id: crypto.randomUUID(), // fake id for UI compatibility
                            filename: file,
                            original_name: file,
                            url: finalUrl,
                            file_size: stat.size,
                            created_at: stat.birthtime,
                            mime_type: 'image/' + ext.replace('.', ''),
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

    async getAll(conditions = {}, options = {}) {
        try {
            // Simplified: Just scan local directories as requested by user
            const localFiles = await this.scanLocalDirectories();
            
            let filteredFiles = localFiles;
            if (options.search) {
                const term = options.search.toLowerCase();
                filteredFiles = filteredFiles.filter(f => 
                    (f.filename || '').toLowerCase().includes(term) || 
                    (f.original_name || '').toLowerCase().includes(term) ||
                    (f.url || '').toLowerCase().includes(term)
                );
            }

            // Apply pagination manually
            const page = options.page || 1;
            const limit = options.limit || 50;
            const offset = (page - 1) * limit;
            
            const paginatedFiles = filteredFiles.slice(offset, offset + limit);

            return {
                data: paginatedFiles,
                total: filteredFiles.length
            };
        } catch (error) {
            console.error('Error fetching media:', error);
            throw error;
        }
    }

    async getById(id) {
        const media = await this.repository.findById(id);
        if (!media || media.deleted_at) {
            throw new Error('Media not found');
        }
        return media;
    }

    async processUpload(file, body, userId) {
        if (!file) throw new Error('No file provided');

        const { alt_text, caption, folder, entity_type, entity_id, tags } = body;
        const uploadDir = path.join(__dirname, '../../uploads');
        
        // Ensure folder exists
        const targetFolder = folder || 'root';
        const folderPath = path.join(uploadDir, targetFolder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Generate unique filename
        const ext = path.extname(file.originalname);
        const baseName = path.parse(file.originalname).name;
        const uniqueName = `${baseName}-${crypto.randomBytes(8).toString('hex')}${ext}`;
        const outputPath = path.join(folderPath, uniqueName);

        // Process image if it's an image
        let processedPath = outputPath;
        let webpPath = null;
        let thumbnailPath = null;

        if (file.mimetype.startsWith('image/')) {
            // Save original
            fs.writeFileSync(outputPath, fs.readFileSync(file.path));

            // Generate WebP version
            webpPath = outputPath.replace(ext, '.webp');
            await sharp(file.path)
                .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(webpPath);

            // Generate thumbnail
            thumbnailPath = outputPath.replace(ext, '-thumb.webp');
            await sharp(file.path)
                .resize({ width: 400, height: 300, fit: 'cover' })
                .webp({ quality: 70 })
                .toFile(thumbnailPath);
        } else {
            // For non-images, just copy the file
            fs.writeFileSync(outputPath, fs.readFileSync(file.path));
        }

        // Delete temp file
        try {
            fs.unlinkSync(file.path);
        } catch (err) {
            console.error('Error deleting temporary file:', err);
        }

        // Save to DB
        const mediaData = {
            filename: uniqueName,
            original_filename: file.originalname,
            mime_type: file.mimetype,
            file_size: file.size,
            path: `/uploads/${targetFolder}/${uniqueName}`,
            url: `/uploads/${targetFolder}/${uniqueName}`,
            thumbnail_url: thumbnailPath ? `/uploads/${targetFolder}/${path.basename(thumbnailPath)}` : null,
            webp_url: webpPath ? `/uploads/${targetFolder}/${path.basename(webpPath)}` : null,
            alt_text: alt_text || null,
            caption: caption || null,
            folder: targetFolder,
            tags: tags || [],
            entity_type: entity_type || null,
            entity_id: entity_id ? parseInt(entity_id) : null,
            uploaded_by: userId
        };

        const media = await this.repository.create(mediaData);
        return this.repository.findById(media.id);
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
        await super.update(id, data);
        return this.repository.findById(id);
    }

    async deleteMedia(id) {
        const media = await this.repository.findById(id);
        if (!media) throw new Error('Media not found');

        const uploadDir = path.join(__dirname, '../../uploads');
        const filePath = path.join(uploadDir, media.path.replace('/uploads/', ''));

        // Delete all related files
        const filesToDelete = [filePath];
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
                console.error('Failed to delete file:', file, err);
            }
        }

        return await this.repository.delete(id);
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
