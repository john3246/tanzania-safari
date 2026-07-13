const BaseService = require('./BaseService');
const tourRepository = require('../repositories/TourRepository');

class TourService extends BaseService {
    constructor() {
        super(tourRepository);
    }

    async getAllAdmin() {
        return await this.repository.getAllAdmin();
    }

    async getItinerary(packageId) {
        return await this.repository.getItinerary(packageId);
    }

    async saveItinerary(packageId, itinerary) {
        return await this.repository.saveItinerary(packageId, itinerary);
    }

    async getDestinations(packageId) {
        return await this.repository.getDestinations(packageId);
    }

    async saveDestinations(packageId, parks) {
        return await this.repository.saveDestinations(packageId, parks);
    }
}

module.exports = new TourService();
