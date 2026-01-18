import Notification from '../models/Notification';
import mongoose from 'mongoose';

export type NotificationType = 'space_request' | 'kudos' | 'repair' | 'checkin' | 'prompt' | 'system';

interface CreateNotificationData {
    recipientId: string | mongoose.Types.ObjectId;
    senderId?: string | mongoose.Types.ObjectId;
    type: NotificationType;
    title: string;
    content: string;
    link?: string;
}

export class NotificationService {
    static async createNotification(data: CreateNotificationData) {
        try {
            const notification = new Notification({
                recipientId: data.recipientId,
                senderId: data.senderId,
                type: data.type,
                title: data.title,
                content: data.content,
                link: data.link
            });
            await notification.save();
            return notification;
        } catch (error) {
            console.error('Error creating notification record:', error);
            return null;
        }
    }

    static async getNotificationsForUser(userId: string | mongoose.Types.ObjectId) {
        return await Notification.find({ recipientId: userId })
            .sort({ createdAt: -1 })
            .limit(50);
    }

    static async markAsRead(notificationId: string) {
        return await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    }

    static async markAllAsRead(userId: string | mongoose.Types.ObjectId) {
        return await Notification.updateMany({ recipientId: userId, isRead: false }, { isRead: true });
    }
}
