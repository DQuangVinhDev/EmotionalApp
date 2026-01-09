import mongoose, { Schema, Document } from 'mongoose';

export interface ICouple extends Document {
    memberIds: mongoose.Types.ObjectId[];
    pairCode: string;
    createdAt: Date;
}

const CoupleSchema: Schema = new Schema({
    memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    pairCode: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.model<ICouple>('Couple', CoupleSchema);
