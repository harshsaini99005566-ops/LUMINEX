/**
 * Instagram Token Refresh Job
 * 
 * Automatically refreshes Instagram long-lived access tokens before they expire.
 * Long-lived tokens last 60 days, so we refresh them every 30 days to ensure
 * uninterrupted service.
 * 
 * This job runs daily at 02:00 AM and checks for tokens that:
 * - Expire within the next 30 days
 * - Haven't been refreshed in the last 25 days
 * 
 * Without this job, users will be disconnected after 60 days and need to
 * reconnect their accounts manually.
 */

const cron = require('node-cron');
const logger = require('../../utils/logger');
const InstagramAccount = require('../models/InstagramAccount');
const { refreshLongLivedToken } = require('../services/instagramOAuth');

/**
 * Refresh Instagram tokens that are expiring soon
 */
async function refreshInstagramTokens() {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twentyFiveDaysAgo = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000);

    // Find active accounts with tokens expiring within 30 days
    // OR accounts that haven't been refreshed in 25+ days
    const accountsToRefresh = await InstagramAccount.find({
      isActive: true,
      $or: [
        { tokenExpiresAt: { $lte: thirtyDaysFromNow } },
        { 
          lastTokenRefresh: { $lte: twentyFiveDaysAgo },
          tokenExpiresAt: { $exists: true }
        }
      ]
    }).select('+accessToken'); // Include encrypted token field

    logger.info('[Token Refresh Job] Found accounts to refresh', {
      count: accountsToRefresh.length,
      totalActive: await InstagramAccount.countDocuments({ isActive: true })
    });

    let successCount = 0;
    let failCount = 0;

    for (const account of accountsToRefresh) {
      try {
        // Refresh the token
        const { accessToken: newToken, expiresIn } = await refreshLongLivedToken(account.accessToken);

        // Update account with new token and expiration
        account.accessToken = newToken;
        account.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
        account.lastTokenRefresh = new Date();
        await account.save();

        successCount++;

        logger.info('[Token Refresh Job] Token refreshed successfully', {
          accountId: account._id,
          username: account.username,
          newExpiresAt: account.tokenExpiresAt.toISOString(),
          daysUntilExpiry: Math.floor(expiresIn / (60 * 60 * 24))
        });

      } catch (error) {
        failCount++;

        logger.error('[Token Refresh Job] Failed to refresh token', {
          accountId: account._id,
          username: account.username,
          error: error.message,
          errorData: error.response?.data
        });

        // If token is invalid, mark account as disconnected
        if (error.response?.data?.error?.code === 190) {
          account.isActive = false;
          account.accountStatus = 'error';
          await account.save();

          logger.warn('[Token Refresh Job] Account marked as disconnected due to invalid token', {
            accountId: account._id,
            username: account.username
          });
        }
      }
    }

    logger.info('[Token Refresh Job] Completed', {
      total: accountsToRefresh.length,
      succeeded: successCount,
      failed: failCount
    });

  } catch (error) {
    logger.error('[Token Refresh Job] Job execution failed', {
      error: error.message,
      stack: error.stack
    });
  }
}

// Schedule: Run daily at 02:00 AM UTC
// This ensures tokens are refreshed well before expiration
cron.schedule('0 2 * * *', () => {
  logger.info('[Token Refresh Job] Starting scheduled token refresh');
  refreshInstagramTokens();
});

// Also allow manual execution for testing
module.exports = { refreshInstagramTokens };
