const pageService = require('../../services/PageService');

class PageController {
    async list(req, res) {
        try {
            const { page = 1, limit = 20, search, status, template, parentId, isHomepage, orderBy = 'display_order', orderDirection = 'ASC' } = req.query;
            
            const offset = (page - 1) * limit;
            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset),
                search,
                status,
                template,
                parentId: parentId ? parseInt(parentId) : undefined,
                isHomepage: isHomepage === 'true' ? true : isHomepage === 'false' ? false : undefined,
                orderBy,
                orderDirection
            };

            const pages = await pageService.getAll({}, options);
            const total = await pageService.count({});

            res.json({
                success: true,
                data: pages,
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
            const page = await pageService.create(req.body);
            res.status(201).json({ success: true, data: page });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const page = await pageService.getById(req.params.id);
            res.json({ success: true, data: page });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async getBySlug(req, res) {
        try {
            const page = await pageService.findBySlug(req.params.slug);
            if (!page) {
                return res.status(404).json({ success: false, message: 'Page not found' });
            }
            res.json({ success: true, data: page });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const page = await pageService.update(req.params.id, req.body);
            res.json({ success: true, data: page });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await pageService.softDelete(req.params.id);
            res.json({ success: true, message: 'Page deleted' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async restore(req, res) {
        try {
            const page = await pageService.restore(req.params.id);
            res.json({ success: true, data: page });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async publish(req, res) {
        try {
            const page = await pageService.publish(req.params.id);
            res.json({ success: true, data: page });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async setHomepage(req, res) {
        try {
            const page = await pageService.setHomepage(req.params.id);
            res.json({ success: true, data: page });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getHomepage(req, res) {
        try {
            const page = await pageService.getHomepage();
            if (!page) {
                return res.status(404).json({ success: false, message: 'Homepage not found' });
            }
            res.json({ success: true, data: page });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getPublished(req, res) {
        try {
            const { limit, template } = req.query;
            const options = {
                limit: limit ? parseInt(limit) : undefined,
                template
            };
            const pages = await pageService.getPublishedPages(options);
            res.json({ success: true, data: pages });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByParent(req, res) {
        try {
            const pages = await pageService.getByParent(req.params.parentId);
            res.json({ success: true, data: pages });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByTemplate(req, res) {
        try {
            const pages = await pageService.getByTemplate(req.params.template);
            res.json({ success: true, data: pages });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getTree(req, res) {
        try {
            const tree = await pageService.getTree();
            res.json({ success: true, data: tree });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new PageController();
