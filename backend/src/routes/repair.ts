import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Repair from '../models/Repair';
import { VisibilityType } from '../models/CheckIn';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
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
        res.status(201).json(repair);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/:id/respond', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const repair = await Repair.findById(req.params.id);
        if (!repair) return res.status(404).json({ message: 'Không tìm thấy' });
        repair.partnerResponse = req.body;
        await repair.save();
        res.json(repair);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/agree', authMiddleware, async (req: AuthRequest, res) => {
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

router.get('/feed', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const coupleId = req.user?.coupleId;
        const repairs = await Repair.find({ coupleId }).sort({ createdAt: -1 });
        res.json(repairs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
