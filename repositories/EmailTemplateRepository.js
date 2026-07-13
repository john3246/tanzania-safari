const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class EmailTemplateRepository extends BaseRepository {
    constructor() {
        super('email_templates');
    }

    async findAllWithDetails(conditions = {}, options = {}) {
        let query = `
            SELECT et.*, 
                   COUNT(el.id) as usage_count
            FROM email_templates et
            LEFT JOIN email_logs el ON et.id = el.template_id
            WHERE et.deleted_at IS NULL
        `;
        let values = [];
        let index = 1;

        const keys = Object.keys(conditions);
        if (keys.length > 0) {
            const whereClause = keys.map(key => {
                values.push(conditions[key]);
                return `et.${key} = $${index++}`;
            }).join(' AND ');
            query += ` AND ${whereClause}`;
        }

        if (options.search) {
            query += ` AND (et.name ILIKE $${index} OR et.subject ILIKE $${index} OR et.description ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.category) {
            query += ` AND et.category = $${index}`;
            values.push(options.category);
            index++;
        }

        if (options.isActive !== undefined) {
            query += ` AND et.is_active = $${index}`;
            values.push(options.isActive);
            index++;
        }

        query += ` GROUP BY et.id`;

        if (options.orderBy) {
            query += ` ORDER BY et.${options.orderBy}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY et.category ASC, et.name ASC`;
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
            SELECT * FROM email_templates
            WHERE slug = $1 AND deleted_at IS NULL
        `;
        const result = await db.query(query, [slug]);
        return result.rows[0];
    }

    async getByCategory(category, options = {}) {
        return this.findAllWithDetails({ category }, options);
    }

    async getActiveTemplates(options = {}) {
        return this.findAllWithDetails({ is_active: true }, options);
    }

    async getTemplateWithVariables(slug) {
        const query = `
            SELECT * FROM email_templates
            WHERE slug = $1 AND deleted_at IS NULL
        `;
        const result = await db.query(query, [slug]);
        if (result.rows.length === 0) return null;

        const template = result.rows[0];
        
        // Extract variables from template content
        const variables = [];
        const variableRegex = /\{\{(\w+)\}\}/g;
        let match;
        
        if (template.subject) {
            while ((match = variableRegex.exec(template.subject)) !== null) {
                if (!variables.includes(match[1])) variables.push(match[1]);
            }
        }
        
        if (template.html_content) {
            while ((match = variableRegex.exec(template.html_content)) !== null) {
                if (!variables.includes(match[1])) variables.push(match[1]);
            }
        }
        
        if (template.text_content) {
            while ((match = variableRegex.exec(template.text_content)) !== null) {
                if (!variables.includes(match[1])) variables.push(match[1]);
            }
        }

        template.variables = variables;
        return template;
    }

    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM email_templates WHERE deleted_at IS NULL`;
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
}

module.exports = new EmailTemplateRepository();
