const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class MediaRepository extends BaseRepository {
    constructor() {
        super('media_library');
    }

    async findAllWithDetails(conditions = {}, options = {}) {
        let query = `
            SELECT m.*, 
                   u.first_name as uploaded_by_first_name,
                   u.last_name as uploaded_by_last_name
            FROM media_library m
            LEFT JOIN users u ON m.uploaded_by = u.user_id
            WHERE m.deleted_at IS NULL
        `;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `m.${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        if (options.search) {
            query += ` AND (m.filename ILIKE $${index} OR m.alt_text ILIKE $${index} OR m.caption ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.folder) {
            query += ` AND m.folder = $${index}`;
            values.push(options.folder);
            index++;
        }

        if (options.entityType) {
            query += ` AND m.entity_type = $${index}`;
            values.push(options.entityType);
            index++;
        }

        if (options.entityId) {
            query += ` AND m.entity_id = $${index}`;
            values.push(options.entityId);
            index++;
        }

        if (options.mimeType) {
            query += ` AND m.mime_type ILIKE $${index}`;
            values.push(`%${options.mimeType}%`);
            index++;
        }

        if (options.tags) {
            query += ` AND m.tags @> $${index}`;
            values.push(JSON.stringify(options.tags));
            index++;
        }

        if (options.uploadedBy) {
            query += ` AND m.uploaded_by = $${index}`;
            values.push(options.uploadedBy);
            index++;
        }

        if (options.orderBy) {
            query += ` ORDER BY m.${options.orderBy}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY m.created_at DESC`;
        }

        if (options.limit) {
            query += ` LIMIT $${index++}`;
            values.push(options.limit);
        }

        if (options.offset) {
            query += ` OFFSET $${index++}`;
            values.push(options.offset);
        }

        const result = await db.query(query, values);
        return result.rows;
    }

    async getFolders() {
        const query = `
            SELECT DISTINCT folder, COUNT(*) as count
            FROM media_library
            WHERE deleted_at IS NULL
            GROUP BY folder
            ORDER BY folder ASC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getByFolder(folder, options = {}) {
        return this.findAllWithDetails({ folder }, options);
    }

    async getByEntity(entityType, entityId, options = {}) {
        return this.findAllWithDetails({ entity_type: entityType, entity_id: entityId }, options);
    }

    async getByTags(tags, options = {}) {
        return this.findAllWithDetails({}, { ...options, tags });
    }

    async search(query, options = {}) {
        return this.findAllWithDetails({}, { ...options, search: query });
    }

    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM media_library WHERE deleted_at IS NULL`;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        const result = await db.query(query, values);
        return parseInt(result.rows[0].count);
    }

    async softDelete(id) {
        return this.update(id, { deleted_at: new Date() });
    }

    async restore(id) {
        return this.update(id, { deleted_at: null });
    }

    async getUsageStats() {
        const query = `
            SELECT 
                COUNT(*) as total_files,
                SUM(file_size) as total_size,
                COUNT(DISTINCT folder) as total_folders,
                COUNT(DISTINCT uploaded_by) as total_uploaders,
                COUNT(CASE WHEN mime_type LIKE 'image/%' THEN 1 END) as image_count,
                COUNT(CASE WHEN mime_type LIKE 'video/%' THEN 1 END) as video_count,
                COUNT(CASE WHEN mime_type LIKE 'audio/%' THEN 1 END) as audio_count,
                COUNT(CASE WHEN mime_type LIKE 'application/pdf' THEN 1 END) as document_count
            FROM media_library
            WHERE deleted_at IS NULL
        `;
        const result = await db.query(query);
        return result.rows[0];
    }
}

module.exports = new MediaRepository();
