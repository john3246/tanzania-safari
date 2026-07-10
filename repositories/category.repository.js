const db = require('../config/db');

class CategoryRepository {
    async getAll() {
        const query = `
            SELECT 
                pc.category_id,
                pc.category_name,
                pc.category_slug,
                pc.category_description,
                pc.icon_class,
                pc.display_order,
                pc.is_active,
                COUNT(sp.package_id) as safari_count
            FROM package_categories pc
            LEFT JOIN safari_packages sp ON pc.category_id = sp.category_id AND sp.is_active = true
            WHERE pc.is_active = true
            GROUP BY pc.category_id
            ORDER BY pc.display_order
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getAllAdmin() {
        const query = `
            SELECT pc.*, COUNT(sp.package_id) as package_count
            FROM package_categories pc
            LEFT JOIN safari_packages sp ON pc.category_id = sp.category_id AND sp.is_active = true
            WHERE pc.is_active = true
            GROUP BY pc.category_id
            ORDER BY pc.display_order
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getById(id) {
        const query = 'SELECT * FROM package_categories WHERE category_id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = new CategoryRepository();
