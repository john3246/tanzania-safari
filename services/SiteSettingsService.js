const BaseService = require('./BaseService');
const siteSettingsRepository = require('../repositories/SiteSettingsRepository');

class SiteSettingsService extends BaseService {
    constructor() {
        super(siteSettingsRepository);
    }

    async getAllSettings() {
        return await this.repository.getAllSettings();
    }

    async getByCategory(category) {
        return await this.repository.getByCategory(category);
    }

    async getByKey(key) {
        return await this.repository.getByKey(key);
    }

    async getSettingsAsObject() {
        return await this.repository.getSettingsAsObject();
    }

    async upsertSetting(key, value, category, dataType = 'string') {
        return await this.repository.upsertSetting(key, value, category, dataType);
    }

    async updateSetting(key, value) {
        return await this.repository.updateSetting(key, value);
    }

    async bulkUpdateSettings(settings) {
        return await this.repository.bulkUpdateSettings(settings);
    }

    async deleteSetting(key) {
        return await this.repository.deleteSetting(key);
    }

    async restoreSetting(key) {
        return await this.repository.restoreSetting(key);
    }

    // Convenience methods for common settings
    async getCompanyInfo() {
        return await this.getByCategory('company');
    }

    async getContactInfo() {
        return await this.getByCategory('contact');
    }

    async getSEOSettings() {
        return await this.getByCategory('seo');
    }

    async getSocialMedia() {
        return await this.getByCategory('social');
    }

    async getSMTPSettings() {
        return await this.getByCategory('smtp');
    }

    async updateCompanyInfo(data) {
        const settings = Object.entries(data).map(([key, value]) => ({
            key: `company.${key}`,
            value,
            category: 'company',
            data_type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string'
        }));
        return await this.bulkUpdateSettings(settings);
    }

    async updateContactInfo(data) {
        const settings = Object.entries(data).map(([key, value]) => ({
            key: `contact.${key}`,
            value,
            category: 'contact',
            data_type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string'
        }));
        return await this.bulkUpdateSettings(settings);
    }

    async updateSEOSettings(data) {
        const settings = Object.entries(data).map(([key, value]) => ({
            key: `seo.${key}`,
            value,
            category: 'seo',
            data_type: typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string'
        }));
        return await this.bulkUpdateSettings(settings);
    }

    async updateSocialMedia(data) {
        const settings = Object.entries(data).map(([key, value]) => ({
            key: `social.${key}`,
            value,
            category: 'social',
            data_type: 'string'
        }));
        return await this.bulkUpdateSettings(settings);
    }

    async updateSMTPSettings(data) {
        const settings = Object.entries(data).map(([key, value]) => ({
            key: `smtp.${key}`,
            value,
            category: 'smtp',
            data_type: 'string'
        }));
        return await this.bulkUpdateSettings(settings);
    }
}

module.exports = new SiteSettingsService();
