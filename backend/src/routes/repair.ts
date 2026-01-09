import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Repair from '../models/Repair';
import { VisibilityType } from '../models/CheckIn';
import User from '../models/User';
import { notifyPartner } from '../services/email';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const coupleId = req.user?.coupleId;
        const repair = new Repair({
            ...req.body,
            initiatorUserId: userId,
            coupleId,
            sharedAt: req.body.visibility === VisibilityType.SHARED_NOW ? new Date() : null
        });
        await repair.save();

        if (repair.visibility === VisibilityType.SHARED_NOW) {
            const user = await User.findById(userId);
            if (user && coupleId) {
                notifyPartner(
                    String(userId),
                    String(coupleId),
                    `${user.name} muốn kết nối để giải quyết mâu thuẫn`,
                    `${user.name} đã gửi một thông điệp hòa giải qua Repair Loop. Hãy vào lắng nghe và thấu hiểu nhé. ❤️`
                );
            }
        }

        res.status(201).json(repair);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/:id/respond', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const repair = await Repair.findById(req.params.id);
        if (!repair) return res.status(404).json({ message: 'Không tìm thấy' });
        repair.partnerResponse = req.body;
        await repair.save();

        const user = await User.findById(req.user?.userId);
        if (user && repair.coupleId && repair.visibility === VisibilityType.SHARED_NOW) {
            notifyPartner(
                String(user._id),
                String(repair.coupleId),
                `${user.name} đã phản hồi thông điệp của bạn`,
                `${user.name} vừa gửi phản hồi trong Repair Loop. Hãy cùng nhau tìm tiếng nói chung nhé! ✨`
            );
        }

        res.json(repair);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/agree', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const repair = await Repair.findById(req.params.id);
        if (!repair) return res.status(404).json({ message: 'Không tìm thấy' });
        repair.agreement = req.body;
        await repair.save();
        res.json(repair);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/feed', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const coupleId = req.user?.coupleId;
        const repairs = await Repair.find({ coupleId }).sort({ createdAt: -1 });
        res.json(repairs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
