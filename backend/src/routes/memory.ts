import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import CheckIn from '../models/CheckIn';
import Kudos from '../models/Kudos';
import PromptAnswer from '../models/PromptAnswer';
import Repair from '../models/Repair';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const coupleId = req.user?.coupleId;
        const userId = req.user?.userId;

        if (!coupleId || !userId) return res.status(400).json({ message: 'Missing auth info' });

        const limit = parseInt(req.query.limit as string) || 50;
        const type = req.query.type as string; // Optional: CHECKIN, KUDOS, etc.
        const startDate = req.query.startDate as string;
        const endDate = req.query.endDate as string;

        const dateFilter: any = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.$lte = end;
        }

        const baseQuery: any = { coupleId };
        if (startDate || endDate) baseQuery.createdAt = dateFilter;

        // Query: My items (private or shared) OR Partner's shared items
        const query = {
            ...baseQuery,
            $or: [
                { userId: userId }, // My items
                { sharedAt: { $ne: null } } // Shared items (includes Partner's)
            ]
        };

        // Kudos is special because it has fromUserId
        const kudosQuery = {
            ...baseQuery,
            $or: [
                { fromUserId: userId }, // Sent by me
                { toUserId: userId },   // Received by me (and thus shared/visible)
                { sharedAt: { $ne: null } } // Explicitly shared
            ]
        };

        // Repair uses initiatorUserId
        const repairQuery = {
            ...baseQuery,
            $or: [
                { initiatorUserId: userId },
                { sharedAt: { $ne: null } }
            ]
        };

        const fetchCheckins = !type || type === 'CHECKIN';
        const fetchKudos = !type || type === 'KUDOS';
        const fetchAnswers = !type || type === 'PROMPT_ANSWER';
        const fetchRepairs = !type || type === 'REPAIR';

        const [checkins, kudos, answers, repairs] = await Promise.all([
            fetchCheckins ? CheckIn.find(query).sort({ createdAt: -1 }).limit(limit).populate('userId', 'name').populate('comments.userId', 'name') : [],
            fetchKudos ? Kudos.find(kudosQuery).sort({ createdAt: -1 }).limit(limit).populate('fromUserId', 'name').populate('toUserId', 'name').populate('comments.userId', 'name') : [],
            fetchAnswers ? PromptAnswer.find(query).sort({ createdAt: -1 }).limit(limit).populate('userId', 'name').populate('promptId').populate('comments.userId', 'name') : [],
            fetchRepairs ? Repair.find(repairQuery).sort({ createdAt: -1 }).limit(limit).populate('initiatorUserId', 'name').populate('comments.userId', 'name') : []
        ]);

        // Map and tag
        const feed = [
            ...checkins.map(i => ({ ...i.toObject(), itemType: 'CHECKIN', sortDate: i.createdAt })),
            ...kudos.map(i => ({ ...i.toObject(), itemType: 'KUDOS', sortDate: i.createdAt })),
            ...answers.map(i => ({ ...i.toObject(), itemType: 'PROMPT_ANSWER', text: i.answerText, sortDate: i.createdAt })), // Correct mapping for Answer
            ...repairs.map(i => ({ ...i.toObject(), itemType: 'REPAIR', sortDate: i.createdAt }))
        ].sort((a: any, b: any) => b.sortDate.getTime() - a.sortDate.getTime());

        res.json(feed.slice(0, limit));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
