const BaseService = require('./BaseService');
const tourCategoryRepository = require('../repositories/TourCategoryRepository');

class TourCategoryService extends BaseService {
    constructor() {
        super(tourCategoryRepository);
    }

    async getAll(conditions = {}, options = {}) {
        return await this.repository.findAllWithTourCount(conditions, options);
    }

    async getById(id) {
        const category = await this.repository.findById(id);
        if (!category || category.deleted_at) {
            throw new Error('Category not found');
        }
        return category;
    }

    async create(data) {
        // Check if slug already exists
        const existing = await this.repository.findBySlug(data.slug);
        if (existing) {
            throw new Error('Slug already exists');
        }
        
        const category = await super.create(data);
        return this.repository.findById(category.id);
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

    async getActiveCategories() {
        return await this.repository.getActiveCategories();
    }

    async getFeaturedCategories(limit = 6) {
        return await this.repository.getFeaturedCategories(limit);
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
}

module.exports = new TourCategoryService();
