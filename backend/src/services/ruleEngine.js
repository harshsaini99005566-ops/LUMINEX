const logger = require('../../utils/logger');

class RuleEngine {
  constructor() {
    this.rules = new Map();
  }

  /**
   * Load all rules for an account into memory
   */
  async loadRules(accountId, rulesData) {
    try {
      if (!this.rules.has(accountId)) {
        this.rules.set(accountId, []);
      }

      const activeRules = rulesData.filter((rule) => rule.isActive);
      this.rules.set(accountId, activeRules.sort((a, b) => b.priority - a.priority));

      logger.info(`Loaded ${activeRules.length} rules for account ${accountId}`);
    } catch (error) {
      logger.error('Error loading rules', error);
    }
  }

  /**
   * Match message against rules
   */
  matchRules(accountId, messageContent) {
    const rules = this.rules.get(accountId) || [];
    const matches = [];

    for (const rule of rules) {
      if (this.evaluateRule(rule, messageContent)) {
        matches.push(rule);
      }
    }

    return matches;
  }

  /**
   * Evaluate single rule
   */
  evaluateRule(rule, messageContent) {
    const content = rule.caseSensitive
      ? messageContent
      : messageContent.toLowerCase();

    // Check keywords
    if (rule.keywords && rule.keywords.length > 0) {
      if (!this.checkKeywords(rule.keywords, content, rule.matchType)) {
        return false;
      }
    }

    // Check hashtags
    if (rule.hashtags && rule.hashtags.length > 0) {
      if (!this.checkHashtags(rule.hashtags, content)) {
        return false;
      }
    }

    // Check mentions
    if (rule.mentions && !this.checkMentions(content)) {
      return false;
    }

    return true;
  }

  /**
   * Check if message contains keywords
   */
  checkKeywords(keywords, content, matchType) {
    const lowerKeywords = keywords.map((k) => k.toLowerCase());

    switch (matchType) {
      case 'exact':
        return lowerKeywords.some((keyword) => content === keyword);

      case 'starts_with':
        return lowerKeywords.some((keyword) => content.startsWith(keyword));

      case 'contains':
      default:
        return lowerKeywords.some((keyword) => content.includes(keyword));
    }
  }

  /**
   * Check if message contains hashtags
   */
  checkHashtags(hashtags, content) {
    const hashtagRegex = /#\w+/g;
    const foundHashtags = content.match(hashtagRegex) || [];
    const hashtagSet = new Set(hashtags.map((h) => (h.startsWith('#') ? h : `#${h}`)));

    return foundHashtags.some((tag) => hashtagSet.has(tag));
  }

  /**
   * Check if message contains mentions
   */
  checkMentions(content) {
    const mentionRegex = /@\w+/g;
    return mentionRegex.test(content);
  }

  /**
   * Generate response for matched rule
   */
  generateResponse(rule) {
    if (rule.replyType === 'predefined' && rule.predefinedReply) {
      return {
        type: 'predefined',
        content: rule.predefinedReply,
        delay: rule.delaySeconds || 0,
      };
    }

    if (rule.replyType === 'ai' && rule.aiPrompt) {
      return {
        type: 'ai',
        prompt: rule.aiPrompt,
        temperature: rule.aiTemperature || 0.7,
        delay: rule.delaySeconds || 0,
      };
    }

    if (rule.replyType === 'handoff' && rule.handoffEmail) {
      return {
        type: 'handoff',
        email: rule.handoffEmail,
      };
    }

    return null;
  }

  /**
   * Update rule in cache
   */
  updateRule(accountId, updatedRule) {
    try {
      const rules = this.rules.get(accountId) || [];
      const index = rules.findIndex((r) => r._id.toString() === updatedRule._id.toString());

      if (index !== -1) {
        rules[index] = updatedRule;
        rules.sort((a, b) => b.priority - a.priority);
        this.rules.set(accountId, rules);
      }

      logger.info(`Updated rule ${updatedRule._id} for account ${accountId}`);
    } catch (error) {
      logger.error('Error updating rule', error);
    }
  }

  /**
   * Remove rule from cache
   */
  removeRule(accountId, ruleId) {
    try {
      const rules = this.rules.get(accountId) || [];
      const filtered = rules.filter((r) => r._id.toString() !== ruleId.toString());
      this.rules.set(accountId, filtered);

      logger.info(`Removed rule ${ruleId} for account ${accountId}`);
    } catch (error) {
      logger.error('Error removing rule', error);
    }
  }

  /**
   * Clear rules for account
   */
  clearRules(accountId) {
    this.rules.delete(accountId);
    logger.info(`Cleared rules for account ${accountId}`);
  }
}

module.exports = new RuleEngine();
