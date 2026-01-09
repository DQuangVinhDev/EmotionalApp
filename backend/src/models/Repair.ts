import mongoose, { Schema, Document } from 'mongoose';
import { VisibilityType } from './CheckIn';

export enum ResponseType {
    UNDERSTAND = 'UNDERSTAND',
    CLARIFY = 'CLARIFY',
    COUNTER = 'COUNTER'
}

export enum OutcomeType {
    ACCEPT_REQUEST = 'ACCEPT_REQUEST',
    COUNTER_PROPOSAL = 'COUNTER_PROPOSAL',
    MOVE_TO_WEEKLY_AGENDA = 'MOVE_TO_WEEKLY_AGENDA'
}

export interface IRepair extends Document {
    coupleId: mongoose.Types.ObjectId;
    initiatorUserId: mongoose.Types.ObjectId;
    stressLevel: number;
    cooldownUntil?: Date;
    observation: string;
    feeling: string;
    need: string;
    request: string;
    generatedMessage: string;
    visibility: VisibilityType;
    scheduledShareAt?: Date;
    sharedAt?: Date;
    partnerResponse?: {
        responseType: ResponseType;
        responseText?: string;
    };
    agreement?: {
        outcome: OutcomeType;
        aftercare?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const RepairSchema: Schema = new Schema({
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true },
    initiatorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stressLevel: { type: Number, required: true, min: 1, max: 5 },
    cooldownUntil: { type: Date },
    observation: { type: String, required: true },
    feeling: { type: String, required: true },
    need: { type: String, required: true },
    request: { type: String, required: true },
    generatedMessage: { type: String, required: true },
    visibility: { type: String, enum: Object.values(VisibilityType), default: VisibilityType.PRIVATE },
    scheduledShareAt: { type: Date },
    sharedAt: { type: Date },
    partnerResponse: {
        responseType: { type: String, enum: Object.values(ResponseType) },
        responseText: { type: String }
    },
    agreement: {
        outcome: { type: String, enum: Object.values(OutcomeType) },
        aftercare: { type: String }
    },
    comments: [{
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model<IRepair>('Repair', RepairSchema);
