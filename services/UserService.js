const BaseService = require('./BaseService');
const userRepository = require('../repositories/UserRepository');
const bcrypt = require('bcrypt');

class UserService extends BaseService {
    constructor() {
        super(userRepository);
    }

    async create(data) {
        const existingEmail = await this.repository.findByEmail(data.email);
        if (existingEmail) {
            throw new Error('Email already exists');
        }

        const payload = {
            email: data.email,
            first_name: data.first_name || data.email.split('@')[0],
            last_name: data.last_name || '',
            phone: data.phone || null,
            role_id: data.role_id ? Number(data.role_id) : 1,
            is_active: data.is_active !== false
        };

        if (!data.password || String(data.password).length < 8) {
            throw new Error('Password must be at least 8 characters');
        }
        payload.password_hash = await bcrypt.hash(data.password, 10);

        const user = await this.repository.create(payload);
        return this.repository.findByIdWithRole(user.user_id);
    }

    async update(id, data) {
        const patch = { ...data };
        delete patch.username;
        delete patch.user_id;
        delete patch.password_hash;

        if (patch.password) {
            patch.password_hash = await bcrypt.hash(patch.password, 10);
            delete patch.password;
        }

        if (patch.role_id != null) patch.role_id = Number(patch.role_id);
        if (patch.is_active != null) {
            patch.is_active = patch.is_active === true || patch.is_active === 'true';
        }

        if (patch.email) {
            const existingEmail = await this.repository.findByEmail(patch.email);
            if (existingEmail && String(existingEmail.user_id) !== String(id)) {
                throw new Error('Email already exists');
            }
        }

        await this.repository.update(id, patch);
        return this.repository.findByIdWithRole(id);
    }

    async getAll(conditions = {}, options = {}) {
        return await this.repository.findAllWithRole(conditions, options);
    }

    async getById(id) {
        const user = await this.repository.findByIdWithRole(id);
        if (!user) throw new Error('User not found');
        return user;
    }

    async findByEmail(email) {
        return await this.repository.findByEmail(email);
    }

    async findByUsername(username) {
        return await this.repository.findByUsername(username);
    }

    async getUserPermissions(userId) {
        return await this.repository.getUserPermissions(userId);
    }

    async updateLastLogin(userId) {
        await this.repository.updateLastLogin(userId);
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

    async listRoles() {
        return this.repository.listRoles();
    }

    async hasPermission(userId, permission) {
        const permissions = await this.getUserPermissions(userId);
        return permissions.includes('*') || permissions.includes(permission);
    }
}

module.exports = new UserService();
