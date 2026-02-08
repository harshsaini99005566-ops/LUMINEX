/**
 * RuleEvaluator - Core rule evaluation and matching logic
 * Handles rule evaluation, priority sorting, and execution readiness checks
 */

const logger = require('../../utils/logger');
const KeywordMatcher = require('./KeywordMatcher');

class RuleEvaluator {
  /**
   * Evaluate if message triggers a rule
   * @param {object} rule - The automation rule
   * @param {string} message - The message content
   * @param {object} context - Message context
   * @returns {object} - Evaluation result with score and matched keywords
   */
  static evaluateRule(rule, message, context = {}) {
    try {
      if (!rule.isActive) {
        return {
          triggered: false,
          reason: 'Rule is inactive',
        };
      }

      const evaluations = [];

      // Check keywords if present
      if (rule.keywords && rule.keywords.length > 0) {
        const keywordResult = KeywordMatcher.match(
          message,
          rule.keywords,
          rule.matchType,
          rule.caseSensitive
        );
        evaluations.push({
          type: 'keywords',
          passed: keywordResult.matched,
          score: keywordResult.score,
          matched: keywordResult.matchedKeywords,
        });
      }

      // Check hashtags if present
      if (rule.hashtags && rule.hashtags.length > 0) {
        const hashtagResult = this._checkHashtags(rule.hashtags, message);
        evaluations.push({
          type: 'hashtags',
          passed: hashtagResult.matched,
          score: hashtagResult.score,
          matched: hashtagResult.found,
        });
      }

      // Check mentions if required
      if (rule.mentions) {
        const mentionResult = this._checkMentions(message);
        evaluations.push({
          type: 'mentions',
          passed: mentionResult.matched,
          found: mentionResult.mentions,
        });
      }

      // Check if shouldn't reply to replies
      if (rule.doNotReplyToReplies && context.isReply) {
        return {
          triggered: false,
          reason: 'No replies to replies policy',
        };
      }

      // Check max replies per user
      if (rule.maxRepliesPerUser > 0 && context.userReplyCount) {
        if (context.userReplyCount >= rule.maxRepliesPerUser) {
          return {
            triggered: false,
            reason: `Max replies (${rule.maxRepliesPerUser}) reached for user`,
          };
        }
      }

      // All checks must pass
      const allPassed = evaluations.length === 0 || evaluations.every((e) => e.passed);

      if (allPassed) {
        const totalScore = evaluations.reduce((acc, e) => acc + (e.score || 0), 0) / Math.max(evaluations.length, 1);

        return {
          triggered: true,
          score: totalScore,
          evaluations,
          matchedKeywords: evaluations
            .filter((e) => e.matched)
            .flatMap((e) => e.matched),
        };
      } else {
        const failedChecks = evaluations.filter((e) => !e.passed).map((e) => e.type);
        return {
          triggered: false,
          reason: `Failed checks: ${failedChecks.join(', ')}`,
        };
      }
    } catch (error) {
      logger.error('Error evaluating rule', error);
      return {
        triggered: false,
        reason: 'Evaluation error',
        error: error.message,
      };
    }
  }

  /**
   * Check if message contains required hashtags
   */
  static _checkHashtags(requiredHashtags, message) {
    const hashtagRegex = /#\w+/gi;
    const foundHashtags = message.match(hashtagRegex) || [];
    const foundSet = new Set(foundHashtags.map((h) => h.toLowerCase()));

    const required = new Set(
      requiredHashtags.map((h) => (h.startsWith('#') ? h.toLowerCase() : `#${h.toLowerCase()}`))
    );

    const matched = Array.from(required).filter((h) => foundSet.has(h));
    const allMatched = matched.length === required.size;

    return {
      matched: allMatched,
      found: matched,
      score: allMatched ? 100 : 0,
    };
  }

  /**
   * Check if message contains mentions
   */
  static _checkMentions(message) {
    const mentionRegex = /@\w+/g;
    const mentions = message.match(mentionRegex) || [];

    return {
      matched: mentions.length > 0,
      mentions,
    };
  }

  /**
   * Evaluate multiple rules and sort by priority and match score
   */
  static evaluateMultipleRules(rules, message, context = {}) {
    const results = [];

    for (const rule of rules) {
      const evaluation = this.evaluateRule(rule, message, context);

      if (evaluation.triggered) {
        results.push({
          rule,
          evaluation,
          priority: rule.priority,
          score: evaluation.score || 0,
        });
      }
    }

    // Sort by priority (descending) then by score (descending)
    results.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.score - a.score;
    });

    return results;
  }

  /**
   * Get best matching rule
   */
  static getBestMatchingRule(rules, message, context = {}) {
    const results = this.evaluateMultipleRules(rules, message, context);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Check if rule is ready for execution
   */
  static isRuleReadyForExecution(rule, context = {}) {
    const checks = {
      isActive: rule.isActive === true,
      hasValidTrigger: this._hasValidTriggerConfig(rule),
      hasValidReply: this._hasValidReplyConfig(rule),
      withinRateLimit: !context.rateLimited,
    };

    return {
      ready: Object.values(checks).every((v) => v === true),
      checks,
    };
  }

  /**
   * Check if rule has valid trigger configuration
   */
  static _hasValidTriggerConfig(rule) {
    if (rule.triggerType === 'keyword') {
      return rule.keywords && rule.keywords.length > 0;
    }
    if (rule.triggerType === 'mention') {
      return rule.mentions === true;
    }
    return true;
  }

  /**
   * Check if rule has valid reply configuration
   */
  static _hasValidReplyConfig(rule) {
    switch (rule.replyType) {
      case 'predefined':
        return !!rule.predefinedReply;
      case 'ai':
        return !!rule.aiPrompt;
      case 'handoff':
        return !!rule.handoffEmail;
      default:
        return false;
    }
  }

  /**
   * Get rule stats and metadata
   */
  static getRuleMetadata(rule) {
    const uptime = rule.createdAt
      ? new Date() - rule.createdAt
      : 0;

    const triggerRate =
      rule.triggerCount > 0
        ? (rule.successCount / rule.triggerCount) * 100
        : 0;

    return {
      id: rule._id,
      name: rule.name,
      isActive: rule.isActive,
      priority: rule.priority,
      uptime,
      stats: {
        triggers: rule.triggerCount || 0,
        successes: rule.successCount || 0,
        failures: rule.failureCount || 0,
        successRate: triggerRate.toFixed(2),
      },
      lastTriggered: rule.lastTriggered,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}

module.exports = RuleEvaluator;
