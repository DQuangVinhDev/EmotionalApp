import mongoose from 'mongoose';

export interface ICard extends mongoose.Document {
    level: number;
    category: string;
    prompt: string;
    followups: string[];
    flags: string[];
}

const CardSchema = new mongoose.Schema({
    level: { type: Number, required: true },
    category: { type: String, required: true },
    prompt: { type: String, required: true },
    followups: [String],
    flags: [String]
}, { timestamps: true });

export default mongoose.model<ICard>('Card', CardSchema);
