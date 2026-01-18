import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Kudos from '../models/Kudos';
import { VisibilityType } from '../models/CheckIn';
import User from '../models/User';
import { notifyPartner } from '../services/email';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const fromUserId = req.user?.userId;
        const coupleId = req.user?.coupleId;
        const kudos = new Kudos({
            ...req.body,
            fromUserId,
            coupleId,
            sharedAt: req.body.visibility === VisibilityType.SHARED_NOW ? new Date() : null
        });
        await kudos.save();

        if (kudos.visibility === VisibilityType.SHARED_NOW) {
            const user = await User.findById(fromUserId);
            if (user && coupleId) {
                notifyPartner(
                    String(fromUserId),
                    String(coupleId),
                    `${user.name} vừa gửi cho bạn một lời khen ngợi! 🌟`,
                    `${user.name} vừa cho thêm một "hạt mầm" vào Jar of Wins: "${req.body.text}"`,
                    'kudos',
                    '/feed'
                );
            }
        }

        res.status(201).json(kudos);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/feed', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const coupleId = req.user?.coupleId;
        const kudos = await Kudos.find({ coupleId }).sort({ createdAt: -1 });
        res.json(kudos);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
