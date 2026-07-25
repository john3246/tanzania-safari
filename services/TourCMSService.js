const BaseService = require('./BaseService');
const tourCMSRepository = require('../repositories/TourCMSRepository');

class TourCMSService extends BaseService {
    constructor() {
        super(tourCMSRepository);
    }

    async getAll(conditions = {}, options = {}) {
        return await this.repository.findAllWithDetails(conditions, options);
    }

    async getById(id) {
        const tour = await this.repository.findByIdWithDetails(id);
        if (!tour || tour.deleted_at) {
            throw new Error('Tour not found');
        }
        return tour;
    }

    async create(data) {
        // Check if slug already exists
        const existing = await this.repository.findBySlug(data.slug);
        if (existing) {
            throw new Error('Slug already exists');
        }
        
        const tour = await super.create(data);
        return this.repository.findByIdWithDetails(tour.id);
    }

    async update(id, data) {
        if (data.slug) {
            const existing = await this.repository.findBySlug(data.slug);
            if (existing && String(existing.id) !== String(id)) {
                throw new Error('Slug already exists');
            }
        }

        await super.update(id, data);
        return this.repository.findByIdWithDetails(id);
    }

    async findBySlug(slug) {
        return await this.repository.findBySlug(slug);
    }

    async getActiveTours(options = {}) {
        return await this.repository.getActiveTours(options);
    }

    async getFeaturedTours(limit = 6) {
        return await this.repository.getFeaturedTours(limit);
    }

    async getRelatedTours(tourId, limit = 4) {
        return await this.repository.getRelatedTours(tourId, limit);
    }

    async getRelatedToursByCategory(categoryId, tourId, limit = 4) {
        return await this.repository.getRelatedToursByCategory(categoryId, tourId, limit);
    }

    async addRelatedTour(tourId, relatedTourId) {
        return await this.repository.addRelatedTour(tourId, relatedTourId);
    }

    async removeRelatedTour(tourId, relatedTourId) {
        return await this.repository.removeRelatedTour(tourId, relatedTourId);
    }

    async getRelatedToursList(tourId) {
        return await this.repository.getRelatedToursList(tourId);
    }

    async setRelatedTours(tourId, relatedTourIds) {
        return await this.repository.setRelatedTours(tourId, relatedTourIds);
    }

    async delete(id) {
        return await this.repository.delete(id);
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

    async togglePublish(id, is_active) {
        return await this.repository.togglePublish(id, is_active);
    }

    async archive(id) {
        return await this.repository.archive(id);
    }

    async count(conditions = {}) {
        return await this.repository.count(conditions);
    }
}

module.exports = new TourCMSService();
