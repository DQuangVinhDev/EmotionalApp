import mongoose, { Schema, Document } from 'mongoose';
import { VisibilityType } from './CheckIn';

export interface IKudos extends Document {
    coupleId: mongoose.Types.ObjectId;
    fromUserId: mongoose.Types.ObjectId;
    toUserId?: mongoose.Types.ObjectId;
    text: string;
    sticker?: string;
    visibility: VisibilityType;
    scheduledShareAt?: Date;
    sharedAt?: Date;
    createdAt: Date;
}

const KudosSchema: Schema = new Schema({
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true },
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    sticker: { type: String },
    visibility: { type: String, enum: Object.values(VisibilityType), default: VisibilityType.PRIVATE },
    scheduledShareAt: { type: Date },
    sharedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model<IKudos>('Kudos', KudosSchema);
