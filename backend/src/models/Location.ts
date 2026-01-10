import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
    coupleId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    lat: number;
    lng: number;
    title: string;
    description?: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LocationSchema: Schema = new Schema({
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String }
}, { timestamps: true });

export default mongoose.model<ILocation>('Location', LocationSchema);
