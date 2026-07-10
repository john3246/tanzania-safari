const packageRepository = require('../repositories/package.repository');
const destinationRepository = require('../repositories/destination.repository');

class SafariService {
    async getPackages(filters) {
        const [packages, total] = await Promise.all([
            packageRepository.getAll(filters),
            packageRepository.count(filters)
        ]);

        return {
            packages,
            pagination: {
                total,
                page: parseInt(filters.page) || 1,
                limit: parseInt(filters.limit) || 9,
                pages: Math.ceil(total / (parseInt(filters.limit) || 9))
            }
        };
    }

    async getPackageDetails(slug) {
        const pkg = await packageRepository.getBySlug(slug);
        if (!pkg) return null;

        const [itinerary, destinations] = await Promise.all([
            packageRepository.getItinerary(pkg.package_id),
            packageRepository.getDestinations(pkg.package_id)
        ]);

        return { ...pkg, itinerary, destinations };
    }

    async getFeaturedPackages(limit) {
        return await packageRepository.getFeatured(limit);
    }

    async getDestinations() {
        return await destinationRepository.getAll();
    }

    async getDestinationDetails(slug) {
        const park = await destinationRepository.getBySlug(slug);
        if (!park) return null;

        const relatedPackages = await destinationRepository.getRelatedPackages(park.park_id);
        return { ...park, relatedPackages };
    }
}

module.exports = new SafariService();
