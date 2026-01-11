import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    name: string;
    timezone: string;
    avatarUrl?: string;
    settings: {
        emailNotifications: boolean;
    };
    pushSubscriptions: Array<{
        endpoint: string;
        keys: {
            p256dh: string;
            auth: string;
        }
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    timezone: { type: String, default: 'Asia/Ho_Chi_Minh' },
    avatarUrl: { type: String },
    settings: {
        emailNotifications: { type: Boolean, default: true }
    },
    pushSubscriptions: [{
        endpoint: String,
        keys: {
            p256dh: String,
            auth: String
        }
    }]
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
