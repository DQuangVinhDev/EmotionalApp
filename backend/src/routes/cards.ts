import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Card from '../models/Card';
import CardSession from '../models/CardSession';
import User from '../models/User';

const router = express.Router();

// Get or create daily card session
router.get('/session', authMiddleware, async (req: AuthRequest, res: any) => {
    try {
        const userId = req.user?.userId;
        const coupleId = req.user?.coupleId;

        if (!coupleId) {
            return res.status(400).json({ message: 'Bạn cần ghép đôi để sử dụng tính năng này' });
        }

        let session = await CardSession.findOne({
            coupleId: coupleId as any,
            status: 'active'
        }).populate('currentCardId');

        if (!session) {
            const allCards = await Card.find({});
            const cardIds = allCards.map(c => c._id);

            session = new CardSession({
                coupleId: coupleId as any,
                remainingCardIds: cardIds,
                drawnCards: [],
                currentCardId: null,
                status: 'active'
            });
            await session.save();
        }

        res.json(session);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Draw a card
router.post('/draw', authMiddleware, async (req: AuthRequest, res: any) => {
    try {
        const coupleId = req.user?.coupleId;
        const userId = req.user?.userId;

        if (!coupleId) {
            return res.status(400).json({ message: 'Bạn cần ghép đôi' });
        }

        const session = await CardSession.findOne({
            coupleId: coupleId as any,
            status: 'active'
        });

        if (!session) {
            return res.status(404).json({ message: 'Không tìm thấy phiên làm việc' });
        }

        if (session.remainingCardIds.length === 0) {
            return res.status(400).json({ message: 'Hết thẻ bài rồi!' });
        }

        // Random draw
        const randomIndex = Math.floor(Math.random() * session.remainingCardIds.length);
        const cardId = session.remainingCardIds[randomIndex];

        // Verify card exists (important if cards were re-seeded)
        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(400).json({
                message: 'Dữ liệu bộ bài đã thay đổi (do cập nhật hệ thống). Vui lòng nhấn nút Reset để bắt đầu bộ bài mới.'
            });
        }

        // Use atomic update to avoid versioning conflicts
        const updatedSession = await CardSession.findOneAndUpdate(
            {
                _id: session._id,
                status: 'active'
            },
            {
                $pull: { remainingCardIds: cardId },
                $push: {
                    drawnCards: {
                        cardId: cardId as any,
                        drawnBy: userId as any,
                        drawnAt: new Date()
                    }
                },
                $set: { currentCardId: cardId as any }
            },
            { new: true }
        );

        if (!updatedSession) {
            return res.status(409).json({ message: 'Có người khác vừa rút bài, vui lòng thử lại' });
        }

        res.json({ session: updatedSession, card });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

// Reset session
router.post('/reset', authMiddleware, async (req: AuthRequest, res: any) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId) return res.status(400).json({ message: 'Unauthorized' });

        await CardSession.deleteMany({ coupleId: coupleId as any });

        const allCards = await Card.find({});
        const session = new CardSession({
            coupleId: coupleId as any,
            remainingCardIds: allCards.map(c => c._id),
            drawnCards: [],
            currentCardId: null,
            status: 'active'
        });
        await session.save();

        res.json(session);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
