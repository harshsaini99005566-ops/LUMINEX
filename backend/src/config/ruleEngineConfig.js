/**
 * Rule Engine Configuration & Integration Module
 * Central configuration and initialization for the automation engine
 */

const AutomationRuleEngine = require('../engines/AutomationRuleEngine');
const RuleManager = require('../managers/RuleManager');
const AutomationRule = require('../models/AutomationRule');
const { createRuleRoutes } = require('../routes/automationRules');
const logger = require('./logger');

/**
 * Configuration presets
 */
const PRESETS = {
  development: {
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    enableCache: true,
    logLevel: 'debug',
    maxRulesPerAccount: 1000,
  },
  production: {
    cacheTimeout: 30 * 60 * 1000, // 30 minutes
    enableCache: true,
    logLevel: 'info',
    maxRulesPerAccount: 500,
  },
  testing: {
    cacheTimeout: 1 * 60 * 1000, // 1 minute
    enableCache: false,
    logLevel: 'warn',
    maxRulesPerAccount: 100,
  },
};

/**
 * Initialize rule engine with configuration
 */
async function initializeRuleEngine(options = {}) {
  try {
    const config = {
      ...PRESETS[process.env.NODE_ENV || 'development'],
      ...options,
    };

    logger.info('Initializing Rule Engine with config:', {
      env: process.env.NODE_ENV,
      cacheTimeout: config.cacheTimeout,
      enableCache: config.enableCache,
    });

    // Create engine instance
    const engine = new AutomationRuleEngine({
      cacheTimeout: config.cacheTimeout,
      aiService: options.aiService || null,
    });

    // Create manager instance
    const manager = new RuleManager(
      AutomationRule,
      engine,
      options.eventEmitter || null
    );

    // Store in global if needed
    global.ruleEngine = engine;
    global.ruleManager = manager;

    logger.info('Rule Engine initialized successfully');

    return {
      engine,
      manager,
      config,
    };
  } catch (error) {
    logger.error('Failed to initialize Rule Engine', error);
    throw error;
  }
}

/**
 * Mount rule routes to Express app
 */
function mountRuleRoutes(app, engine, manager, basePath = '/api/rules') {
  try {
    const routes = createRuleRoutes(manager, engine);
    app.use(basePath, routes);

    logger.info(`Rule routes mounted at ${basePath}`);

    return routes;
  } catch (error) {
    logger.error('Failed to mount rule routes', error);
    throw error;
  }
}

/**
 * Load all rules for active accounts
 */
async function preloadRulesForAllAccounts(engine) {
  try {
    const InstagramAccount = require('../models/InstagramAccount');

    // Get all active accounts
    const accounts = await InstagramAccount.find({ isActive: true });

    logger.info(`Preloading rules for ${accounts.length} accounts`);

    let totalRulesLoaded = 0;

    for (const account of accounts) {
      const rules = await AutomationRule.find({
        account: account._id,
        isActive: true,
      }).lean();

      if (rules.length > 0) {
        await engine.loadRulesForAccount(account._id, rules);
        totalRulesLoaded += rules.length;
      }
    }

    logger.info(`Preloaded ${totalRulesLoaded} rules for ${accounts.length} accounts`);

    return {
      accountsLoaded: accounts.length,
      rulesLoaded: totalRulesLoaded,
    };
  } catch (error) {
    logger.error('Error preloading rules', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Setup WebSocket for real-time rule updates
 */
function setupRealtimeUpdates(io, engine, manager) {
  try {
    // Listen for rule changes
    if (manager.eventEmitter) {
      manager.eventEmitter.on('rule:created', (data) => {
        io.to(`account:${data.accountId}`).emit('rule:created', data);
        engine.updateRuleInCache(data.accountId, data.rule);
      });

      manager.eventEmitter.on('rule:updated', (data) => {
        io.to(`account:${data.accountId}`).emit('rule:updated', data);
        engine.updateRuleInCache(data.accountId, data.rule);
      });

      manager.eventEmitter.on('rule:deleted', (data) => {
        io.to(`account:${data.accountId}`).emit('rule:deleted', data);
        engine.removeRuleFromCache(data.accountId, data.ruleId);
      });
    }

    // Handle user connections
    io.on('connection', (socket) => {
      logger.debug('WebSocket client connected:', socket.id);

      socket.on('subscribe:account', (accountId) => {
        socket.join(`account:${accountId}`);
        logger.debug(`Client subscribed to account:${accountId}`);
      });

      socket.on('disconnect', () => {
        logger.debug('WebSocket client disconnected:', socket.id);
      });
    });

    logger.info('Real-time updates configured');
  } catch (error) {
    logger.error('Error setting up real-time updates', error);
  }
}

/**
 * Setup scheduled rule maintenance tasks
 */
function setupMaintenanceTasks(engine, manager) {
  const cron = require('node-cron');

  // Clear stale cache every hour
  cron.schedule('0 * * * *', () => {
    try {
      const stats = engine.getCacheStats();
      logger.info('Cache maintenance - Current stats:', stats);

      // Clear cache older than 2 hours
      // This would need to be implemented in the engine
    } catch (error) {
      logger.error('Cache maintenance error:', error);
    }
  });

  // Audit rule effectiveness daily
  cron.schedule('0 2 * * *', async () => {
    try {
      const InstagramAccount = require('../models/InstagramAccount');
      const accounts = await InstagramAccount.find({ isActive: true });

      for (const account of accounts) {
        const stats = await manager.getRuleStats(account._id);
        logger.info(`Daily audit for account ${account._id}:`, stats);

        // Alert if success rate is low
        if (stats.stats.totalTriggers > 100) {
          const successRate =
            (stats.stats.totalSuccesses / stats.stats.totalTriggers) * 100;
          if (successRate < 50) {
            logger.warn(
              `Low success rate (${successRate.toFixed(2)}%) for account ${account._id}`
            );
          }
        }
      }
    } catch (error) {
      logger.error('Rule audit error:', error);
    }
  });

  logger.info('Maintenance tasks scheduled');
}

/**
 * Create default rules for new accounts
 */
async function createDefaultRules(accountId, userId, managerParam) {
  try {
    // Prefer an explicit manager, fall back to the globally-initialized manager
    const manager = managerParam || global.ruleManager;
    if (!manager) {
      throw new Error('Rule manager is not initialized. Call initializeRuleEngine first or pass a manager to createDefaultRules.');
    }

    const defaultRules = [
      {
        name: 'Welcome Message',
        description: 'Automatic welcome for new conversations',
        keywords: ['hi', 'hello', 'hey', 'greetings'],
        matchType: 'contains',
        caseSensitive: false,
        replyType: 'predefined',
        predefinedReply:
          '👋 Welcome! Thanks for reaching out. How can we help you?',
        priority: 10,
        delaySeconds: 1,
        isActive: true,
        triggerType: 'keyword',
      },
      {
        name: 'Fallback Response',
        description: 'Generic response for unmatched messages',
        keywords: ['help', 'support', 'question'],
        matchType: 'contains',
        caseSensitive: false,
        replyType: 'predefined',
        predefinedReply:
          'Thanks for reaching out! We appreciate your message and will respond shortly.',
        priority: 5,
        delaySeconds: 0,
        isActive: true,
        triggerType: 'keyword',
      },
    ];

    const created = [];

    for (const ruleData of defaultRules) {
      const result = await manager.createRule(userId, accountId, ruleData);
      if (result.success) {
        created.push(result.rule);
      }
    }

    logger.info(`Created ${created.length} default rules for account ${accountId}`);

    return {
      success: true,
      rulesCreated: created.length,
      rules: created,
    };
  } catch (error) {
    logger.error('Error creating default rules', error);
    return {
      success: false,
      error: error.message,
    };
  }
} 

/**
 * Export configuration for client-side usage
 */
function getClientConfig() {
  return {
    matchTypes: ['exact', 'contains', 'starts_with', 'partial_word', 'regex'],
    triggerTypes: ['keyword', 'direct_message', 'comment', 'mention'],
    replyTypes: ['predefined', 'ai', 'handoff'],
    maxKeywords: 20,
    maxHashtags: 10,
    maxRuleNameLength: 100,
    maxReplyLength: 2000,
    maxDelaySeconds: 3600,
    priorities: {
      low: { min: 0, max: 5 },
      medium: { min: 5, max: 15 },
      high: { min: 15, max: 100 },
    },
  };
}

/**
 * Validate rule consistency across system
 */
async function validateRuleConsistency(accountId) {
  try {
    const rules = await AutomationRule.find({ account: accountId });
    const issues = [];

    // Check for duplicate rule names
    const nameMap = {};
    for (const rule of rules) {
      if (nameMap[rule.name]) {
        issues.push({
          type: 'duplicate_name',
          message: `Duplicate rule name: "${rule.name}"`,
          ruleIds: [nameMap[rule.name], rule._id],
        });
      }
      nameMap[rule.name] = rule._id;
    }

    // Check for orphaned keywords
    for (const rule of rules) {
      if (
        rule.triggerType === 'keyword' &&
        (!rule.keywords || rule.keywords.length === 0)
      ) {
        issues.push({
          type: 'missing_keywords',
          message: `Rule "${rule.name}" has no keywords`,
          ruleId: rule._id,
        });
      }
    }

    // Check for incomplete replies
    for (const rule of rules) {
      if (rule.replyType === 'predefined' && !rule.predefinedReply) {
        issues.push({
          type: 'missing_reply',
          message: `Rule "${rule.name}" has no predefined reply`,
          ruleId: rule._id,
        });
      }
    }

    return {
      accountId,
      totalRules: rules.length,
      issuesFound: issues.length,
      issues,
      isConsistent: issues.length === 0,
    };
  } catch (error) {
    logger.error('Error validating rules', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Migration utility for updating rules from old format
 */
async function migrateRules(accountId) {
  try {
    const rules = await AutomationRule.find({ account: accountId });
    let migrated = 0;

    for (const rule of rules) {
      let updated = false;

      // Example migration: ensure lowercase keywords
      if (rule.keywords && rule.keywords.length > 0) {
        const lowercase = rule.keywords.map((k) => k.toLowerCase());
        if (lowercase.some((k, i) => k !== rule.keywords[i])) {
          rule.keywords = lowercase;
          updated = true;
        }
      }

      if (updated) {
        await rule.save();
        migrated++;
      }
    }

    logger.info(`Migrated ${migrated} rules for account ${accountId}`);

    return {
      success: true,
      migrated,
    };
  } catch (error) {
    logger.error('Error migrating rules', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  PRESETS,
  initializeRuleEngine,
  mountRuleRoutes,
  preloadRulesForAllAccounts,
  setupRealtimeUpdates,
  setupMaintenanceTasks,
  createDefaultRules,
  getClientConfig,
  validateRuleConsistency,
  migrateRules,
};
