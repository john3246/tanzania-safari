const BaseRepository = require('./BaseRepository');
const db = require('../config/db');

class SiteSettingsRepository extends BaseRepository {
    constructor() {
        super('site_settings');
    }

    async getAllSettings() {
        const query = `
            SELECT * FROM site_settings
            WHERE deleted_at IS NULL
            ORDER BY category, key
        `;
        const result = await db.query(query);
        return result.rows;
    }

    async getByCategory(category) {
        const query = `
            SELECT * FROM site_settings
            WHERE category = $1 AND deleted_at IS NULL
            ORDER BY key
        `;
        const result = await db.query(query, [category]);
        return result.rows;
    }

    async getByKey(key) {
        const query = `
            SELECT * FROM site_settings
            WHERE key = $1 AND deleted_at IS NULL
        `;
        const result = await db.query(query, [key]);
        return result.rows[0];
    }

    async getSettingsAsObject() {
        const query = `
            SELECT key, value FROM site_settings
            WHERE deleted_at IS NULL
        `;
        const result = await db.query(query);
        const settings = {};
        for (const row of result.rows) {
            settings[row.key] = row.value;
        }
        return settings;
    }

    async upsertSetting(key, value, category, dataType = 'string') {
        const query = `
            INSERT INTO site_settings (key, value, category, data_type)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (key) 
            DO UPDATE SET value = $2, category = $3, data_type = $4, updated_at = NOW()
            RETURNING *
        `;
        const result = await db.query(query, [key, value, category, dataType]);
        return result.rows[0];
    }

    async updateSetting(key, value) {
        const query = `
            UPDATE site_settings
            SET value = $1, updated_at = NOW()
            WHERE key = $2 AND deleted_at IS NULL
            RETURNING *
        `;
        const result = await db.query(query, [value, key]);
        return result.rows[0];
    }

    async bulkUpdateSettings(settings) {
        await db.query('BEGIN');
        try {
            for (const setting of settings) {
                await this.upsertSetting(setting.key, setting.value, setting.category, setting.data_type);
            }
            await db.query('COMMIT');
            return await this.getAllSettings();
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }

    async deleteSetting(key) {
        return this.update(key, { deleted_at: new Date() });
    }

    async restoreSetting(key) {
        const query = `
            UPDATE site_settings
            SET deleted_at = NULL
            WHERE key = $1
            RETURNING *
        `;
        const result = await db.query(query, [key]);
        return result.rows[0];
    }
}

module.exports = new SiteSettingsRepository();
