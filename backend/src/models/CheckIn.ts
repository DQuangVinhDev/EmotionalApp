import mongoose, { Schema, Document } from 'mongoose';

export enum NeedType {
    LISTEN = 'LISTEN',
    HUG = 'HUG',
    SPACE = 'SPACE',
    HELP = 'HELP',
    PLAY = 'PLAY',
    CLARITY = 'CLARITY'
}

export enum VisibilityType {
    PRIVATE = 'PRIVATE',
    SHARED_NOW = 'SHARED_NOW',
    SCHEDULED_SHARE = 'SCHEDULED_SHARE'
}

export interface ICheckIn extends Document {
    coupleId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    dateKey: string;
    mood: number;
    energy: number;
    stress: number;
    need: NeedType;
    gratitudeText: string;
    visibility: VisibilityType;
    scheduledShareAt?: Date;
    sharedAt?: Date;
    createdAt: Date;
}

const CheckInSchema: Schema = new Schema({
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateKey: { type: String, required: true },
    mood: { type: Number, required: true, min: 1, max: 5 },
    energy: { type: Number, required: true, min: 1, max: 5 },
    stress: { type: Number, required: true, min: 1, max: 5 },
    need: { type: String, enum: Object.values(NeedType), required: true },
    gratitudeText: { type: String },
    visibility: { type: String, enum: Object.values(VisibilityType), default: VisibilityType.PRIVATE },
    scheduledShareAt: { type: Date },
    sharedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<ICheckIn>('CheckIn', CheckInSchema);
