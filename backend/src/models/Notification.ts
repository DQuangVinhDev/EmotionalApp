import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    recipientId: mongoose.Types.ObjectId;
    senderId?: mongoose.Types.ObjectId;
    type: 'space_request' | 'kudos' | 'repair' | 'checkin' | 'prompt' | 'system';
    title: string;
    content: string;
    link?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        enum: ['space_request', 'kudos', 'repair', 'checkin', 'prompt', 'system'],
        required: true
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
