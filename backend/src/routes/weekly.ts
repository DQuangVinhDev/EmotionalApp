import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import WeeklySession from '../models/WeeklySession';

const router = Router();

router.get('/current', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const coupleId = req.user?.coupleId;
        const { weekKey } = req.query; // YYYY-[W]WW
        const session = await WeeklySession.findOne({ coupleId, weekKey });
        res.json(session);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/submit', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        const coupleId = req.user?.coupleId;
        const { weekKey, answers } = req.body;

        let session = await WeeklySession.findOne({ coupleId, weekKey });
        if (!session) {
            session = new WeeklySession({ coupleId, weekKey, answersByUser: {} });
        }

        session.answersByUser.set(userId as string, answers);
        await session.save();
        res.json(session);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
