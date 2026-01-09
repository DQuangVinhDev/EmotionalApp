import mongoose, { Schema, Document } from 'mongoose';

export interface IWeeklySession extends Document {
    coupleId: mongoose.Types.ObjectId;
    weekKey: string; // YYYY-[W]WW
    answersByUser: Map<string, {
        q1: string;
        q2: string;
        q3: string;
        q4: string;
        commitment: string;
    }>;
    backlogPicked?: mongoose.Types.ObjectId;
    createdAt: Date;
}

const WeeklySessionSchema: Schema = new Schema({
    coupleId: { type: Schema.Types.ObjectId, ref: 'Couple', required: true },
    weekKey: { type: String, required: true },
    answersByUser: {
        type: Map,
        of: {
            q1: String,
            q2: String,
            q3: String,
            q4: String,
            commitment: String
        },
        default: {}
    },
    backlogPicked: { type: Schema.Types.ObjectId, ref: 'BacklogItem' }
}, { timestamps: true });

export default mongoose.model<IWeeklySession>('WeeklySession', WeeklySessionSchema);
