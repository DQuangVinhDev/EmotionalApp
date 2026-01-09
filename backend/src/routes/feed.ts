import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import CheckIn, { VisibilityType } from '../models/CheckIn';
import Kudos from '../models/Kudos';
import PromptAnswer from '../models/PromptAnswer';
import Repair from '../models/Repair';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId) return res.status(400).json({ message: 'Không có couple' });

        const limit = parseInt(req.query.limit as string) || 20;

        // Fetch shared items from all collections
        const [checkins, kudos, answers, repairs] = await Promise.all([
            CheckIn.find({ coupleId, sharedAt: { $ne: null } }).sort({ sharedAt: -1 }).limit(limit).populate('userId', 'name'),
            Kudos.find({ coupleId, sharedAt: { $ne: null } }).sort({ sharedAt: -1 }).limit(limit).populate('fromUserId', 'name'),
            PromptAnswer.find({ coupleId, sharedAt: { $ne: null } }).sort({ sharedAt: -1 }).limit(limit).populate('userId', 'name').populate('promptId'),
            Repair.find({ coupleId, sharedAt: { $ne: null } }).sort({ sharedAt: -1 }).limit(limit).populate('initiatorUserId', 'name')
        ]);

        // Map and tag with itemType
        const feed = [
            ...checkins.map(i => ({ ...i.toObject(), itemType: 'CHECKIN' })),
            ...kudos.map(i => ({ ...i.toObject(), itemType: 'KUDOS' })),
            ...answers.map(i => ({ ...i.toObject(), itemType: 'PROMPT_ANSWER' })),
            ...repairs.map(i => ({ ...i.toObject(), itemType: 'REPAIR' }))
        ].sort((a: any, b: any) => b.sharedAt.getTime() - a.sharedAt.getTime());

        res.json(feed.slice(0, limit));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
