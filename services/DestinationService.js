const BaseService = require('./BaseService');
const destinationRepository = require('../repositories/DestinationRepository');

class DestinationService extends BaseService {
    constructor() {
        super(destinationRepository);
    }

    async getAll(conditions = {}, options = {}) {
        return await this.repository.findAllWithTourCount(conditions, options);
    }

    async getById(id) {
        const destination = await this.repository.findById(id);
        if (!destination || destination.deleted_at) {
            throw new Error('Destination not found');
        }
        return destination;
    }

    async create(data) {
        // Check if slug already exists
        const existing = await this.repository.findBySlug(data.slug);
        if (existing) {
            throw new Error('Slug already exists');
        }
        
        const destination = await super.create(data);
        return this.repository.findById(destination.id);
    }

    async update(id, data) {
        if (data.slug) {
            const existing = await this.repository.findBySlug(data.slug);
            if (existing && String(existing.id) !== String(id)) {
                throw new Error('Slug already exists');
            }
        }

        await super.update(id, data);
        return this.repository.findById(id);
    }

    async findBySlug(slug) {
        return await this.repository.findBySlug(slug);
    }

    async getActiveDestinations() {
        return await this.repository.getActiveDestinations();
    }

    async getFeaturedDestinations(limit = 4) {
        return await this.repository.getFeaturedDestinations(limit);
    }

    async getByRegion(region) {
        return await this.repository.getByRegion(region);
    }

    async getRegions() {
        return await this.repository.getRegions();
    }

    async delete(id) {
        return await this.repository.delete(id);
    }

    async softDelete(id) {
        return await this.repository.delete(id);
    }

    async togglePublish(id, is_active) {
        return await this.repository.togglePublish(id, is_active);
    }

    async restore(id) {
        return await this.repository.restore(id);
    }

    async count(conditions = {}) {
        return await this.repository.count(conditions);
    }
}

module.exports = new DestinationService();
