/**
 * AutomationRuleEngine - Main orchestration engine
 * Coordinates rule evaluation, reply generation, and execution
 */

const logger = require('../../utils/logger');
const RuleEvaluator = require('./RuleEvaluator');
const ReplyGenerator = require('./ReplyGenerator');


class AutomationRuleEngine {
  constructor(options = {}) {
    this.cache = new Map(); // accountId -> { rules, timestamp }
    this.replyGenerator = new ReplyGenerator(options.aiService);
    this.cacheTimeout = options.cacheTimeout || 5 * 60 * 1000; // 5 minutes
    this.logger = logger;
  }

  /**
   * Load rules for an account into cache
   */
  async loadRulesForAccount(accountId, rulesData) {
    try {
      const activeRules = rulesData
        .filter((rule) => rule.isActive)
        .sort((a, b) => b.priority - a.priority);

      this.cache.set(accountId, {
        rules: activeRules,
        timestamp: Date.now(),
        count: activeRules.length,
      });

      this.logger.info(
        `Loaded ${activeRules.length} rules for account ${accountId}`
      );

      return {
        success: true,
        rulesLoaded: activeRules.length,
      };
    } catch (error) {
      this.logger.error('Error loading rules for account', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get cached rules for account
   */
  getRulesForAccount(accountId) {
    const cached = this.cache.get(accountId);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.rules;
    }

    return null;
  }

  /**
   * Main method: Process message and generate response
   */
  async processMessage(accountId, message, context = {}) {
    try {
      const rules = this.getRulesForAccount(accountId);

      if (!rules || rules.length === 0) {
        return {
          processed: false,
          matched: false,
          reason: 'No active rules found',
        };
      }

      // Evaluate all rules
      const matchedRules = RuleEvaluator.evaluateMultipleRules(
        rules,
        message,
        context
      );

      if (matchedRules.length === 0) {
        return {
          processed: true,
          matched: false,
          reason: 'Message did not match any rules',
          rulesChecked: rules.length,
        };
      }

      // Get best matching rule
      const bestMatch = matchedRules[0];
      const rule = bestMatch.rule;

      // Check execution readiness
      const readiness = RuleEvaluator.isRuleReadyForExecution(rule, context);
      if (!readiness.ready) {
        return {
          processed: true,
          matched: false,
          reason: 'Rule not ready for execution',
          checks: readiness.checks,
        };
      }

      // Generate reply
      const reply = await this.replyGenerator.generateReply(rule, {
        ...context,
        message,
        matchedKeywords: bestMatch.evaluation.matchedKeywords,
      });

      return {
        processed: true,
        matched: true,
        reply,
        matchedRule: {
          id: rule._id,
          name: rule.name,
          priority: rule.priority,
          score: bestMatch.score,
        },
        allMatches: matchedRules.length,
        context: {
          messageLength: message.length,
          rulesChecked: rules.length,
        },
      };
    } catch (error) {
      this.logger.error('Error processing message', error);
      return {
        processed: false,
        error: error.message,
      };
    }
  }

  /**
   * Batch process messages
   */
  async batchProcessMessages(accountId, messages, context = {}) {
    try {
      const results = await Promise.all(
        messages.map((msg) => this.processMessage(accountId, msg, context))
      );

      const matched = results.filter((r) => r.matched).length;

      return {
        success: true,
        totalProcessed: messages.length,
        matched,
        results,
      };
    } catch (error) {
      this.logger.error('Error in batch processing', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get rule suggestions for a message
   */
  async getSuggestedRules(accountId, message, limit = 5) {
    try {
      const rules = this.getRulesForAccount(accountId);

      if (!rules) {
        return {
          success: false,
          reason: 'No rules cached',
        };
      }

      const suggestions = RuleEvaluator.evaluateMultipleRules(rules, message);

      return {
        success: true,
        message,
        suggestions: suggestions.slice(0, limit).map((s) => ({
          rule: {
            id: s.rule._id,
            name: s.rule.name,
            priority: s.rule.priority,
          },
          matchScore: s.score.toFixed(2),
          evaluations: s.evaluation.evaluations,
        })),
        total: suggestions.length,
      };
    } catch (error) {
      this.logger.error('Error getting rule suggestions', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update rule in cache
   */
  updateRuleInCache(accountId, updatedRule) {
    try {
      const cached = this.cache.get(accountId);

      if (!cached) {
        return { success: false, reason: 'Account not cached' };
      }

      const index = cached.rules.findIndex(
        (r) => r._id.toString() === updatedRule._id.toString()
      );

      if (index === -1) {
        return { success: false, reason: 'Rule not found in cache' };
      }

      if (updatedRule.isActive) {
        cached.rules[index] = updatedRule;
        cached.rules.sort((a, b) => b.priority - a.priority);
      } else {
        cached.rules.splice(index, 1);
      }

      this.logger.info(`Updated rule ${updatedRule._id} in cache`);

      return { success: true };
    } catch (error) {
      this.logger.error('Error updating rule in cache', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove rule from cache
   */
  removeRuleFromCache(accountId, ruleId) {
    try {
      const cached = this.cache.get(accountId);

      if (!cached) {
        return { success: false, reason: 'Account not cached' };
      }

      const initialLength = cached.rules.length;
      cached.rules = cached.rules.filter(
        (r) => r._id.toString() !== ruleId.toString()
      );

      if (cached.rules.length === initialLength) {
        return { success: false, reason: 'Rule not found' };
      }

      this.logger.info(`Removed rule ${ruleId} from cache`);

      return { success: true };
    } catch (error) {
      this.logger.error('Error removing rule from cache', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear cache for account
   */
  clearCacheForAccount(accountId) {
    this.cache.delete(accountId);
    this.logger.info(`Cleared cache for account ${accountId}`);
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.clear();
    this.logger.info('Cleared all rule cache');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    const stats = {
      accountsCached: this.cache.size,
      totalRulesCached: 0,
      cacheEntries: [],
    };

    for (const [accountId, data] of this.cache.entries()) {
      stats.totalRulesCached += data.count;
      stats.cacheEntries.push({
        accountId,
        rulesCount: data.count,
        age: Date.now() - data.timestamp,
      });
    }

    return stats;
  }

  /**
   * Set AI service
   */
  setAIService(aiService) {
    this.replyGenerator.setAIService(aiService);
  }
}

module.exports = AutomationRuleEngine;
