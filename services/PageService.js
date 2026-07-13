const BaseService = require('./BaseService');
const pageRepository = require('../repositories/PageRepository');

class PageService extends BaseService {
    constructor() {
        super(pageRepository);
    }

    async getAll(conditions = {}, options = {}) {
        return await this.repository.findAllWithDetails(conditions, options);
    }

    async getById(id) {
        const page = await this.repository.findById(id);
        if (!page || page.deleted_at) {
            throw new Error('Page not found');
        }
        return page;
    }

    async create(data) {
        // Check if slug already exists
        const existing = await this.repository.findBySlug(data.slug);
        if (existing) {
            throw new Error('Slug already exists');
        }

        // If setting as homepage, remove flag from others
        if (data.is_homepage) {
            await this.repository.setHomepage(0); // Will be set after creation
        }
        
        const page = await super.create(data);
        
        // Set as homepage if requested
        if (data.is_homepage) {
            await this.repository.setHomepage(page.id);
        }
        
        return this.repository.findById(page.id);
    }

    async update(id, data) {
        if (data.slug) {
            const existing = await this.repository.findBySlug(data.slug);
            if (existing && existing.id !== id) {
                throw new Error('Slug already exists');
            }
        }

        // If setting as homepage, handle it
        if (data.is_homepage) {
            await this.repository.setHomepage(id);
            delete data.is_homepage;
        }

        await super.update(id, data);
        return this.repository.findById(id);
    }

    async findBySlug(slug) {
        return await this.repository.findBySlug(slug);
    }

    async getHomepage() {
        return await this.repository.getHomepage();
    }

    async getPublishedPages(options = {}) {
        return await this.repository.getPublishedPages(options);
    }

    async getByParent(parentId, options = {}) {
        return await this.repository.getByParent(parentId, options);
    }

    async getByTemplate(template, options = {}) {
        return await this.repository.getByTemplate(template, options);
    }

    async getTree() {
        return await this.repository.getTree();
    }

    async softDelete(id) {
        return await this.repository.softDelete(id);
    }

    async restore(id) {
        return await this.repository.restore(id);
    }

    async publish(id) {
        return await this.repository.publish(id);
    }

    async setHomepage(id) {
        return await this.repository.setHomepage(id);
    }

    async count(conditions = {}) {
        return await this.repository.count(conditions);
    }
}

module.exports = new PageService();
