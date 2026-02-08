/**
 * RuleManager - High-level rule CRUD and management
 * Handles database operations, validation, and notifications
 */

const logger = require('../../utils/logger');

class RuleManager {
  constructor(AutomationRuleModel, engine, eventEmitter = null) {
    this.Model = AutomationRuleModel;
    this.engine = engine;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Create new automation rule
   */
  async createRule(userId, accountId, ruleData) {
    try {
      // Validate rule data
      const validation = this.validateRuleData(ruleData);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      const rule = new this.Model({
        user: userId,
        account: accountId,
        ...ruleData,
      });

      const savedRule = await rule.save();

      // Update engine cache
      if (this.engine) {
        this.engine.updateRuleInCache(accountId, savedRule);
      }

      // Emit event
      this._emitEvent('rule:created', { accountId, rule: savedRule });

      logger.info(`Created rule ${savedRule._id} for account ${accountId}`);

      return {
        success: true,
        rule: savedRule,
      };
    } catch (error) {
      logger.error('Error creating rule', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get rule by ID
   */
  async getRule(ruleId, userId = null) {
    try {
      const query = { _id: ruleId };
      if (userId) {
        query.user = userId;
      }

      const rule = await this.Model.findOne(query);

      if (!rule) {
        return {
          success: false,
          error: 'Rule not found',
        };
      }

      return {
        success: true,
        rule,
      };
    } catch (error) {
      logger.error('Error getting rule', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all rules for account
   */
  async getRulesForAccount(accountId, userId = null, filters = {}) {
    try {
      const query = { account: accountId };
      if (userId) {
        query.user = userId;
      }

      // Apply filters
      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }
      if (filters.triggerType) {
        query.triggerType = filters.triggerType;
      }
      if (filters.replyType) {
        query.replyType = filters.replyType;
      }

      const rules = await this.Model.find(query).sort({ priority: -1 });

      return {
        success: true,
        rules,
        count: rules.length,
      };
    } catch (error) {
      logger.error('Error getting rules for account', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update rule
   */
  async updateRule(ruleId, updates, userId = null) {
    try {
      const query = { _id: ruleId };
      if (userId) {
        query.user = userId;
      }

      // Validate updates
      const validation = this.validateRuleData(updates);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      // Don't allow direct user/account changes
      delete updates.user;
      delete updates.account;

      const updatedRule = await this.Model.findOneAndUpdate(query, updates, {
        new: true,
        runValidators: true,
      });

      if (!updatedRule) {
        return {
          success: false,
          error: 'Rule not found',
        };
      }

      // Update engine cache
      if (this.engine) {
        this.engine.updateRuleInCache(updatedRule.account, updatedRule);
      }

      // Emit event
      this._emitEvent('rule:updated', {
        accountId: updatedRule.account,
        rule: updatedRule,
      });

      logger.info(`Updated rule ${ruleId}`);

      return {
        success: true,
        rule: updatedRule,
      };
    } catch (error) {
      logger.error('Error updating rule', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Enable/disable rule
   */
  async toggleRule(ruleId, isActive, userId = null) {
    try {
      const result = await this.updateRule(ruleId, { isActive }, userId);

      if (result.success) {
        logger.info(`Rule ${ruleId} ${isActive ? 'enabled' : 'disabled'}`);
      }

      return result;
    } catch (error) {
      logger.error('Error toggling rule', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete rule
   */
  async deleteRule(ruleId, userId = null) {
    try {
      const query = { _id: ruleId };
      if (userId) {
        query.user = userId;
      }

      const deletedRule = await this.Model.findOneAndDelete(query);

      if (!deletedRule) {
        return {
          success: false,
          error: 'Rule not found',
        };
      }

      // Remove from engine cache
      if (this.engine) {
        this.engine.removeRuleFromCache(
          deletedRule.account,
          deletedRule._id
        );
      }

      // Emit event
      this._emitEvent('rule:deleted', {
        accountId: deletedRule.account,
        ruleId: deletedRule._id,
      });

      logger.info(`Deleted rule ${ruleId}`);

      return {
        success: true,
        deletedId: deletedRule._id,
      };
    } catch (error) {
      logger.error('Error deleting rule', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Bulk update rules
   */
  async bulkUpdateRules(accountId, updates, userId = null) {
    try {
      const query = { account: accountId };
      if (userId) {
        query.user = userId;
      }

      const result = await this.Model.updateMany(query, updates);

      logger.info(`Updated ${result.modifiedCount} rules for account ${accountId}`);

      return {
        success: true,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      logger.error('Error in bulk update', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate rule data
   */
  validateRuleData(ruleData) {
    const errors = [];

    // Required fields
    if (!ruleData.name || ruleData.name.trim().length === 0) {
      errors.push('Rule name is required');
    }

    if (!ruleData.replyType) {
      errors.push('Reply type is required');
    }

    // Validate reply type configuration
    switch (ruleData.replyType) {
      case 'predefined':
        if (!ruleData.predefinedReply) {
          errors.push('Predefined reply text is required');
        }
        break;
      case 'ai':
        if (!ruleData.aiPrompt) {
          errors.push('AI prompt is required');
        }
        break;
      case 'handoff':
        if (!ruleData.handoffEmail) {
          errors.push('Handoff email is required');
        }
        break;
    }

    // Validate trigger configuration
    if (ruleData.triggerType === 'keyword') {
      if (!ruleData.keywords || ruleData.keywords.length === 0) {
        errors.push('At least one keyword is required');
      }
    }

    // Validate priority
    if (ruleData.priority !== undefined && ruleData.priority < 0) {
      errors.push('Priority must be non-negative');
    }

    // Validate delay
    if (ruleData.delaySeconds !== undefined && ruleData.delaySeconds < 0) {
      errors.push('Delay must be non-negative');
    }

    // Validate temperature
    if (ruleData.aiTemperature !== undefined) {
      if (ruleData.aiTemperature < 0 || ruleData.aiTemperature > 2) {
        errors.push('AI temperature must be between 0 and 2');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get rule statistics
   */
  async getRuleStats(accountId, userId = null) {
    try {
      const query = { account: accountId };
      if (userId) {
        query.user = userId;
      }

      const rules = await this.Model.find(query);

      const stats = {
        totalRules: rules.length,
        activeRules: rules.filter((r) => r.isActive).length,
        inactiveRules: rules.filter((r) => !r.isActive).length,
        byReplyType: {},
        byTriggerType: {},
        byPriority: {
          high: rules.filter((r) => r.priority >= 10).length,
          medium: rules.filter((r) => r.priority >= 5 && r.priority < 10).length,
          low: rules.filter((r) => r.priority < 5).length,
        },
        totalTriggers: rules.reduce((sum, r) => sum + (r.triggerCount || 0), 0),
        totalSuccesses: rules.reduce((sum, r) => sum + (r.successCount || 0), 0),
        totalFailures: rules.reduce(
          (sum, r) => sum + (r.failureCount || 0),
          0
        ),
      };

      // Count by reply type
      for (const rule of rules) {
        stats.byReplyType[rule.replyType] =
          (stats.byReplyType[rule.replyType] || 0) + 1;
        stats.byTriggerType[rule.triggerType] =
          (stats.byTriggerType[rule.triggerType] || 0) + 1;
      }

      return {
        success: true,
        stats,
      };
    } catch (error) {
      logger.error('Error getting rule stats', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Emit event for rule changes
   */
  _emitEvent(eventName, data) {
    if (this.eventEmitter) {
      this.eventEmitter.emit(eventName, data);
    }
  }
}

module.exports = RuleManager;
