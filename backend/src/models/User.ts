import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    name: string;
    timezone: string;
    settings: {
        emailNotifications: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    timezone: { type: String, default: 'Asia/Ho_Chi_Minh' },
    settings: {
        emailNotifications: { type: Boolean, default: true }
    }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
