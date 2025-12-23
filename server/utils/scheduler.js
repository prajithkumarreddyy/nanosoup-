const Order = require('../models/Order');

const cancelStaleOrders = async () => {
    try {
        const hoursLimit = 10;
        const cutoffTime = new Date(Date.now() - hoursLimit * 60 * 60 * 1000);

        const result = await Order.updateMany(
            {
                status: 'Processing',
                createdAt: { $lt: cutoffTime }
            },
            {
                $set: { status: 'Cancelled' }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`[Scheduler] Auto-cancelled ${result.modifiedCount} stale orders (older than ${hoursLimit} hours).`);
        }
    } catch (error) {
        console.error('[Scheduler] Error checking stale orders:', error);
    }
};

const startScheduler = () => {
    // Run immediately on startup
    cancelStaleOrders();

    // Then run every hour
    const oneHour = 60 * 60 * 1000;
    setInterval(cancelStaleOrders, oneHour);

    console.log('[Scheduler] Stale order checker verified and started.');
};

module.exports = { startScheduler };
