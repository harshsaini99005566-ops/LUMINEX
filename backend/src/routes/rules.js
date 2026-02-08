const express = require('express');
const AutomationRule = require('../models/AutomationRule');
const InstagramAccount = require('../models/InstagramAccount');
const User = require('../models/User');
const { enforceRuleLimit } = require('../middleware/subscriptionEnforce');

const router = express.Router();

// Create automation rule
router.post('/', enforceRuleLimit(), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      instagramAccountId,
      name,
      description,
      triggerType,
      keywords,
      matchType,
      replyType,
      predefinedReply,
      useAI,
      aiPrompt,
      aiTemperature
    } = req.body;

    // Verify account ownership
    const account = await InstagramAccount.findOne({
      _id: instagramAccountId,
      userId
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Check plan limits
    const user = await User.findById(userId);
    if (!user.canAddRule()) {
      return res.status(403).json({
        error: `Your ${user.plan} plan allows ${user.limits.automationRules} rule(s)`
      });
    }

    // Create rule
    const rule = await AutomationRule.create({
      userId,
      instagramAccountId,
      name,
      description,
      triggerType,
      keywords: keywords || [],
      matchType,
      replyType,
      predefinedReply,
      useAI,
      aiPrompt,
      aiTemperature
    });

    // Update user usage
    user.usage.rulesUsed += 1;
    await user.save();

    res.status(201).json({
      message: 'Rule created',
      rule
    });
  } catch (error) {
    next(error);
  }
});

// Get rules for an account
router.get('/account/:accountId', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;

    // Verify account ownership
    const account = await InstagramAccount.findOne({
      _id: accountId,
      userId
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const rules = await AutomationRule.find({
      userId,
      instagramAccountId: accountId
    }).sort({ priority: -1 });

    res.json({ rules });
  } catch (error) {
    next(error);
  }
});

// Update rule
router.put('/:ruleId', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { ruleId } = req.params;

    const rule = await AutomationRule.findOne({
      _id: ruleId,
      userId
    });

    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    Object.assign(rule, req.body);
    await rule.save();

    res.json({
      message: 'Rule updated',
      rule
    });
  } catch (error) {
    next(error);
  }
});

// Delete rule
router.delete('/:ruleId', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { ruleId } = req.params;

    const rule = await AutomationRule.findOneAndDelete({
      _id: ruleId,
      userId
    });

    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    // Update user usage
    const user = await User.findById(userId);
    user.usage.rulesUsed = Math.max(0, user.usage.rulesUsed - 1);
    await user.save();

    res.json({ message: 'Rule deleted' });
  } catch (error) {
    next(error);
  }
});

// Toggle rule active status
router.patch('/:ruleId/toggle', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { ruleId } = req.params;

    const rule = await AutomationRule.findOne({
      _id: ruleId,
      userId
    });

    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    rule.isActive = !rule.isActive;
    await rule.save();

    res.json({
      message: `Rule ${rule.isActive ? 'enabled' : 'disabled'}`,
      rule
    });
  } catch (error) {
    next(error);
  }
});

// Test rule
router.post('/:ruleId/test', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { ruleId } = req.params;
    const { testMessage } = req.body;

    const rule = await AutomationRule.findOne({
      _id: ruleId,
      userId
    });

    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    // Test if message matches
    const matches = matchesKeywords(testMessage, rule.keywords, rule.matchType);

    let response = null;
    if (matches) {
      if (rule.predefinedReply) {
        response = rule.predefinedReply;
      } else if (rule.useAI && rule.aiPrompt) {
        // Would call OpenAI in production
        response = '[AI-generated response would be here]';
      }
    }

    res.json({
      matches,
      wouldReplyWith: response
    });
  } catch (error) {
    next(error);
  }
});

function matchesKeywords(message, keywords, matchType) {
  if (!keywords || keywords.length === 0) return false;

  const lowerMessage = message.toLowerCase();

  return keywords.some(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    
    switch (matchType) {
      case 'exact':
        return lowerMessage === lowerKeyword;
      case 'starts_with':
        return lowerMessage.startsWith(lowerKeyword);
      case 'contains':
      default:
        return lowerMessage.includes(lowerKeyword);
    }
  });
}

module.exports = router;
