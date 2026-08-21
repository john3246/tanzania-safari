const db = require('../config/db');

class DestinationRepository {
    async getAll() {
        const query = `
            SELECT np.park_id, np.park_name, np.park_slug, np.short_description,
                   np.featured_image_url,
                   COUNT(DISTINCT pd.package_id) as safari_count,
                   COALESCE(np.featured_image_url, np.image_urls[1], '/images/destinations/' || np.park_slug || '/main.webp') as image_url
            FROM national_parks np
            LEFT JOIN package_destinations pd ON np.park_id = pd.park_id
            LEFT JOIN safari_packages sp ON pd.package_id = sp.package_id AND sp.is_active = true
            WHERE np.is_active = true
            GROUP BY np.park_id
            ORDER BY np.park_name
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getBySlug(slug) {
        const query = `
            SELECT *, COALESCE(image_urls[1], '/images/destinations/' || park_slug || '/main.jpg') as image_url 
            FROM national_parks 
            WHERE park_slug = $1 AND is_active = true
        `;
        const result = await db.query(query, [slug]);
        return result.rows[0];
    }

    async getRelatedPackages(parkId) {
        const query = `
            SELECT sp.*, pc.category_name, pc.category_slug
            FROM safari_packages sp
            JOIN package_destinations pd ON sp.package_id = pd.package_id
            LEFT JOIN package_categories pc ON sp.category_id = pc.category_id
            WHERE pd.park_id = $1 AND sp.is_active = true
            ORDER BY sp.is_featured DESC, sp.created_at DESC
            LIMIT 3
        `;
        const result = await db.query(query, [parkId]);
        return result.rows;
    }

    async getAllAdmin() {
        const query = `
            SELECT np.*, COUNT(pd.package_id) as safari_count
            FROM national_parks np
            LEFT JOIN package_destinations pd ON np.park_id = pd.park_id
            WHERE np.is_active = true
            GROUP BY np.park_id
            ORDER BY np.park_name
        `;
        const result = await db.query(query);
        return result.rows;
    }
}

module.exports = new DestinationRepository();
