import cron from 'node-cron';
import CheckIn, { VisibilityType } from '../models/CheckIn';
import Kudos from '../models/Kudos';
import PromptAnswer from '../models/PromptAnswer';
import Repair from '../models/Repair';

export const startCronJobs = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        console.log('Running cron job at', now.toISOString());

        const filter = {
            visibility: VisibilityType.SCHEDULED_SHARE,
            scheduledShareAt: { $lte: now },
            sharedAt: null
        };

        const update = {
            $set: {
                sharedAt: now,
                visibility: VisibilityType.SHARED_NOW
            }
        };

        try {
            await Promise.all([
                CheckIn.updateMany(filter, update),
                Kudos.updateMany(filter, update),
                PromptAnswer.updateMany(filter, update),
                Repair.updateMany(filter, update)
            ]);
        } catch (error: any) {
            console.error('Error in cron job:', error);
        }
    });
};
