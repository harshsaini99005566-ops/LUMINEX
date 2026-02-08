/**
 * Rule Engine Utilities
 * Helper functions for rule management and execution
 */



class RuleEngineUtils {
  /**
   * Parse and sanitize rule keywords
   */
  static sanitizeKeywords(keywords) {
    if (!Array.isArray(keywords)) {
      return [];
    }

    return keywords
      .filter((k) => typeof k === 'string' && k.trim().length > 0)
      .map((k) => k.trim().toLowerCase())
      .filter((k, i, arr) => arr.indexOf(k) === i); // Remove duplicates
  }

  /**
   * Validate and format rule configuration
   */
  static formatRuleConfig(rule) {
    return {
      _id: rule._id,
      name: rule.name,
      description: rule.description,
      isActive: rule.isActive,
      priority: rule.priority,
      triggerType: rule.triggerType,
      keywords: this.sanitizeKeywords(rule.keywords),
      hashtags: Array.isArray(rule.hashtags) ? rule.hashtags : [],
      mentions: Boolean(rule.mentions),
      matchType: rule.matchType,
      caseSensitive: Boolean(rule.caseSensitive),
      replyType: rule.replyType,
      predefinedReply: rule.predefinedReply,
      useAI: Boolean(rule.useAI),
      aiPrompt: rule.aiPrompt,
      aiTemperature: rule.aiTemperature || 0.7,
      handoffEmail: rule.handoffEmail,
      delaySeconds: rule.delaySeconds || 0,
      doNotReplyToReplies: Boolean(rule.doNotReplyToReplies),
      maxRepliesPerUser: rule.maxRepliesPerUser || 0,
      stats: {
        triggerCount: rule.triggerCount || 0,
        successCount: rule.successCount || 0,
        failureCount: rule.failureCount || 0,
      },
      lastTriggered: rule.lastTriggered,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }

  /**
   * Calculate rule effectiveness score
   */
  static calculateEffectivenessScore(rule) {
    if (!rule.triggerCount || rule.triggerCount === 0) {
      return 0;
    }

    const successRate = rule.successCount / rule.triggerCount;
    const priorityWeight = rule.priority / 100;
    const recencyWeight = this._getRecencyWeight(rule.lastTriggered);

    return (successRate * 0.5 + priorityWeight * 0.3 + recencyWeight * 0.2) * 100;
  }

  /**
   * Get recency weight (0-1) based on last trigger time
   */
  static _getRecencyWeight(lastTriggered) {
    if (!lastTriggered) {
      return 0;
    }

    const daysSince = (Date.now() - new Date(lastTriggered)) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - daysSince / 30); // Decay over 30 days
  }

  /**
   * Suggest rules for a message
   */
  static suggestRulesForMessage(message, allRules) {
    if (!message || !Array.isArray(allRules)) {
      return [];
    }

    const suggestions = allRules
      .map((rule) => {
        const score = this._calculateMatchScore(message, rule);
        return { rule, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    return suggestions;
  }

  /**
   * Calculate match score for a message against a rule
   */
  static _calculateMatchScore(message, rule) {
    if (!rule.isActive) {
      return 0;
    }

    let score = 0;

    // Keyword matching
    if (rule.keywords && rule.keywords.length > 0) {
      const keywordMatches = rule.keywords.filter((kw) =>
        message.toLowerCase().includes(kw.toLowerCase())
      ).length;
      score += (keywordMatches / rule.keywords.length) * 50;
    }

    // Hashtag matching
    if (rule.hashtags && rule.hashtags.length > 0) {
      const hashtags = message.match(/#\w+/g) || [];
      const hashtagMatches = rule.hashtags.filter((ht) =>
        hashtags.includes(`#${ht.toLowerCase()}`)
      ).length;
      score += (hashtagMatches / rule.hashtags.length) * 30;
    }

    // Mention matching
    if (rule.mentions && message.includes('@')) {
      score += 20;
    }

    // Priority boost
    score += (rule.priority / 100) * 10;

    return score;
  }

  /**
   * Detect rule conflicts
   */
  static detectConflicts(rules) {
    const conflicts = [];

    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const rule1 = rules[i];
        const rule2 = rules[j];

        // Same keywords and higher priority rule will always win
        if (
          rule1.triggerType === rule2.triggerType &&
          rule1.priority > rule2.priority &&
          this._haveOverlappingKeywords(rule1, rule2)
        ) {
          conflicts.push({
            type: 'priority-conflict',
            dominantRule: rule1._id,
            subordinateRule: rule2._id,
            reason: `Rule ${rule1.name} will always trigger before ${rule2.name}`,
          });
        }

        // Identical trigger but different replies (potential issue)
        if (
          this._haveIdenticalTriggers(rule1, rule2) &&
          rule1.replyType !== rule2.replyType
        ) {
          conflicts.push({
            type: 'different-reply-types',
            rule1: rule1._id,
            rule2: rule2._id,
            reason: 'Rules have identical triggers but different reply types',
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Check if rules have overlapping keywords
   */
  static _haveOverlappingKeywords(rule1, rule2) {
    if (!rule1.keywords || !rule2.keywords) {
      return false;
    }

    const keywords1 = new Set(rule1.keywords.map((k) => k.toLowerCase()));
    const keywords2 = new Set(rule2.keywords.map((k) => k.toLowerCase()));

    for (const kw of keywords1) {
      if (keywords2.has(kw)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if rules have identical triggers
   */
  static _haveIdenticalTriggers(rule1, rule2) {
    return (
      rule1.triggerType === rule2.triggerType &&
      JSON.stringify(rule1.keywords) === JSON.stringify(rule2.keywords) &&
      rule1.matchType === rule2.matchType &&
      rule1.caseSensitive === rule2.caseSensitive
    );
  }

  /**
   * Get rule recommendations based on account data
   */
  static getRecommendations(accountData) {
    const recommendations = [];

    // Check for high-priority empty rules
    if (accountData.rules) {
      const emptyHighPriority = accountData.rules.filter(
        (r) => r.priority > 10 && (!r.keywords || r.keywords.length === 0)
      );

      if (emptyHighPriority.length > 0) {
        recommendations.push({
          type: 'empty-keywords',
          severity: 'warning',
          message: 'High-priority rules with no keywords will never trigger',
          affectedRules: emptyHighPriority.map((r) => r._id),
        });
      }
    }

    // Check for low success rates
    if (accountData.rules) {
      const lowSuccessRules = accountData.rules.filter((r) => {
        const rate = r.triggerCount > 0 ? r.successCount / r.triggerCount : 0;
        return rate < 0.5 && r.triggerCount > 10;
      });

      if (lowSuccessRules.length > 0) {
        recommendations.push({
          type: 'low-success-rate',
          severity: 'info',
          message: 'Some rules have low success rates. Consider reviewing them.',
          affectedRules: lowSuccessRules.map((r) => r._id),
        });
      }
    }

    return recommendations;
  }

  /**
   * Export rules as JSON
   */
  static exportRules(rules, format = 'json') {
    if (format === 'json') {
      return JSON.stringify(
        rules.map((r) => this.formatRuleConfig(r)),
        null,
        2
      );
    }

    if (format === 'csv') {
      return this._exportAsCSV(rules);
    }

    return null;
  }

  /**
   * Export rules as CSV
   */
  static _exportAsCSV(rules) {
    const headers = [
      'Name',
      'Priority',
      'Active',
      'Trigger Type',
      'Keywords',
      'Reply Type',
      'Triggers',
      'Success Count',
    ];

    const rows = rules.map((r) => [
      r.name,
      r.priority,
      r.isActive ? 'Yes' : 'No',
      r.triggerType,
      (r.keywords || []).join(';'),
      r.replyType,
      r.triggerCount || 0,
      r.successCount || 0,
    ]);

    return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * Import rules from JSON
   */
  static importRules(jsonData) {
    try {
      const rules = JSON.parse(jsonData);

      if (!Array.isArray(rules)) {
        return {
          success: false,
          error: 'Invalid format: expected array of rules',
        };
      }

      return {
        success: true,
        rules,
        count: rules.length,
      };
    } catch (error) {
      return {
        success: false,
        error: `JSON parse error: ${error.message}`,
      };
    }
  }
}

module.exports = RuleEngineUtils;
