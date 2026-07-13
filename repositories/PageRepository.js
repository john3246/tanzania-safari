const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class PageRepository extends BaseRepository {
    constructor() {
        super('pages');
    }

    async findAllWithDetails(conditions = {}, options = {}) {
        let query = `
            SELECT p.*, 
                   parent.title as parent_title,
                   parent.slug as parent_slug
            FROM pages p
            LEFT JOIN pages parent ON p.parent_id = parent.id
            WHERE p.deleted_at IS NULL
        `;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `p.${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        if (options.search) {
            query += ` AND (p.title ILIKE $${index} OR p.content ILIKE $${index} OR p.excerpt ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.status) {
            query += ` AND p.status = $${index}`;
            values.push(options.status);
            index++;
        }

        if (options.template) {
            query += ` AND p.template = $${index}`;
            values.push(options.template);
            index++;
        }

        if (options.parentId) {
            query += ` AND p.parent_id = $${index}`;
            values.push(options.parentId);
            index++;
        }

        if (options.isHomepage !== undefined) {
            query += ` AND p.is_homepage = $${index}`;
            values.push(options.isHomepage);
            index++;
        }

        query += ` GROUP BY p.id, parent.title, parent.slug`;

        if (options.orderBy) {
            query += ` ORDER BY p.${options.orderBy}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY p.display_order ASC, p.title ASC`;
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

    async findBySlug(slug) {
        const query = `
            SELECT * FROM pages
            WHERE slug = $1 AND deleted_at IS NULL
        `;
        const result = await db.query(query, [slug]);
        return result.rows[0];
    }

    async getHomepage() {
        const query = `
            SELECT * FROM pages
            WHERE is_homepage = TRUE AND deleted_at IS NULL
            LIMIT 1
        `;
        const result = await db.query(query);
        return result.rows[0];
    }

    async getPublishedPages(options = {}) {
        const conditions = { status: 'published' };
        return this.findAllWithDetails(conditions, options);
    }

    async getByParent(parentId, options = {}) {
        return this.findAllWithDetails({ parent_id: parentId }, options);
    }

    async getByTemplate(template, options = {}) {
        return this.findAllWithDetails({ template }, options);
    }

    async getTree() {
        const query = `
            WITH RECURSIVE page_tree AS (
                SELECT id, title, slug, parent_id, display_order, 0 as level
                FROM pages
                WHERE parent_id IS NULL AND deleted_at IS NULL
                UNION ALL
                SELECT p.id, p.title, p.slug, p.parent_id, p.display_order, pt.level + 1
                FROM pages p
                JOIN page_tree pt ON p.parent_id = pt.id
                WHERE p.deleted_at IS NULL
            )
            SELECT * FROM page_tree
            ORDER BY level, display_order, title
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM pages WHERE deleted_at IS NULL`;
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

    async publish(id) {
        return this.update(id, { status: 'published', published_at: new Date() });
    }

    async setHomepage(id) {
        await db.query('BEGIN');
        try {
            // Remove homepage flag from all pages
            await db.query('UPDATE pages SET is_homepage = FALSE WHERE deleted_at IS NULL');
            
            // Set new homepage
            await db.query('UPDATE pages SET is_homepage = TRUE WHERE id = $1', [id]);
            
            await db.query('COMMIT');
            return this.findById(id);
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }
}

module.exports = new PageRepository();
