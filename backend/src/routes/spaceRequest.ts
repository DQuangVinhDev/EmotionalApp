import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import SpaceRequest from '../models/SpaceRequest';
import User from '../models/User';
import { notifyPartner } from '../services/email';

const router = Router();

// Create a new space request
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { startTime, endTime, reason } = req.body;
        const userId = req.user?.userId;
        const coupleId = req.user?.coupleId;

        if (!coupleId) {
            return res.status(400).json({ message: 'Bạn cần kết đôi để sử dụng tính năng này' });
        }

        // Find partner ID
        const user = await User.findById(userId);
        const partner = await User.findOne({
            _id: { $ne: userId }
            // Note: In a real app we might want to check the Couple model explicitly
            // but usually a user only has one couple.
        });

        // Better: get partner from Couple model
        const Couple = (await import('../models/Couple')).default;
        const couple = await Couple.findById(coupleId);
        if (!couple) return res.status(404).json({ message: 'Không tìm thấy thông tin cặp đôi' });

        const partnerId = couple.memberIds.find(id => id.toString() !== userId);
        if (!partnerId) return res.status(404).json({ message: 'Không tìm thấy đối phương' });

        const spaceRequest = new SpaceRequest({
            coupleId,
            requesterId: userId,
            receiverId: partnerId,
            startTime,
            endTime,
            reason,
            status: 'pending'
        });

        await spaceRequest.save();

        // Notify partner
        await notifyPartner(
            userId!,
            coupleId,
            'Yêu cầu không gian riêng 🕊️',
            `${user?.name} vừa gửi một yêu cầu không gian riêng từ ${new Date(startTime).toLocaleString()} đến ${new Date(endTime).toLocaleString()}. Lý do: ${reason}`,
            'space_request',
            '/space'
        );

        res.status(201).json(spaceRequest);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Get all space requests for the couple
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const coupleId = req.user?.coupleId;
        if (!coupleId) return res.status(400).json({ message: 'Bạn chưa kết đôi' });

        const requests = await SpaceRequest.find({ coupleId })
            .sort({ createdAt: -1 })
            .populate('requesterId', 'name avatarUrl')
            .populate('receiverId', 'name avatarUrl');

        res.json(requests);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Respond to a space request (Accept/Reject)
router.patch('/:id/respond', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        const userId = req.user?.userId;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        }

        const spaceRequest = await SpaceRequest.findById(id);
        if (!spaceRequest) return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });

        if (spaceRequest.receiverId.toString() !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền phản hồi yêu cầu này' });
        }

        if (spaceRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Yêu cầu này đã được xử lý' });
        }

        spaceRequest.status = status;
        if (status === 'rejected') {
            spaceRequest.rejectionReason = rejectionReason;
        }
        await spaceRequest.save();

        // Notify requester
        const receiver = await User.findById(userId);
        const statusText = status === 'accepted' ? 'ĐỒNG Ý ✅' : 'TỪ CHỐI ❌';
        await notifyPartner(
            userId!,
            spaceRequest.coupleId.toString(),
            `Phản hồi yêu cầu không gian riêng: ${statusText}`,
            `${receiver?.name} đã ${statusText} yêu cầu của bạn.${status === 'rejected' ? ` Lý do: ${rejectionReason}` : ''}`,
            'space_request',
            '/space'
        );

        res.json(spaceRequest);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Cancel a request
router.patch('/:id/cancel', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const spaceRequest = await SpaceRequest.findById(id);
        if (!spaceRequest) return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });

        if (spaceRequest.requesterId.toString() !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền hủy yêu cầu này' });
        }

        spaceRequest.status = 'canceled';
        await spaceRequest.save();

        res.json(spaceRequest);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
