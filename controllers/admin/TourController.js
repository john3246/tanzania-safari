const tourService = require('../../services/TourService');

class TourController {
    async getAll(req, res) {
        try {
            const data = await tourService.getAllAdmin();
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const data = req.body;
            // Clean/default inputs
            const payload = {
                package_name: data.package_name,
                package_slug: data.package_slug,
                category_id: data.category_id ? parseInt(data.category_id) : null,
                short_description: data.short_description || '',
                detailed_description: data.detailed_description || '',
                duration_days: data.duration_days ? parseInt(data.duration_days) : 0,
                duration_nights: data.duration_nights ? parseInt(data.duration_nights) : (data.duration_days ? parseInt(data.duration_days) : 0),
                base_price_usd: data.base_price_usd ? parseFloat(data.base_price_usd) : 0,
                difficulty_level: data.difficulty_level || 'Easy',
                is_featured: data.is_featured === true || data.is_featured === 'true',
                included_features: Array.isArray(data.included_features) ? data.included_features : (data.included_features_text ? data.included_features_text.split('\n').filter(Boolean) : []),
                excluded_features: Array.isArray(data.excluded_features) ? data.excluded_features : (data.excluded_features_text ? data.excluded_features_text.split('\n').filter(Boolean) : []),
                minimum_pax: data.minimum_pax ? parseInt(data.minimum_pax) : 1,
                maximum_pax: data.maximum_pax ? parseInt(data.maximum_pax) : 12,
                is_private: data.is_private !== false && data.is_private !== 'false',
                is_customizable: data.is_customizable !== false && data.is_customizable !== 'false',
                featured_image_url: data.featured_image_url || null,
                image_urls: Array.isArray(data.image_urls) ? data.image_urls : (data.image_urls_csv ? data.image_urls_csv.split(',').map(s => s.trim()).filter(Boolean) : []),
                is_active: data.is_active !== false && data.is_active !== 'false'
            };
            const result = await tourService.create(payload);
            res.status(201).json({ success: true, data: { package_id: result.package_id } });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const data = req.body;
            const payload = {
                package_name: data.package_name,
                package_slug: data.package_slug,
                category_id: data.category_id ? parseInt(data.category_id) : null,
                short_description: data.short_description || '',
                detailed_description: data.detailed_description || '',
                duration_days: data.duration_days ? parseInt(data.duration_days) : 0,
                duration_nights: data.duration_nights ? parseInt(data.duration_nights) : (data.duration_days ? parseInt(data.duration_days) : 0),
                base_price_usd: data.base_price_usd ? parseFloat(data.base_price_usd) : 0,
                difficulty_level: data.difficulty_level || 'Easy',
                is_featured: data.is_featured === true || data.is_featured === 'true',
                included_features: Array.isArray(data.included_features) ? data.included_features : (data.included_features_text ? data.included_features_text.split('\n').filter(Boolean) : []),
                excluded_features: Array.isArray(data.excluded_features) ? data.excluded_features : (data.excluded_features_text ? data.excluded_features_text.split('\n').filter(Boolean) : []),
                minimum_pax: data.minimum_pax ? parseInt(data.minimum_pax) : 1,
                maximum_pax: data.maximum_pax ? parseInt(data.maximum_pax) : 12,
                is_private: data.is_private !== false && data.is_private !== 'false',
                is_customizable: data.is_customizable !== false && data.is_customizable !== 'false',
                featured_image_url: data.featured_image_url || null,
                image_urls: Array.isArray(data.image_urls) ? data.image_urls : (data.image_urls_csv ? data.image_urls_csv.split(',').map(s => s.trim()).filter(Boolean) : []),
                is_active: data.is_active !== false && data.is_active !== 'false'
            };
            await tourService.update(req.params.id, payload);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await tourService.update(req.params.id, { is_active: false });
            res.json({ success: true, message: 'Package deactivated (soft deleted)' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getItinerary(req, res) {
        try {
            const data = await tourService.getItinerary(req.params.id);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async saveItinerary(req, res) {
        try {
            await tourService.saveItinerary(req.params.id, req.body.itinerary);
            res.json({ success: true, message: 'Itinerary saved successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getDestinations(req, res) {
        try {
            const data = await tourService.getDestinations(req.params.id);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async saveDestinations(req, res) {
        try {
            await tourService.saveDestinations(req.params.id, req.body.parks);
            res.json({ success: true, message: 'Destinations saved successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new TourController();
