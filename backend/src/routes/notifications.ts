import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/NotificationService';

const router = Router();

// Get all notifications for current user
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const notifications = await NotificationService.getNotificationsForUser(userId);
        res.json(notifications);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Mark a single notification as read
router.patch('/:id/read', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const notification = await NotificationService.markAsRead(id);
        res.json(notification);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Mark all notifications as read
router.patch('/read-all', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        await NotificationService.markAllAsRead(userId);
        res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
