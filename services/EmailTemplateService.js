const BaseService = require('./BaseService');
const emailTemplateRepository = require('../repositories/EmailTemplateRepository');

class EmailTemplateService extends BaseService {
    constructor() {
        super(emailTemplateRepository);
    }

    async getAll(conditions = {}, options = {}) {
        return await this.repository.findAllWithDetails(conditions, options);
    }

    async getById(id) {
        const template = await this.repository.findById(id);
        if (!template || template.deleted_at) {
            throw new Error('Email template not found');
        }
        return template;
    }

    async create(data) {
        // Check if slug already exists
        const existing = await this.repository.findBySlug(data.slug);
        if (existing) {
            throw new Error('Slug already exists');
        }
        
        const template = await super.create(data);
        return this.repository.findById(template.id);
    }

    async update(id, data) {
        if (data.slug) {
            const existing = await this.repository.findBySlug(data.slug);
            if (existing && existing.id !== id) {
                throw new Error('Slug already exists');
            }
        }

        await super.update(id, data);
        return this.repository.findById(id);
    }

    async findBySlug(slug) {
        return await this.repository.findBySlug(slug);
    }

    async getByCategory(category, options = {}) {
        return await this.repository.getByCategory(category, options);
    }

    async getActiveTemplates(options = {}) {
        return await this.repository.getActiveTemplates(options);
    }

    async getTemplateWithVariables(slug) {
        return await this.repository.getTemplateWithVariables(slug);
    }

    async softDelete(id) {
        return await this.repository.softDelete(id);
    }

    async restore(id) {
        return await this.repository.restore(id);
    }

    async count(conditions = {}) {
        return await this.repository.count(conditions);
    }

    async previewTemplate(slug, variables = {}) {
        const template = await this.getTemplateWithVariables(slug);
        if (!template) {
            throw new Error('Template not found');
        }

        let htmlContent = template.html_content;
        let textContent = template.text_content;
        let subject = template.subject;

        // Replace variables
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            htmlContent = htmlContent.replace(regex, value);
            textContent = textContent.replace(regex, value);
            subject = subject.replace(regex, value);
        }

        return {
            subject,
            html_content: htmlContent,
            text_content: textContent,
            variables: template.variables
        };
    }
}

module.exports = new EmailTemplateService();
