import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import CheckIn, { VisibilityType } from '../models/CheckIn';
import { z } from 'zod';
import { DateTime } from 'luxon';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        const coupleId = req.user?.coupleId;
        if (!coupleId) return res.status(400).json({ message: 'Bạn chưa ghép đôi' });

        const checkIn = new CheckIn({
            ...req.body,
            userId,
            coupleId,
            sharedAt: req.body.visibility === VisibilityType.SHARED_NOW ? new Date() : null
        });
        await checkIn.save();
        res.status(201).json(checkIn);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/today', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        const dateKey = req.query.dateKey; // YYYY-MM-DD
        const checkin = await CheckIn.findOne({ userId, dateKey });
        res.json(checkin);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/shareNow', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const checkin = await CheckIn.findById(req.params.id);
        if (!checkin) return res.status(404).json({ message: 'Không tìm thấy' });
        checkin.visibility = VisibilityType.SHARED_NOW;
        checkin.sharedAt = new Date();
        await checkin.save();
        res.json(checkin);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
