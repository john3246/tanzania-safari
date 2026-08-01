const express = require('express');
const router = express.Router();
const tourCMSService = require('../services/TourCMSService');
const destinationService = require('../services/DestinationService');
const tourCategoryService = require('../services/TourCategoryService');
const pageService = require('../services/PageService');
const menuService = require('../services/MenuService');
const siteSettingsService = require('../services/SiteSettingsService');

// Public Tours endpoints
router.get('/tours', async (req, res) => {
    try {
        const { limit, category, destination, featured } = req.query;
        const options = {
            limit: limit ? parseInt(limit) : undefined,
            categoryId: category ? parseInt(category) : undefined,
            destinationId: destination ? parseInt(destination) : undefined,
            isFeatured: featured === 'true' ? true : undefined
        };
        const tours = await tourCMSService.getActiveTours(options);
        res.json({ success: true, data: tours });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/tours/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const tours = await tourCMSService.getFeaturedTours(limit);
        res.json({ success: true, data: tours });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/tours/:slug', async (req, res) => {
    try {
        const tour = await tourCMSService.findBySlug(req.params.slug);
        if (!tour) {
            return res.status(404).json({ success: false, message: 'Tour not found' });
        }
        tour.related_tours = await tourCMSService.getRelatedTours(tour.id, 4);
        res.json({ success: true, data: tour });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Public Destinations endpoints
router.get('/destinations', async (req, res) => {
    try {
        const { limit, region, featured } = req.query;
        const options = {
            limit: limit ? parseInt(limit) : undefined,
            region,
            isFeatured: featured === 'true' ? true : undefined
        };
        const destinations = await destinationService.getActiveDestinations(options);
        res.json({ success: true, data: destinations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/destinations/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const destinations = await destinationService.getFeaturedDestinations(limit);
        res.json({ success: true, data: destinations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/destinations/regions', async (req, res) => {
    try {
        const regions = await destinationService.getRegions();
        res.json({ success: true, data: regions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/destinations/region/:region', async (req, res) => {
    try {
        const destinations = await destinationService.getByRegion(req.params.region);
        res.json({ success: true, data: destinations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/destinations/:slug', async (req, res) => {
    try {
        const destination = await destinationService.findBySlug(req.params.slug);
        if (!destination) {
            return res.status(404).json({ success: false, message: 'Destination not found' });
        }
        res.json({ success: true, data: destination });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Public Tour Categories endpoints
router.get('/categories', async (req, res) => {
    try {
        const categories = await tourCategoryService.getActiveCategories();
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/categories/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const categories = await tourCategoryService.getFeaturedCategories(limit);
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/categories/:slug', async (req, res) => {
    try {
        const category = await tourCategoryService.findBySlug(req.params.slug);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Public Pages endpoints
router.get('/pages', async (req, res) => {
    try {
        const pages = await pageService.getPublishedPages();
        res.json({ success: true, data: pages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/pages/homepage', async (req, res) => {
    try {
        const page = await pageService.getHomepage();
        if (!page) {
            return res.status(404).json({ success: false, message: 'Homepage not found' });
        }
        res.json({ success: true, data: page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/pages/:slug', async (req, res) => {
    try {
        const page = await pageService.findBySlug(req.params.slug);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        res.json({ success: true, data: page });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Public Menus endpoints
router.get('/menus', async (req, res) => {
    try {
        const menus = await menuService.getActiveMenus();
        res.json({ success: true, data: menus });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/menus/location/:location', async (req, res) => {
    try {
        const menus = await menuService.findByLocation(req.params.location);
        res.json({ success: true, data: menus });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/menus/:slug', async (req, res) => {
    try {
        const menu = await menuService.getMenuBySlugWithItems(req.params.slug);
        if (!menu) {
            return res.status(404).json({ success: false, message: 'Menu not found' });
        }
        res.json({ success: true, data: menu });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Public Site Settings endpoints
router.get('/settings', async (req, res) => {
    try {
        const settings = await siteSettingsService.getSettingsAsObject();
        // Never expose SMTP credentials publicly
        const safe = {};
        for (const [k, v] of Object.entries(settings || {})) {
            if (/^smtp\.|smtp_|password|secret|api_key/i.test(k)) continue;
            safe[k] = v;
        }
        res.json({ success: true, data: safe });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/settings/company', async (req, res) => {
    try {
        const settings = await siteSettingsService.getCompanyInfo();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/settings/contact', async (req, res) => {
    try {
        const settings = await siteSettingsService.getContactInfo();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/settings/seo', async (req, res) => {
    try {
        const settings = await siteSettingsService.getSEOSettings();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/settings/social', async (req, res) => {
    try {
        const settings = await siteSettingsService.getSocialMedia();
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
