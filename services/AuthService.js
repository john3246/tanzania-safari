const userService = require('./UserService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    async login(email, password) {
        const user = await userService.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        if (!user.is_active) {
            throw new Error('Account is inactive');
        }

        const permissions = await userService.getUserPermissions(user.id);

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role_name, permissions },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        // Update last login
        await userService.update(user.id, { last_login: new Date() });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role_name
            }
        };
    }
}

module.exports = new AuthService();
