/**
 * Subscription enforcement middleware
 * Exports factory helpers for message and rule checks.
 */

const User = require('../models/User');

const isSubscriptionValid = (user) => {
  if (!user) return false;
  const status = user.subscriptionStatus || 'none';
  if (status === 'active') return true;
  if (status === 'trial' && user.trialEndsAt && new Date(user.trialEndsAt) >= new Date()) return true;
  return false;
};

// Generic middleware to ensure subscription is valid
const enforceSubscription = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'unauthorized', message: 'Authentication required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'user_not_found' });

    if (!isSubscriptionValid(user)) {
      return res.status(402).json({
        error: 'subscription_required',
        message: 'Your subscription is not active. Please upgrade to continue.'
      });
    }

    req.currentUser = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware factory for message-send routes
const enforceMessageLimit = (count = 1) => {
  return async (req, res, next) => {
    try {
      const userId = req.user && req.user.id;
      if (!userId) return res.status(401).json({ error: 'unauthorized' });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'user_not_found' });

      if (!isSubscriptionValid(user)) {
        return res.status(402).json({ error: 'subscription_required', message: 'Subscription inactive' });
      }

      // Support different usage field names for backwards compatibility
      const messagesSent = (user.usage && (user.usage.messagesSent ?? user.usage.messagesThisMonth ?? 0)) || 0;
      const messageLimit = (user.limits && (user.limits.monthlyMessages ?? 0)) || 0;

      if (messagesSent + count > messageLimit) {
        return res.status(402).json({
          error: 'message_quota_exceeded',
          message: `Monthly message limit reached (${messageLimit}). Please upgrade.`
        });
      }

      req.currentUser = user;
      next();
    } catch (err) {
      next(err);
    }
  };
};

// Middleware factory for rule creation routes
const enforceRuleLimit = () => {
  return async (req, res, next) => {
    try {
      const userId = req.user && req.user.id;
      if (!userId) return res.status(401).json({ error: 'unauthorized' });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'user_not_found' });

      if (!isSubscriptionValid(user)) {
        return res.status(402).json({ error: 'subscription_required', message: 'Subscription inactive' });
      }

      const rulesCreated = (user.usage && (user.usage.rulesCreated ?? user.usage.rulesUsed ?? 0)) || 0;
      const ruleLimit = (user.limits && (user.limits.automationRules ?? 0)) || 0;

      if (rulesCreated + 1 > ruleLimit) {
        return res.status(402).json({
          error: 'rule_quota_exceeded',
          message: `Rule creation limit reached (${ruleLimit}). Please upgrade.`
        });
      }

      req.currentUser = user;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  enforceSubscription,
  enforceMessageLimit,
  enforceRuleLimit,
};
