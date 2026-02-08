/**
 * Monthly usage reset job
 * Resets usage.messagesSent and usage.rulesCreated for trial/active users
 */

const cron = require('node-cron');
const logger = require('../../utils/logger');
const User = require('../models/User');

async function resetMonthlyUsage() {
  try {
    const now = new Date();
    const filter = { subscriptionStatus: { $in: ['active', 'trial'] } };
    const update = {
      $set: {
        'usage.messagesSent': 0,
        'usage.rulesCreated': 0,
        'usage.messagesThisMonth': 0,
        'usage.rulesUsed': 0,
        'usage.lastResetDate': now,
      },
    };

    const result = await User.updateMany(filter, update);
    logger.info(`Monthly usage reset job: matched=${result.matchedCount}, modified=${result.modifiedCount}`);
  } catch (err) {
    logger.error('Monthly usage reset job failed', err);
  }
}

// Schedule: run at 00:10 UTC on the 1st of each month to avoid overlap
cron.schedule('10 0 1 * *', () => {
  logger.info('Running scheduled monthly usage reset job');
  resetMonthlyUsage();
});

module.exports = { resetMonthlyUsage };
