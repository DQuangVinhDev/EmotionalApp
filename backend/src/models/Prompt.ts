import mongoose, { Schema, Document } from 'mongoose';

export enum PromptType {
    LOVE_MAP = 'LOVE_MAP'
}

export interface IPrompt extends Document {
    type: PromptType;
    text: string;
    active: boolean;
    tags?: string[];
}

const PromptSchema: Schema = new Schema({
    type: { type: String, enum: Object.values(PromptType), default: PromptType.LOVE_MAP },
    text: { type: String, required: true },
    active: { type: Boolean, default: true },
    tags: [{ type: String }]
}, { timestamps: true });

export default mongoose.model<IPrompt>('Prompt', PromptSchema);
