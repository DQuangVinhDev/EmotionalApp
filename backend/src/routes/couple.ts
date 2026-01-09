import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Couple from '../models/Couple';
import User from '../models/User';

const router = Router();

// Helper to generate 6-char code
const generatePairCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

router.post('/create', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        const existingCouple = await Couple.findOne({ memberIds: userId });

        if (existingCouple) {
            // If the couple only has this member, we can just return the pairCode again
            if (existingCouple.memberIds.length === 1) {
                return res.json({ pairCode: existingCouple.pairCode });
            }
            return res.status(400).json({ message: 'Bạn đã ở trong một couple hoàn chỉnh' });
        }

        const pairCode = generatePairCode();
        const couple = new Couple({
            memberIds: [userId],
            pairCode
        });
        await couple.save();

        res.json({ pairCode });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/join', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        const { pairCode } = req.body;

        const existingCoupleUser = await Couple.findOne({ memberIds: userId });
        if (existingCoupleUser) return res.status(400).json({ message: 'Bạn đã ở trong một couple' });

        const couple = await Couple.findOne({ pairCode: pairCode.toUpperCase() });
        if (!couple) return res.status(404).json({ message: 'Mã không hợp lệ' });
        if (couple.memberIds.length >= 2) return res.status(400).json({ message: 'Couple này đã đầy' });

        couple.memberIds.push(userId as any);
        await couple.save();

        res.json({ message: 'Tham gia thành công', coupleId: couple._id });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        const couple = await Couple.findOne({ memberIds: userId }).populate('memberIds', 'name email');
        res.json(couple);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
