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

        const permissions = await userService.getUserPermissions(user.user_id);

        const { getJwtSecret } = require('../middleware/verifyAdmin');
        const token = jwt.sign(
            { userId: user.user_id, email: user.email, role: user.role_name, permissions },
            getJwtSecret(),
            { expiresIn: '12h' }
        );

        // Update last login
        await userService.updateLastLogin(user.user_id);

        return {
            token,
            user: {
                userId: user.user_id,
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                profile_image_url: user.profile_image_url,
                role: user.role_name
            }
        };
    }
}

module.exports = new AuthService();
