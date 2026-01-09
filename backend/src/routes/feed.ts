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
        const type = req.query.type as string;
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        const dateFilter: any = { $ne: null };
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.$lte = end;
        }

        const query = { coupleId, sharedAt: dateFilter };

        const fetchCheckins = !type || type === 'CHECKIN';
        const fetchKudos = !type || type === 'KUDOS';
        const fetchAnswers = !type || type === 'PROMPT_ANSWER';
        const fetchRepairs = !type || type === 'REPAIR';

        // Fetch shared items from all collections
        const [checkins, kudos, answers, repairs] = await Promise.all([
            fetchCheckins ? CheckIn.find(query).sort({ sharedAt: -1 }).limit(limit).populate('userId', 'name').populate('comments.userId', 'name') : [],
            fetchKudos ? Kudos.find(query).sort({ sharedAt: -1 }).limit(limit).populate('fromUserId', 'name').populate('comments.userId', 'name') : [],
            fetchAnswers ? PromptAnswer.find(query).sort({ sharedAt: -1 }).limit(limit).populate('userId', 'name').populate('promptId').populate('comments.userId', 'name') : [],
            fetchRepairs ? Repair.find(query).sort({ sharedAt: -1 }).limit(limit).populate('initiatorUserId', 'name').populate('comments.userId', 'name') : []
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
