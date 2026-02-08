import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Couple from '../models/Couple';
import User from '../models/User';

const router = Router();

// Helper to generate 6-char code
const generatePairCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

import jwt from 'jsonwebtoken';

// ... (keep generatePairCode)

router.post('/create', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        const existingCouple = await Couple.findOne({ memberIds: userId });

        if (existingCouple) {
            // Generate token even for existing couple to resolve "stuck" states
            const accessToken = jwt.sign(
                { userId: userId, coupleId: existingCouple._id },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '1d' }
            );

            if (existingCouple.memberIds.length === 1) {
                return res.json({ pairCode: existingCouple.pairCode, accessToken, coupleId: existingCouple._id });
            }
            return res.status(400).json({ message: 'Bạn đã ở trong một couple hoàn chỉnh', accessToken, coupleId: existingCouple._id });
        }

        const pairCode = generatePairCode();
        const couple = new Couple({
            memberIds: [userId],
            pairCode
        });
        await couple.save();

        // Assign default avatar to creator
        const user = await User.findById(userId);
        if (user) {
            user.avatarUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdBWB76EZKUgHdARYa-XNyIzoiJiUiyKiFrg&s"
        }

        const accessToken = jwt.sign(
            { userId: userId, coupleId: couple._id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({ pairCode, accessToken, coupleId: couple._id });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/join', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        const { pairCode } = req.body;

        const existingCoupleUser = await Couple.findOne({ memberIds: userId });
        if (existingCoupleUser) {
            const accessToken = jwt.sign(
                { userId: userId, coupleId: existingCoupleUser._id },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '1d' }
            );
            return res.status(400).json({ message: 'Bạn đã ở trong một couple', accessToken, coupleId: existingCoupleUser._id });
        }

        const couple = await Couple.findOne({ pairCode: pairCode.toUpperCase() });
        if (!couple) return res.status(404).json({ message: 'Mã không hợp lệ' });
        if (couple.memberIds.length >= 2) return res.status(400).json({ message: 'Couple này đã đầy' });

        couple.memberIds.push(userId as any);
        if (couple.memberIds.length === 2) {
            couple.pairedAt = new Date();
        }
        await couple.save();

        // Assign default avatar to joiner
        const user = await User.findById(userId);
        if (user) {
            user.avatarUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvP0Bz1V4MCwCBtR2ldjM5nWZPO-XNmr5q1qGcBkSLXA&s";
            await user.save();
        }

        const accessToken = jwt.sign(
            { userId: userId, coupleId: couple._id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({ message: 'Tham gia thành công', coupleId: couple._id, accessToken });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        const couple = await Couple.findOne({ memberIds: userId }).populate('memberIds', 'name email avatarUrl');

        if (couple) {
            const accessToken = jwt.sign(
                { userId: userId, coupleId: couple._id },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '1d' }
            );
            return res.json({ ...couple.toObject(), accessToken });
        }

        res.json(couple);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/stats', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId) return res.status(400).json({ message: 'Không có couple' });

        const couple = await Couple.findById(coupleId);
        if (!couple) return res.status(404).json({ message: 'Couple không tồn tại' });

        const now = new Date();
        const start = new Date(couple.pairedAt || couple.createdAt);

        // Use calendar days: Start date is Day 1
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffTime = Math.abs(today.getTime() - startDay.getTime());
        const daysTogether = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Calculate Streak based on Check-ins
        const checkins = await CheckIn.find({ coupleId })
            .select('dateKey')
            .sort({ dateKey: -1 });

        const uniqueDates = Array.from(new Set(checkins.map(c => c.dateKey))).sort().reverse();

        let streak = 0;
        if (uniqueDates.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            // Streak only counts if they checked in today or yesterday
            if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
                streak = 1;
                for (let i = 0; i < uniqueDates.length - 1; i++) {
                    const d1 = new Date(uniqueDates[i]);
                    const d2 = new Date(uniqueDates[i + 1]);
                    const diff = Math.abs(d1.getTime() - d2.getTime());
                    const dayDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));

                    if (dayDiff === 1) {
                        streak++;
                    } else {
                        break;
                    }
                }
            }
        }

        res.json({
            daysTogether,
            streak,
            pairDate: couple.createdAt
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

import CheckIn from '../models/CheckIn';
export default router;
