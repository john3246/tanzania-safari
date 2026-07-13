const BaseService = require('./BaseService');
const menuRepository = require('../repositories/MenuRepository');
const db = require('../config/db');

class MenuService extends BaseService {
    constructor() {
        super(menuRepository);
    }

    async getAll(conditions = {}, options = {}) {
        return await this.repository.findAllWithItems(conditions, options);
    }

    async getById(id) {
        const menu = await this.repository.findById(id);
        if (!menu || menu.deleted_at) {
            throw new Error('Menu not found');
        }
        return menu;
    }

    async getMenuWithItems(id) {
        const menu = await this.repository.getMenuWithItems(id);
        if (!menu) {
            throw new Error('Menu not found');
        }
        return menu;
    }

    async create(data) {
        // Check if slug already exists
        const existing = await this.repository.findBySlug(data.slug);
        if (existing) {
            throw new Error('Slug already exists');
        }
        
        const menu = await super.create(data);
        return this.repository.findById(menu.id);
    }

    async update(id, data) {
        if (data.slug) {
            const existing = await this.repository.findBySlug(data.slug);
            if (existing && existing.id !== id) {
                throw new Error('Slug already exists');
            }
        }

        await super.update(id, data);
        return this.repository.findById(id);
    }

    async findBySlug(slug) {
        return await this.repository.findBySlug(slug);
    }

    async findByLocation(location) {
        return await this.repository.findByLocation(location);
    }

    async getActiveMenus() {
        return await this.repository.getActiveMenus();
    }

    async getMenuBySlugWithItems(slug) {
        return await this.repository.getMenuBySlugWithItems(slug);
    }

    async softDelete(id) {
        return await this.repository.softDelete(id);
    }

    async restore(id) {
        return await this.repository.restore(id);
    }

    async count(conditions = {}) {
        return await this.repository.count(conditions);
    }

    // Menu Item methods
    async addMenuItem(menuId, itemData) {
        const query = `
            INSERT INTO menu_items (menu_id, parent_id, title, url, link_page_id, display_order, is_active, icon, css_class, target)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const values = [
            menuId,
            itemData.parent_id || null,
            itemData.title,
            itemData.url || null,
            itemData.link_page_id || null,
            itemData.display_order || 0,
            itemData.is_active !== undefined ? itemData.is_active : true,
            itemData.icon || null,
            itemData.css_class || null,
            itemData.target || '_self'
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async updateMenuItem(itemId, itemData) {
        const query = `
            UPDATE menu_items
            SET parent_id = $2, title = $3, url = $4, link_page_id = $5, display_order = $6, is_active = $7, icon = $8, css_class = $9, target = $10
            WHERE id = $1
            RETURNING *
        `;
        const values = [
            itemId,
            itemData.parent_id !== undefined ? itemData.parent_id : null,
            itemData.title,
            itemData.url !== undefined ? itemData.url : null,
            itemData.link_page_id !== undefined ? itemData.link_page_id : null,
            itemData.display_order !== undefined ? itemData.display_order : 0,
            itemData.is_active !== undefined ? itemData.is_active : true,
            itemData.icon !== undefined ? itemData.icon : null,
            itemData.css_class !== undefined ? itemData.css_class : null,
            itemData.target !== undefined ? itemData.target : '_self'
        ];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    async deleteMenuItem(itemId) {
        const query = `
            UPDATE menu_items
            SET deleted_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [itemId]);
        return result.rows[0];
    }

    async restoreMenuItem(itemId) {
        const query = `
            UPDATE menu_items
            SET deleted_at = NULL
            WHERE id = $1
            RETURNING *
        `;
        const result = await db.query(query, [itemId]);
        return result.rows[0];
    }

    async reorderMenuItems(menuId, items) {
        await db.query('BEGIN');
        try {
            for (const item of items) {
                await db.query(
                    'UPDATE menu_items SET parent_id = $1, display_order = $2 WHERE id = $3',
                    [item.parent_id || null, item.display_order, item.id]
                );
            }
            await db.query('COMMIT');
            return await this.repository.getMenuWithItems(menuId);
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }
}

module.exports = new MenuService();
