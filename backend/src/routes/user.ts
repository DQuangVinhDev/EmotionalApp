import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import User from '../models/User';

const router = Router();

// Get profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.user?.userId).select('-passwordHash');
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Update profile
router.patch('/profile', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { name, timezone, settings } = req.body;
        const user = await User.findById(req.user?.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (timezone) user.timezone = timezone;
        if (settings) user.settings = { ...user.settings, ...settings };

        await user.save();
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
