import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import CheckIn from '../models/CheckIn';
import Kudos from '../models/Kudos';
import Repair from '../models/Repair';
import PromptAnswer from '../models/PromptAnswer';
import User from '../models/User';
import { notifyPartner } from '../services/email';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { itemType, itemId, content } = req.body;
    const userId = req.user?.userId;

    if (!content) return res.status(400).json({ message: 'Content required' });

    let Model: any;
    switch (itemType) {
        case 'CHECKIN': Model = CheckIn; break;
        case 'KUDOS': Model = Kudos; break;
        case 'REPAIR': Model = Repair; break;
        case 'PROMPT_ANSWER': Model = PromptAnswer; break;
        default: return res.status(400).json({ message: 'Invalid item type' });
    }

    try {
        const item = await Model.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        item.comments.push({ userId, content });
        await item.save();

        // Notify partner
        const user = await User.findById(userId);
        const coupleId = item.coupleId;
        if (user && coupleId) {
            notifyPartner(
                String(userId),
                String(coupleId),
                `${user.name} đã bình luận về bài viết của bạn`,
                `${user.name} vừa chia sẻ: "${content}"`
            );
        }

        res.json({ message: 'Comment added', comments: item.comments });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
