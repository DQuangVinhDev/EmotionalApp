import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Prompt from '../models/Prompt';
import PromptAnswer from '../models/PromptAnswer';
import { VisibilityType } from '../models/CheckIn';
import User from '../models/User';
import { notifyPartner } from '../services/email';

const router = Router();

router.get('/today', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const count = await Prompt.countDocuments({ active: true });
        if (count === 0) return res.status(404).json({ message: 'Không có prompt' });

        const prompt = await Prompt.findOne({ active: true }).skip(dayOfYear % count);
        res.json(prompt);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/random', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const count = await Prompt.countDocuments({ active: true });
        if (count === 0) return res.status(404).json({ message: 'Không có prompt' });

        const randomIndex = Math.floor(Math.random() * count);
        const prompt = await Prompt.findOne({ active: true }).skip(randomIndex);
        res.json(prompt);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/answer', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const coupleId = req.user?.coupleId;
        const answer = new PromptAnswer({
            ...req.body,
            userId,
            coupleId,
            sharedAt: req.body.visibility === VisibilityType.SHARED_NOW ? new Date() : null
        });
        await answer.save();

        if (answer.visibility === VisibilityType.SHARED_NOW) {
            const user = await User.findById(userId);
            if (user && coupleId) {
                notifyPartner(
                    String(userId),
                    String(coupleId),
                    `${user.name} vừa trả lời Love Map`,
                    `${user.name} vừa chia sẻ suy nghĩ về chủ đề hôm nay. Hãy vào khám phá thế giới nội tâm của nhau nhé! ❤️`
                );
            }
        }

        res.status(201).json(answer);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
