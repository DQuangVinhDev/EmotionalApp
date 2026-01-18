import { create } from 'zustand';
import client from '../api/client';
import type { INotification } from '../types/notification';

interface NotificationState {
    notifications: INotification[];
    unreadCount: number;
    loading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const res = await client.get('/notifications');
            const notifications = res.data;
            const unreadCount = notifications.filter((n: INotification) => !n.isRead).length;
            set({ notifications, unreadCount, loading: false });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            set({ loading: false });
        }
    },

    markAsRead: async (id: string) => {
        try {
            await client.patch(`/notifications/${id}/read`);
            const { notifications } = get();
            const updated = notifications.map(n => n._id === id ? { ...n, isRead: true } : n);
            const unreadCount = updated.filter(n => !n.isRead).length;
            set({ notifications: updated, unreadCount });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            await client.patch('/notifications/read-all');
            const { notifications } = get();
            const updated = notifications.map(n => ({ ...n, isRead: true }));
            set({ notifications: updated, unreadCount: 0 });
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }
}));
