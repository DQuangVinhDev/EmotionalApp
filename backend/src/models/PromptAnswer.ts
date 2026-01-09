import mongoose, { Schema, Document } from 'mongoose';
import { VisibilityType } from './CheckIn';

export interface IPromptAnswer extends Document {
    coupleId: mongoose.Types.ObjectId;
    promptId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    dateKey: string;
    answerText: string;
    visibility: VisibilityType;
    scheduledShareAt?: Date;
    sharedAt?: Date;
    createdAt: Date;
}

const PromptAnswerSchema: Schema = new Schema({
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true },
    promptId: { type: Schema.Types.ObjectId, ref: 'Prompt', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateKey: { type: String, required: true },
    answerText: { type: String, required: true },
    visibility: { type: String, enum: Object.values(VisibilityType), default: VisibilityType.PRIVATE },
    scheduledShareAt: { type: Date },
    sharedAt: { type: Date },
    comments: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model<IPromptAnswer>('PromptAnswer', PromptAnswerSchema);
