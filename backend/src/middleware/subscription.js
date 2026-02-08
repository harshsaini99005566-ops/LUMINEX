const User = require('../models/User');

/**
 * Middleware to enforce subscription and usage limits
 */
const checkAccountLimit = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.canAddAccount()) {
      return res.status(403).json({ error: `Account limit reached for plan ${user.plan}` });
    }

    next();
  } catch (err) {
    next(err);
  }
};

const checkRuleLimit = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.canAddRule()) {
      return res.status(403).json({ error: `Rule limit reached for plan ${user.plan}` });
    }

    next();
  } catch (err) {
    next(err);
  }
};

const checkMessageLimit = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.canSendMessage()) {
      return res.status(403).json({ error: `Monthly message limit reached for plan ${user.plan}` });
    }

    next();
  } catch (err) {
    next(err);
  }
};

const checkAIReplyLimit = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.canUseAI()) {
      return res.status(403).json({ error: `AI reply limit reached for plan ${user.plan}` });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkAccountLimit,
  checkRuleLimit,
  checkMessageLimit,
  checkAIReplyLimit,
};
