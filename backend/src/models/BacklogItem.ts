import mongoose, { Schema, Document } from 'mongoose';

export enum BacklogStatus {
    OPEN = 'OPEN',
    DONE = 'DONE'
}

export interface IBacklogItem extends Document {
    coupleId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    title: string;
    status: BacklogStatus;
    createdAt: Date;
}

const BacklogItemSchema: Schema = new Schema({
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    status: { type: String, enum: Object.values(BacklogStatus), default: BacklogStatus.OPEN }
}, { timestamps: true });

export default mongoose.model<IBacklogItem>('BacklogItem', BacklogItemSchema);
