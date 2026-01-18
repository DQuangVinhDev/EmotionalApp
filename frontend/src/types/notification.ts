export type INotification = {
    _id: string;
    recipientId: string;
    senderId?: string;
    type: 'space_request' | 'kudos' | 'repair' | 'checkin' | 'prompt' | 'system';
    title: string;
    content: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
};
