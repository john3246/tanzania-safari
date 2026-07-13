const BaseService = require('./BaseService');
const userRepository = require('../repositories/UserRepository');
const bcrypt = require('bcrypt');
const { z } = require('zod');

class UserService extends BaseService {
    constructor() {
        super(userRepository);
    }

    async create(data) {
        // Check if email or username already exists
        const existingEmail = await this.repository.findByEmail(data.email);
        if (existingEmail) {
            throw new Error('Email already exists');
        }

        const existingUsername = await this.repository.findByUsername(data.username);
        if (existingUsername) {
            throw new Error('Username already exists');
        }

        if (data.password) {
            data.password_hash = await bcrypt.hash(data.password, 10);
            delete data.password;
        }
        
        const user = await super.create(data);
        return this.repository.findByIdWithRole(user.id);
    }

    async update(id, data) {
        if (data.password) {
            data.password_hash = await bcrypt.hash(data.password, 10);
            delete data.password;
        }

        if (data.email) {
            const existingEmail = await this.repository.findByEmail(data.email);
            if (existingEmail && existingEmail.id !== id) {
                throw new Error('Email already exists');
            }
        }

        if (data.username) {
            const existingUsername = await this.repository.findByUsername(data.username);
            if (existingUsername && existingUsername.id !== id) {
                throw new Error('Username already exists');
            }
        }

        return super.update(id, data);
    }

    async getAll(conditions = {}, options = {}) {
        return await this.repository.findAllWithRole(conditions, options);
    }

    async getById(id) {
        const user = await this.repository.findByIdWithRole(id);
        if (!user) {
            throw new Error('User not found');
        }
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

    async hasPermission(userId, permission) {
        const permissions = await this.getUserPermissions(userId);
        return permissions.includes(permission);
    }
}

module.exports = new UserService();
