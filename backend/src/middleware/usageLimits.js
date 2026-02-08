const User = require('../models/User');
const { checkUsageLimit } = require('../services/usageTracking');
const logger = require('../../utils/logger');

/**
 * Middleware to enforce usage limits
 */

// Check if user can add Instagram account
const checkInstagramAccountLimit = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { canUse, remaining, limit } = await checkUsageLimit(
      userId,
      'instagramAccounts'
    );

    if (!canUse) {
      return res.status(403).json({
        error: 'Instagram accounts limit reached',
        message: `You have reached your limit of ${limit} accounts. Please upgrade to add more.`,
        limit,
        usage: limit,
      });
    }

    req.usage = { canUse, remaining, limit };
    next();
  } catch (error) {
    logger.error('Check Instagram account limit error', error);
    next(error);
  }
};

// Check if user can add automation rule
const checkAutomationRuleLimit = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { canUse, remaining, limit } = await checkUsageLimit(
      userId,
      'automationRules'
    );

    if (!canUse) {
      return res.status(403).json({
        error: 'Automation rules limit reached',
        message: `You have reached your limit of ${limit} rules. Please upgrade to add more.`,
        limit,
        usage: limit,
      });
    }

    req.usage = { canUse, remaining, limit };
    next();
  } catch (error) {
    logger.error('Check automation rule limit error', error);
    next(error);
  }
};

// Check if user can use AI reply
const checkAIReplyLimit = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { canUse, remaining, limit } = await checkUsageLimit(
      userId,
      'aiReplies'
    );

    if (!canUse) {
      return res.status(403).json({
        error: 'AI replies limit reached',
        message: `You have reached your limit of ${limit} AI replies. Please upgrade or wait for next month.`,
        limit,
        usage: limit,
      });
    }

    req.usage = { canUse, remaining, limit };
    next();
  } catch (error) {
    logger.error('Check AI reply limit error', error);
    next(error);
  }
};

// Check if user can send message
const checkMonthlyMessageLimit = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { canUse, remaining, limit, percentage } = await checkUsageLimit(
      userId,
      'monthlyMessages'
    );

    if (!canUse) {
      return res.status(403).json({
        error: 'Monthly message limit reached',
        message: `You have reached your limit of ${limit} messages this month. Please upgrade or wait for next month.`,
        limit,
        usage: limit,
        percentage: 100,
      });
    }

    // Warn if approaching limit (80%+)
    if (percentage >= 80) {
      res.set('X-Usage-Warning', `You have used ${percentage}% of your monthly message limit`);
    }

    req.usage = { canUse, remaining, limit, percentage };
    next();
  } catch (error) {
    logger.error('Check monthly message limit error', error);
    next(error);
  }
};

// Check if user is on paid plan
const checkPaidPlan = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.plan === 'free') {
      return res.status(403).json({
        error: 'This feature requires a paid plan',
        message: 'Please upgrade your plan to access this feature',
        currentPlan: 'free',
      });
    }

    next();
  } catch (error) {
    logger.error('Check paid plan error', error);
    next(error);
  }
};

// Check if user is on specific plan or better
const checkMinimumPlan = (minimumPlan) => {
  const planHierarchy = { free: 0, starter: 1, pro: 2, agency: 3 };

  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if ((planHierarchy[user.plan] || 0) < (planHierarchy[minimumPlan] || 0)) {
        return res.status(403).json({
          error: `This feature requires ${minimumPlan} plan or better`,
          currentPlan: user.plan,
          requiredPlan: minimumPlan,
        });
      }

      next();
    } catch (error) {
      logger.error('Check minimum plan error', error);
      next(error);
    }
  };
};

module.exports = {
  checkInstagramAccountLimit,
  checkAutomationRuleLimit,
  checkAIReplyLimit,
  checkMonthlyMessageLimit,
  checkPaidPlan,
  checkMinimumPlan,
};
