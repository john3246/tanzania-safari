const BaseService = require('./BaseService');
const roleRepository = require('../repositories/RoleRepository');

class RoleService extends BaseService {
    constructor() {
        super(roleRepository);
    }

    async getAll(conditions = {}, options = {}) {
        return await this.repository.findAllWithPermissions(conditions, options);
    }

    async getById(id) {
        const role = await this.repository.findByIdWithPermissions(id);
        if (!role) {
            throw new Error('Role not found');
        }
        return role;
    }

    async create(data) {
        const role = await super.create(data);
        return this.repository.findByIdWithPermissions(role.id);
    }

    async update(id, data) {
        await super.update(id, data);
        return this.repository.findByIdWithPermissions(id);
    }

    async getRolePermissions(roleId) {
        return await this.repository.getRolePermissions(roleId);
    }

    async assignPermission(roleId, permissionId) {
        return await this.repository.assignPermission(roleId, permissionId);
    }

    async removePermission(roleId, permissionId) {
        return await this.repository.removePermission(roleId, permissionId);
    }

    async setPermissions(roleId, permissionIds) {
        return await this.repository.setPermissions(roleId, permissionIds);
    }

    async getUserCount(roleId) {
        return await this.repository.getUserCount(roleId);
    }

    async canDelete(roleId) {
        const userCount = await this.getUserCount(roleId);
        if (userCount > 0) {
            throw new Error(`Cannot delete role with ${userCount} assigned users`);
        }
        return true;
    }
}

module.exports = new RoleService();
