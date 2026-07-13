class BaseService {
    constructor(repository) {
        this.repository = repository;
    }

    async getAll(conditions = {}, options = {}) {
        return await this.repository.findAll(conditions, options);
    }

    async getById(id) {
        const record = await this.repository.findById(id);
        if (!record) {
            throw new Error('Record not found');
        }
        return record;
    }

    async create(data) {
        return await this.repository.create(data);
    }

    async update(id, data) {
        const record = await this.repository.findById(id);
        if (!record) {
            throw new Error('Record not found');
        }
        return await this.repository.update(id, data);
    }

    async delete(id) {
        const record = await this.repository.findById(id);
        if (!record) {
            throw new Error('Record not found');
        }
        return await this.repository.delete(id);
    }
}

module.exports = BaseService;
