import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Couple from '../models/Couple';

const router = Router();

// Get profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.user?.userId).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const coupleId = req.user?.coupleId;
        let partnerInfo = null;

        if (coupleId) {
            const couple = await Couple.findById(coupleId);
            if (couple) {
                const partnerId = couple.memberIds.find((id: any) => id.toString() !== user._id.toString());
                if (partnerId) {
                    const partner = await User.findById(partnerId).select('name avatarUrl');
                    if (partner) {
                        partnerInfo = {
                            id: partner._id,
                            name: partner.name,
                            avatarUrl: partner.avatarUrl
                        };
                    }
                }
            }
        }

        const userObj = user.toObject();
        res.json({
            ...userObj,
            partnerId: partnerInfo?.id,
            partnerName: partnerInfo?.name,
            partnerAvatar: partnerInfo?.avatarUrl
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Update profile
router.patch('/profile', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { name, email, timezone, settings, avatarUrl } = req.body;
        const user = await User.findById(req.user?.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
            if (existingUser) return res.status(400).json({ message: 'Email đã được sử dụng' });
            user.email = email;
        }
        if (timezone) user.timezone = timezone;
        if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
        if (settings) user.settings = { ...user.settings, ...settings };

        await user.save();
        res.json(user);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// Subscribe to push notifications
router.post('/push-subscribe', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { subscription } = req.body;
        const user = await User.findById(req.user?.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Initialize if empty
        if (!user.pushSubscriptions) user.pushSubscriptions = [];

        // Add if not already exists (check by endpoint)
        const exists = user.pushSubscriptions.some(s => s.endpoint === subscription.endpoint);
        if (!exists) {
            user.pushSubscriptions.push(subscription);
            await user.save();
        }

        res.status(201).json({ message: 'Đã đăng ký thông báo đẩy thành công! 🔔' });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
