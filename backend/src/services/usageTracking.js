const User = require('../models/User');
const logger = require('../../utils/logger');

/**
 * Usage Tracking Service
 * Tracks and enforces plan limits
 */

// Check if user can perform action
const checkUsageLimit = async (userId, limitType) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const limit = user.limits[limitType];
    const usage = user.usage[`${limitType}Used`];

    if (!limit || usage === undefined) {
      throw new Error('Invalid limit type');
    }

    return {
      canUse: usage < limit,
      current: usage,
      limit,
      remaining: Math.max(0, limit - usage),
      percentage: Math.round((usage / limit) * 100),
    };
  } catch (error) {
    logger.error('Check usage limit error', error);
    throw error;
  }
};

// Increment usage
const incrementUsage = async (userId, usageType, amount = 1) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.usage[`${usageType}Used`] =
      (user.usage[`${usageType}Used`] || 0) + amount;

    // Check limit exceeded
    const limit = user.limits[usageType];
    if (user.usage[`${usageType}Used`] > limit) {
      logger.warn(
        `Usage limit exceeded for user ${userId}: ${usageType} (${user.usage[`${usageType}Used`]}/${limit})`
      );
    }

    await user.save();
    return user.usage[`${usageType}Used`];
  } catch (error) {
    logger.error('Increment usage error', error);
    throw error;
  }
};

// Reset monthly usage
const resetMonthlyUsage = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.usage.messagesThisMonth = 0;
    user.usage.lastResetDate = new Date();
    await user.save();

    logger.info(`Monthly usage reset for user ${userId}`);
    return user.usage;
  } catch (error) {
    logger.error('Reset monthly usage error', error);
    throw error;
  }
};

// Get usage report
const getUsageReport = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const report = {
      plan: user.plan,
      limits: user.limits,
      usage: user.usage,
      percentages: {
        accountsUsed:
          Math.round((user.usage.accountsUsed / user.limits.instagramAccounts) * 100) || 0,
        rulesUsed:
          Math.round((user.usage.rulesUsed / user.limits.automationRules) * 100) || 0,
        aiRepliesUsed:
          Math.round((user.usage.aiRepliesUsed / user.limits.aiReplies) * 100) || 0,
        messagesThisMonth:
          Math.round((user.usage.messagesThisMonth / user.limits.monthlyMessages) * 100) || 0,
      },
      warnings: [],
    };

    // Add warnings for high usage
    if (report.percentages.accountsUsed >= 80) {
      report.warnings.push('Instagram accounts limit approaching');
    }
    if (report.percentages.rulesUsed >= 80) {
      report.warnings.push('Automation rules limit approaching');
    }
    if (report.percentages.aiRepliesUsed >= 80) {
      report.warnings.push('AI replies limit approaching');
    }
    if (report.percentages.messagesThisMonth >= 80) {
      report.warnings.push('Monthly message limit approaching');
    }

    return report;
  } catch (error) {
    logger.error('Get usage report error', error);
    throw error;
  }
};

// Enforce usage limits
const enforceUsageLimits = async (userId, limitType) => {
  try {
    const { canUse } = await checkUsageLimit(userId, limitType);

    if (!canUse) {
      throw new Error(
        `${limitType} limit exceeded. Upgrade your plan to continue.`
      );
    }

    return true;
  } catch (error) {
    logger.error('Enforce usage limits error', error);
    throw error;
  }
};

// Get remaining quota for current month
const getRemainingQuota = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const lastReset = user.usage.lastResetDate || new Date();
    const daysUntilReset = Math.ceil(
      (30 - (now.getDate() - lastReset.getDate())) / 1
    );

    return {
      messagesRemaining: Math.max(
        0,
        user.limits.monthlyMessages - user.usage.messagesThisMonth
      ),
      daysUntilReset,
      resetDate: new Date(lastReset.getFullYear(), lastReset.getMonth() + 1, 1),
    };
  } catch (error) {
    logger.error('Get remaining quota error', error);
    throw error;
  }
};

module.exports = {
  checkUsageLimit,
  incrementUsage,
  resetMonthlyUsage,
  getUsageReport,
  enforceUsageLimits,
  getRemainingQuota,
};
