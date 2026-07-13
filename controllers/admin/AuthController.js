const authService = require('../../services/AuthService');
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
            
            // Set HttpOnly cookie for session security
            res.cookie('jwt', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 12 * 60 * 60 * 1000 // 12 hours
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
        // If they reach here, authMiddleware already verified them
        res.json({ success: true, user: req.user });
    }
}

module.exports = new AuthController();
