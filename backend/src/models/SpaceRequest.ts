import mongoose, { Schema, Document } from 'mongoose';

export interface ISpaceRequest extends Document {
    coupleId: mongoose.Types.ObjectId;
    requesterId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    reason: string;
    status: 'pending' | 'accepted' | 'rejected' | 'canceled';
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SpaceRequestSchema: Schema = new Schema({
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true },
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'canceled'],
        default: 'pending'
    },
    rejectionReason: { type: String }
}, { timestamps: true });

export default mongoose.model<ISpaceRequest>('SpaceRequest', SpaceRequestSchema);
