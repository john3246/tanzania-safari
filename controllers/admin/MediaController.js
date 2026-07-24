const mediaService = require('../../services/MediaService');

class MediaController {
    async list(req, res) {
        try {
            const { page = 1, limit = 50, search, folder, entityType, entityId, mimeType, tags, uploadedBy, orderBy = 'created_at', orderDirection = 'DESC' } = req.query;
            
            const offset = (page - 1) * limit;
            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset),
                search,
                folder,
                entityType,
                entityId: entityId ? parseInt(entityId) : undefined,
                mimeType,
                tags: tags ? JSON.parse(tags) : undefined,
                uploadedBy: uploadedBy ? parseInt(uploadedBy) : undefined,
                orderBy,
                orderDirection
            };

            const result = await mediaService.getAll({}, options);
            
            res.json({
                success: true,
                data: result.data,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: result.total,
                    pages: Math.ceil(result.total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }
            const userId = req.user ? req.user.id : null;
            const data = await mediaService.processUpload(req.file, req.body, userId);
            res.status(201).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async uploadMultiple(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ success: false, message: 'No files uploaded' });
            }
            const userId = req.user ? req.user.id : null;
            const data = await mediaService.processMultipleUploads(req.files, req.body, userId);
            res.status(201).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getById(req, res) {
        try {
            const media = await mediaService.getById(req.params.id);
            res.json({ success: true, data: media });
        } catch (error) {
            res.status(404).json({ success: false, message: error.message });
        }
    }

    async update(req, res) {
        try {
            const media = await mediaService.update(req.params.id, req.body);
            res.json({ success: true, data: media });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async replace(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No replacement file uploaded' });
            }
            const data = await mediaService.replaceMedia(req.params.id, req.file);
            res.json({ success: true, data });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await mediaService.deleteMedia(req.params.id);
            res.json({ success: true, message: 'Media deleted successfully' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async softDelete(req, res) {
        try {
            await mediaService.softDelete(req.params.id);
            res.json({ success: true, message: 'Media deleted' });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async restore(req, res) {
        try {
            const media = await mediaService.restore(req.params.id);
            res.json({ success: true, data: media });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }

    async getFolders(req, res) {
        try {
            const folders = await mediaService.getFolders();
            res.json({ success: true, data: folders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByFolder(req, res) {
        try {
            const { page = 1, limit = 50 } = req.query;
            const offset = (page - 1) * limit;
            const options = { limit: parseInt(limit), offset: parseInt(offset) };
            const media = await mediaService.getByFolder(req.params.folder, options);
            res.json({ success: true, data: media });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByEntity(req, res) {
        try {
            const { entityType, entityId } = req.params;
            const media = await mediaService.getByEntity(entityType, parseInt(entityId));
            res.json({ success: true, data: media });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getByTags(req, res) {
        try {
            const tags = req.query.tags ? JSON.parse(req.query.tags) : [];
            const media = await mediaService.getByTags(tags);
            res.json({ success: true, data: media });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async search(req, res) {
        try {
            const { q } = req.query;
            if (!q) {
                return res.status(400).json({ success: false, message: 'Search query required' });
            }
            const media = await mediaService.search(q);
            res.json({ success: true, data: media });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getUsageStats(req, res) {
        try {
            const stats = await mediaService.getUsageStats();
            res.json({ success: true, data: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async createFolder(req, res) {
        try {
            const { folderName } = req.body;
            if (!folderName) {
                return res.status(400).json({ success: false, message: 'Folder name required' });
            }
            const result = await mediaService.createFolder(folderName);
            res.json({ success: true, data: result });
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}

module.exports = new MediaController();
