import cron from 'node-cron';
import Borrow from '../models/Borrow.js';

// Run every day at midnight (00:00)
export const initCronJobs = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('Running borrow expiration cron job...');

            const now = new Date();

            // Find all approved or borrowed records that have passed their due date
            const result = await Borrow.updateMany(
                {
                    status: { $in: ['approved', 'borrowed'] },
                    dueDate: { $lt: now }
                },
                {
                    $set: { status: 'expired' }
                }
            );

            console.log(`Successfully expired ${result.modifiedCount} borrow records.`);
        } catch (error) {
            console.error('Error in borrow expiration cron job:', error);
        }
    });

    console.log('Cron jobs initialized.');
};
