import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import BacklogItem, { BacklogStatus } from '../models/BacklogItem';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        const coupleId = req.user?.coupleId;
        const item = new BacklogItem({
            ...req.body,
            createdBy: userId,
            coupleId
        });
        await item.save();
        res.status(201).json(item);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/open', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const coupleId = req.user?.coupleId;
        const items = await BacklogItem.find({ coupleId, status: BacklogStatus.OPEN });
        res.json(items);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:id/done', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const item = await BacklogItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
        item.status = BacklogStatus.DONE;
        await item.save();
        res.json(item);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
