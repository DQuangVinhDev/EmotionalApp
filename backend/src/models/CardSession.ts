import mongoose from 'mongoose';

export interface ICardSession extends mongoose.Document {
    coupleId: mongoose.Types.ObjectId;
    remainingCardIds: mongoose.Types.ObjectId[];
    drawnCards: {
        cardId: mongoose.Types.ObjectId;
        drawnBy: mongoose.Types.ObjectId;
        drawnAt: Date;
    }[];
    currentCardId: mongoose.Types.ObjectId | null;
    status: 'active' | 'completed';
}

const CardSessionSchema = new mongoose.Schema({
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true },
    remainingCardIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
    drawnCards: [{
        cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
        drawnBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        drawnAt: { type: Date, default: Date.now }
    }],
    currentCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', default: null },
    status: { type: String, enum: ['active', 'completed'], default: 'active' }
}, { timestamps: true });

export default mongoose.model<ICardSession>('CardSession', CardSessionSchema);
