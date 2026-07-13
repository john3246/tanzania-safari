const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class MenuRepository extends BaseRepository {
    constructor() {
        super('menus');
    }

    async findAllWithItems(conditions = {}, options = {}) {
        let query = `
            SELECT m.*, 
                   COUNT(mi.id) as item_count
            FROM menus m
            LEFT JOIN menu_items mi ON m.id = mi.menu_id AND mi.deleted_at IS NULL
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
            query += ` AND (m.name ILIKE $${index} OR m.description ILIKE $${index})`;
            values.push(`%${options.search}%`);
            index++;
        }

        if (options.location) {
            query += ` AND m.location = $${index}`;
            values.push(options.location);
            index++;
        }

        if (options.isActive !== undefined) {
            query += ` AND m.is_active = $${index}`;
            values.push(options.isActive);
            index++;
        }

        query += ` GROUP BY m.id`;

        if (options.orderBy) {
            query += ` ORDER BY m.${options.orderBy}`;
            if (options.orderDirection) {
                query += ` ${options.orderDirection}`;
            }
        } else {
            query += ` ORDER BY m.location ASC, m.name ASC`;
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
            SELECT * FROM menus
            WHERE slug = $1 AND deleted_at IS NULL
        `;
        const result = await db.query(query, [slug]);
        return result.rows[0];
    }

    async findByLocation(location) {
        const query = `
            SELECT * FROM menus
            WHERE location = $1 AND is_active = TRUE AND deleted_at IS NULL
            ORDER BY display_order ASC
        `;
        const result = await db.query(query, [location]);
        return result.rows;
    }

    async getActiveMenus() {
        const query = `
            SELECT * FROM menus
            WHERE is_active = TRUE AND deleted_at IS NULL
            ORDER BY location ASC, display_order ASC
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getMenuWithItems(menuId) {
        const menuQuery = `
            SELECT * FROM menus
            WHERE id = $1 AND deleted_at IS NULL
        `;
        const menuResult = await db.query(menuQuery, [menuId]);
        if (menuResult.rows.length === 0) return null;

        const itemsQuery = `
            SELECT mi.*,
                   p.title as page_title,
                   p.slug as page_slug
            FROM menu_items mi
            LEFT JOIN pages p ON mi.link_page_id = p.id
            WHERE mi.menu_id = $1 AND mi.deleted_at IS NULL
            ORDER BY mi.parent_id ASC NULLS FIRST, mi.display_order ASC
        `;
        const itemsResult = await db.query(itemsQuery, [menuId]);

        const menu = menuResult.rows[0];
        menu.items = itemsResult.rows;
        return menu;
    }

    async getMenuBySlugWithItems(slug) {
        const menu = await this.findBySlug(slug);
        if (!menu) return null;
        return await this.getMenuWithItems(menu.id);
    }

    async count(conditions = {}) {
        let query = `SELECT COUNT(*) as count FROM menus WHERE deleted_at IS NULL`;
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

module.exports = new MenuRepository();
