const authService = require('../../services/AuthService');
const userRepository = require('../../repositories/UserRepository');
const { z } = require('zod');

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

class AuthController {
    async login(req, res) {
        try {
            const parsed = loginSchema.parse(req.body);
            const result = await authService.login(parsed.email, parsed.password);
            
            res.cookie('jwt', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 12 * 60 * 60 * 1000
            });

            res.json({ success: true, user: result.user, token: result.token });
        } catch (error) {
            res.status(401).json({ success: false, message: error.message });
        }
    }

    async logout(req, res) {
        res.clearCookie('jwt');
        res.json({ success: true, message: 'Logged out successfully' });
    }

    async verify(req, res) {
        try {
            const tokenUser = req.user || {};
            const userId = tokenUser.userId || tokenUser.user_id || tokenUser.id || tokenUser.sub;
            if (!userId) {
                return res.status(401).json({ success: false, message: 'Invalid session' });
            }
            const user = await userRepository.findByIdWithRole(userId);
            if (!user || !user.is_active) {
                return res.status(401).json({ success: false, message: 'User not found or inactive' });
            }
            const { password_hash, reset_token, reset_token_expires, ...safe } = user;
            res.json({
                success: true,
                user: {
                    ...safe,
                    userId: user.user_id,
                    role: user.role_name
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AuthController();
