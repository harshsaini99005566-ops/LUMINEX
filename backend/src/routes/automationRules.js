/**
 * Automation Rule API Routes
 * RESTful endpoints for rule CRUD, execution, and management
 */

const express = require('express');
const logger = require('../../utils/logger');

/**
 * Middleware to attach rule manager to request
 */
const attachRuleManager = (ruleManager) => {
  return (req, res, next) => {
    req.ruleManager = ruleManager;
    next();
  };
};

/**
 * Middleware to attach engine to request
 */
const attachEngine = (engine) => {
  return (req, res, next) => {
    req.automationEngine = engine;
    next();
  };
};

/**
 * Factory function to create rule routes
 */
function createRuleRoutes(ruleManager, automationEngine) {
  const router = express.Router();

  // Middleware
  router.use(attachRuleManager(ruleManager));
  router.use(attachEngine(automationEngine));

  // ==================== RULE CRUD ENDPOINTS ====================

  /**
   * POST /api/rules
   * Create new automation rule
   */
  router.post('/', async (req, res) => {
    try {
      const { accountId, ...ruleData } = req.body;
      const userId = req.user?.id;

      if (!accountId) {
        return res.status(400).json({ error: 'accountId is required' });
      }

      const result = await req.ruleManager.createRule(userId, accountId, ruleData);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json({
        success: true,
        message: 'Rule created successfully',
        rule: result.rule,
      });
    } catch (error) {
      logger.error('Error creating rule', error);
      res.status(500).json({ error: 'Failed to create rule' });
    }
  });

  /**
   * GET /api/rules
   * Get all rules for an account
   */
  router.get('/', async (req, res) => {
    try {
      const { accountId } = req.query;
      const userId = req.user?.id;

      if (!accountId) {
        return res.status(400).json({ error: 'accountId is required' });
      }

      const filters = {
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
        triggerType: req.query.triggerType,
        replyType: req.query.replyType,
      };

      const result = await req.ruleManager.getRulesForAccount(
        accountId,
        userId,
        filters
      );

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        success: true,
        rules: result.rules,
        count: result.count,
      });
    } catch (error) {
      logger.error('Error getting rules', error);
      res.status(500).json({ error: 'Failed to fetch rules' });
    }
  });

  /**
   * GET /api/rules/:ruleId
   * Get specific rule
   */
  router.get('/:ruleId', async (req, res) => {
    try {
      const userId = req.user?.id;
      const result = await req.ruleManager.getRule(req.params.ruleId, userId);

      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      res.json({
        success: true,
        rule: result.rule,
      });
    } catch (error) {
      logger.error('Error getting rule', error);
      res.status(500).json({ error: 'Failed to fetch rule' });
    }
  });

  /**
   * PUT /api/rules/:ruleId
   * Update rule
   */
  router.put('/:ruleId', async (req, res) => {
    try {
      const userId = req.user?.id;
      const result = await req.ruleManager.updateRule(
        req.params.ruleId,
        req.body,
        userId
      );

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'Rule updated successfully',
        rule: result.rule,
      });
    } catch (error) {
      logger.error('Error updating rule', error);
      res.status(500).json({ error: 'Failed to update rule' });
    }
  });

  /**
   * PATCH /api/rules/:ruleId/toggle
   * Enable/disable rule
   */
  router.patch('/:ruleId/toggle', async (req, res) => {
    try {
      const { isActive } = req.body;
      const userId = req.user?.id;

      if (isActive === undefined) {
        return res.status(400).json({ error: 'isActive is required' });
      }

      const result = await req.ruleManager.toggleRule(
        req.params.ruleId,
        isActive,
        userId
      );

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        message: `Rule ${isActive ? 'enabled' : 'disabled'} successfully`,
        rule: result.rule,
      });
    } catch (error) {
      logger.error('Error toggling rule', error);
      res.status(500).json({ error: 'Failed to toggle rule' });
    }
  });

  /**
   * DELETE /api/rules/:ruleId
   * Delete rule
   */
  router.delete('/:ruleId', async (req, res) => {
    try {
      const userId = req.user?.id;
      const result = await req.ruleManager.deleteRule(req.params.ruleId, userId);

      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'Rule deleted successfully',
        deletedId: result.deletedId,
      });
    } catch (error) {
      logger.error('Error deleting rule', error);
      res.status(500).json({ error: 'Failed to delete rule' });
    }
  });

  // ==================== PROCESSING ENDPOINTS ====================

  /**
   * POST /api/rules/process-message
   * Process message against rules
   */
  router.post('/process-message', async (req, res) => {
    try {
      const { accountId, message, context } = req.body;

      if (!accountId || !message) {
        return res.status(400).json({ error: 'accountId and message are required' });
      }

      const result = await req.automationEngine.processMessage(
        accountId,
        message,
        context || {}
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logger.error('Error processing message', error);
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  /**
   * POST /api/rules/get-suggestions
   * Get rule suggestions for a message
   */
  router.post('/get-suggestions', async (req, res) => {
    try {
      const { accountId, message, limit } = req.body;

      if (!accountId || !message) {
        return res.status(400).json({ error: 'accountId and message are required' });
      }

      const result = await req.automationEngine.getSuggestedRules(
        accountId,
        message,
        limit || 5
      );

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json(result);
    } catch (error) {
      logger.error('Error getting suggestions', error);
      res.status(500).json({ error: 'Failed to get suggestions' });
    }
  });

  /**
   * POST /api/rules/batch-process
   * Process multiple messages
   */
  router.post('/batch-process', async (req, res) => {
    try {
      const { accountId, messages, context } = req.body;

      if (!accountId || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'accountId and messages array are required' });
      }

      const result = await req.automationEngine.batchProcessMessages(
        accountId,
        messages,
        context || {}
      );

      res.json(result);
    } catch (error) {
      logger.error('Error in batch processing', error);
      res.status(500).json({ error: 'Failed to process messages' });
    }
  });

  // ==================== UTILITY ENDPOINTS ====================

  /**
   * GET /api/rules/stats
   * Get rule statistics
   */
  router.get('/stats', async (req, res) => {
    try {
      const { accountId } = req.query;
      const userId = req.user?.id;

      if (!accountId) {
        return res.status(400).json({ error: 'accountId is required' });
      }

      const result = await req.ruleManager.getRuleStats(accountId, userId);

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        success: true,
        stats: result.stats,
      });
    } catch (error) {
      logger.error('Error getting stats', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  });

  /**
   * GET /api/rules/cache-stats
   * Get engine cache statistics
   */
  router.get('/cache-stats', (req, res) => {
    try {
      const cacheStats = req.automationEngine.getCacheStats();

      res.json({
        success: true,
        cache: cacheStats,
      });
    } catch (error) {
      logger.error('Error getting cache stats', error);
      res.status(500).json({ error: 'Failed to get cache statistics' });
    }
  });

  /**
   * POST /api/rules/validate
   * Validate rule data without creating
   */
  router.post('/validate', (req, res) => {
    try {
      const validation = req.ruleManager.validateRuleData(req.body);

      res.json({
        valid: validation.valid,
        errors: validation.errors,
      });
    } catch (error) {
      logger.error('Error validating rule', error);
      res.status(500).json({ error: 'Failed to validate rule' });
    }
  });

  /**
   * POST /api/rules/bulk-update
   * Update multiple rules
   */
  router.post('/bulk-update', async (req, res) => {
    try {
      const { accountId, updates } = req.body;
      const userId = req.user?.id;

      if (!accountId) {
        return res.status(400).json({ error: 'accountId is required' });
      }

      const result = await req.ruleManager.bulkUpdateRules(
        accountId,
        updates,
        userId
      );

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        success: true,
        message: `Updated ${result.modifiedCount} rules`,
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      logger.error('Error in bulk update', error);
      res.status(500).json({ error: 'Failed to update rules' });
    }
  });

  /**
   * DELETE /api/rules/cache/:accountId
   * Clear cache for account
   */
  router.delete('/cache/:accountId', (req, res) => {
    try {
      req.automationEngine.clearCacheForAccount(req.params.accountId);

      res.json({
        success: true,
        message: `Cache cleared for account ${req.params.accountId}`,
      });
    } catch (error) {
      logger.error('Error clearing cache', error);
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  });

  return router;
}

module.exports = {
  createRuleRoutes,
  attachRuleManager,
  attachEngine,
};
