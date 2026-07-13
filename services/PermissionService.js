const BaseService = require('./BaseService');
const permissionRepository = require('../repositories/PermissionRepository');

class PermissionService extends BaseService {
    constructor() {
        super(permissionRepository);
    }

    async getAll(conditions = {}, options = {}) {
        return await this.repository.findAllWithRoleCount(conditions, options);
    }

    async getPermissionsByRole(roleId) {
        return await this.repository.getPermissionsByRole(roleId);
    }

    async groupByPrefix() {
        return await this.repository.groupByPrefix();
    }
}

module.exports = new PermissionService();
