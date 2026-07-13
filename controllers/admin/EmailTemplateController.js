const emailTemplateService = require('../../services/EmailTemplateService');

class EmailTemplateController {
    async list(req, res) {
        try {
            const { page = 1, limit = 20, search, category, isActive, orderBy = 'category', orderDirection = 'ASC' } = req.query;
            
            const offset = (page - 1) * limit;
            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset),
                search,
                category,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                orderBy,
                orderDirection
            };

            const templates = await emailTemplateService.getAll({}, options);
            const total = await emailTemplateService.count({});

            res.json({
                success: true,
                data: templates,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async create(req, res) {
        try {
            const template = await emailTemplateService.create(req.body);
            res.status(201).json({ success: true, data: template });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const template = await emailTemplateService.getById(req.params.id);
            res.json({ success: true, data: template });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async getBySlug(req, res) {
        try {
            const template = await emailTemplateService.findBySlug(req.params.slug);
            if (!template) {
                return res.status(404).json({ success: false, message: 'Template not found' });
            }
            res.json({ success: true, data: template });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const template = await emailTemplateService.update(req.params.id, req.body);
            res.json({ success: true, data: template });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await emailTemplateService.softDelete(req.params.id);
            res.json({ success: true, message: 'Template deleted' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async restore(req, res) {
        try {
            const template = await emailTemplateService.restore(req.params.id);
            res.json({ success: true, data: template });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getActive(req, res) {
        try {
            const templates = await emailTemplateService.getActiveTemplates();
            res.json({ success: true, data: templates });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByCategory(req, res) {
        try {
            const templates = await emailTemplateService.getByCategory(req.params.category);
            res.json({ success: true, data: templates });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getWithVariables(req, res) {
        try {
            const template = await emailTemplateService.getTemplateWithVariables(req.params.slug);
            if (!template) {
                return res.status(404).json({ success: false, message: 'Template not found' });
            }
            res.json({ success: true, data: template });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async preview(req, res) {
        try {
            const { slug } = req.params;
            const { variables } = req.body;
            const preview = await emailTemplateService.previewTemplate(slug, variables || {});
            res.json({ success: true, data: preview });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new EmailTemplateController();
