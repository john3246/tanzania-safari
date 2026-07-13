const siteSettingsService = require('../../services/SiteSettingsService');

class SiteSettingsController {
    async getAll(req, res) {
        try {
            const settings = await siteSettingsService.getAllSettings();
            res.json({ success: true, data: settings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByCategory(req, res) {
        try {
            const settings = await siteSettingsService.getByCategory(req.params.category);
            res.json({ success: true, data: settings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByKey(req, res) {
        try {
            const setting = await siteSettingsService.getByKey(req.params.key);
            if (!setting) {
                return res.status(404).json({ success: false, message: 'Setting not found' });
            }
            res.json({ success: true, data: setting });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getAsObject(req, res) {
        try {
            const settings = await siteSettingsService.getSettingsAsObject();
            res.json({ success: true, data: settings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async upsert(req, res) {
        try {
            const { key, value, category, dataType } = req.body;
            const setting = await siteSettingsService.upsertSetting(key, value, category, dataType);
            res.json({ success: true, data: setting });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const { value } = req.body;
            const setting = await siteSettingsService.updateSetting(req.params.key, value);
            if (!setting) {
                return res.status(404).json({ success: false, message: 'Setting not found' });
            }
            res.json({ success: true, data: setting });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async bulkUpdate(req, res) {
        try {
            const { settings } = req.body;
            if (!settings || !Array.isArray(settings)) {
                return res.status(400).json({ success: false, message: 'Settings array required' });
            }
            const result = await siteSettingsService.bulkUpdateSettings(settings);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await siteSettingsService.deleteSetting(req.params.key);
            res.json({ success: true, message: 'Setting deleted' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async restore(req, res) {
        try {
            const setting = await siteSettingsService.restoreSetting(req.params.key);
            if (!setting) {
                return res.status(404).json({ success: false, message: 'Setting not found' });
            }
            res.json({ success: true, data: setting });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    // Convenience endpoints
    async getCompanyInfo(req, res) {
        try {
            const settings = await siteSettingsService.getCompanyInfo();
            res.json({ success: true, data: settings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateCompanyInfo(req, res) {
        try {
            const result = await siteSettingsService.updateCompanyInfo(req.body);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getContactInfo(req, res) {
        try {
            const settings = await siteSettingsService.getContactInfo();
            res.json({ success: true, data: settings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateContactInfo(req, res) {
        try {
            const result = await siteSettingsService.updateContactInfo(req.body);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getSEOSettings(req, res) {
        try {
            const settings = await siteSettingsService.getSEOSettings();
            res.json({ success: true, data: settings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateSEOSettings(req, res) {
        try {
            const result = await siteSettingsService.updateSEOSettings(req.body);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getSocialMedia(req, res) {
        try {
            const settings = await siteSettingsService.getSocialMedia();
            res.json({ success: true, data: settings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateSocialMedia(req, res) {
        try {
            const result = await siteSettingsService.updateSocialMedia(req.body);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getSMTPSettings(req, res) {
        try {
            const settings = await siteSettingsService.getSMTPSettings();
            res.json({ success: true, data: settings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateSMTPSettings(req, res) {
        try {
            const result = await siteSettingsService.updateSMTPSettings(req.body);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new SiteSettingsController();
