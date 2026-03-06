const cron = require('node-cron');
const ScheduledPost = require('../models/ScheduledPost');
const InstagramAccount = require('../models/InstagramAccount');
const { publishInstagramPost } = require('../services/instagramPublish');
const logger = require('../../utils/logger');

/**
 * Post Scheduler Job
 * Runs every minute to check for posts ready to publish
 */

let isRunning = false;

const processScheduledPosts = async () => {
  if (isRunning) {
    logger.debug('[Post Scheduler] Already running, skipping');
    return;
  }

  isRunning = true;

  try {
    // Get posts ready to publish
    const postsToPublish = await ScheduledPost.getReadyToPublish();

    if (postsToPublish.length === 0) {
      logger.debug('[Post Scheduler] No posts ready to publish');
      isRunning = false;
      return;
    }

    logger.info('[Post Scheduler] Found posts to publish', {
      count: postsToPublish.length,
    });

    // Process each post
    for (const post of postsToPublish) {
      try {
        await publishSinglePost(post);
      } catch (error) {
        logger.error('[Post Scheduler] Failed to publish post', {
          postId: post._id,
          error: error.message,
        });
        // Continue with next post even if this one fails
      }
    }

    // Also retry failed posts
    await retryFailedPosts();
  } catch (error) {
    logger.error('[Post Scheduler] Scheduler error', error);
  } finally {
    isRunning = false;
  }
};

const publishSinglePost = async (post) => {
  logger.info('[Post Scheduler] Publishing post', {
    postId: post._id,
    scheduledFor: post.scheduledFor,
  });

  // Get Instagram account with access token
  const account = await InstagramAccount.findById(post.instagramAccountId).select('+accessToken');

  if (!account || !account.isActive) {
    logger.error('[Post Scheduler] Account not found or inactive', {
      postId: post._id,
      accountId: post.instagramAccountId,
    });
    await post.markAsFailed('Instagram account not found or inactive');
    return;
  }

  // Check if token is expired
  if (account.tokenExpiresAt && new Date() >= account.tokenExpiresAt) {
    logger.error('[Post Scheduler] Access token expired', {
      postId: post._id,
      accountId: account._id,
    });
    await post.markAsFailed('Instagram access token expired');
    return;
  }

  // Mark as publishing
  await post.markAsPublishing();

  try {
    // Publish to Instagram
    const result = await publishInstagramPost(account, {
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaType,
      mediaFiles: post.mediaFiles,
      caption: post.fullCaption,
      location: post.location,
    });

    // Mark as published
    await post.markAsPublished(result);

    logger.info('[Post Scheduler] Post published successfully', {
      postId: post._id,
      instagramPostId: result.id,
      permalink: result.permalink,
    });

    // TODO: Add first comment if specified
    if (post.firstComment && result.id) {
      // Implement comment posting here
      logger.info('[Post Scheduler] First comment feature not yet implemented', {
        postId: post._id,
      });
    }
  } catch (error) {
    logger.error('[Post Scheduler] Publish failed', {
      postId: post._id,
      error: error.message,
    });

    // Mark as failed
    await post.markAsFailed(error.message);
  }
};

const retryFailedPosts = async () => {
  try {
    const retryablePosts = await ScheduledPost.getRetryable();

    if (retryablePosts.length === 0) {
      return;
    }

    logger.info('[Post Scheduler] Retrying failed posts', {
      count: retryablePosts.length,
    });

    for (const post of retryablePosts) {
      try {
        await publishSinglePost(post);
      } catch (error) {
        logger.error('[Post Scheduler] Retry failed', {
          postId: post._id,
          attempt: post.attempts,
          error: error.message,
        });
      }
    }
  } catch (error) {
    logger.error('[Post Scheduler] Retry process error', error);
  }
};

/**
 * Start the scheduler
 * Runs every minute
 */
const startScheduler = () => {
  logger.info('[Post Scheduler] Starting post scheduler (runs every minute)');

  // Run every minute: '* * * * *'
  // For testing, you can use '*/5 * * * * *' for every 5 seconds
  cron.schedule('* * * * *', processScheduledPosts);

  // Run once on startup to catch any missed posts
  setTimeout(() => {
    processScheduledPosts();
  }, 5000); // Wait 5 seconds after startup
};

/**
 * Manual trigger for testing
 */
const triggerNow = async () => {
  logger.info('[Post Scheduler] Manual trigger');
  await processScheduledPosts();
};

module.exports = {
  startScheduler,
  triggerNow,
  processScheduledPosts,
};
