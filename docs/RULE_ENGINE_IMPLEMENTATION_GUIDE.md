# Rule-Based Automation Engine - Implementation Guide

## Quick Start

### 1. Installation & Setup

```javascript
// backend/src/index.js or server.js
const express = require('express');
const AutomationRuleEngine = require('./engines/AutomationRuleEngine');
const RuleManager = require('./managers/RuleManager');
const AutomationRule = require('./models/AutomationRule');
const { createRuleRoutes } = require('./routes/automationRules');

const app = express();
app.use(express.json());

// Initialize engine (pass your AI service if available)
const engine = new AutomationRuleEngine({
  cacheTimeout: 5 * 60 * 1000 // 5 minutes
});

// Initialize manager
const manager = new RuleManager(AutomationRule, engine);

// Mount routes
app.use('/api/rules', createRuleRoutes(manager, engine));

app.listen(3000, () => console.log('Server ready'));
```

### 2. Loading Rules on Startup

```javascript
const mongoose = require('mongoose');
const AutomationRule = require('./models/AutomationRule');
const AutomationRuleEngine = require('./engines/AutomationRuleEngine');

async function initializeRuleEngine() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    const engine = new AutomationRuleEngine();

    // Load rules for each active account
    const accounts = await getActiveAccounts(); // Your function

    for (const account of accounts) {
      const rules = await AutomationRule.find({
        account: account._id,
        isActive: true
      }).sort({ priority: -1 });

      await engine.loadRulesForAccount(account._id, rules);
      console.log(`Loaded ${rules.length} rules for account ${account._id}`);
    }

    return engine;
  } catch (error) {
    console.error('Error initializing rule engine:', error);
    throw error;
  }
}
```

### 3. Processing Incoming Messages

```javascript
// In your Instagram webhook handler or message processor
const processIncomingMessage = async (accountId, senderId, messageText) => {
  try {
    // Process message through engine
    const result = await engine.processMessage(accountId, messageText, {
      sender: {
        id: senderId,
        name: senderName,
        username: senderUsername
      },
      isReply: false,
      conversationId: conversationId
    });

    if (result.matched && result.reply) {
      // Send the automated reply
      await sendDMReply(accountId, senderId, result.reply.content);

      // Apply delay if configured
      if (result.reply.delay > 0) {
        await sleep(result.reply.delay * 1000);
      }

      // Log the interaction
      await logRuleExecution({
        ruleId: result.matchedRule.id,
        senderId,
        accountId,
        messageText,
        replyContent: result.reply.content,
        timestamp: new Date()
      });

      return { success: true, reply: result.reply };
    }

    return { success: false, reason: 'No matching rule' };
  } catch (error) {
    console.error('Error processing message:', error);
    return { success: false, error: error.message };
  }
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

## Rule Creation Examples

### Example 1: Simple Welcome Message

```javascript
const welcomeRule = {
  name: 'Welcome New Messages',
  keywords: ['hi', 'hello', 'hey', 'greetings'],
  matchType: 'contains',
  caseSensitive: false,
  replyType: 'predefined',
  predefinedReply: '👋 Welcome! Thanks for reaching out. How can we help you today?',
  priority: 10,
  delaySeconds: 1,
  isActive: true,
  description: 'Automatic welcome message for new conversations'
};

const created = await manager.createRule(userId, accountId, welcomeRule);
```

### Example 2: Product Inquiry with AI

```javascript
const productRule = {
  name: 'Product Inquiry Response',
  keywords: ['product', 'how much', 'price', 'cost', 'available'],
  matchType: 'contains',
  caseSensitive: false,
  triggerType: 'keyword',
  replyType: 'ai',
  aiPrompt: `You are a helpful sales assistant. Answer the customer's question about our products. 
             Be friendly, concise, and offer to help further.`,
  aiTemperature: 0.8,
  useAI: true, // Fallback to AI if needed
  priority: 15,
  delaySeconds: 2,
  isActive: true,
  description: 'AI-powered product inquiry responses'
};

const created = await manager.createRule(userId, accountId, productRule);
```

### Example 3: Complex Rule with Multiple Criteria

```javascript
const supportRule = {
  name: 'Urgent Support Escalation',
  keywords: ['urgent', 'help', 'problem', 'issue', 'broken', 'not working'],
  hashtags: ['urgent', 'support'],
  matchType: 'contains',
  caseSensitive: false,
  triggerType: 'keyword',
  replyType: 'handoff',
  handoffEmail: 'support@company.com',
  predefinedReply: 'I understand this is urgent. I\'m escalating your message to our support team. They\'ll get back to you shortly.',
  priority: 20, // Very high priority
  doNotReplyToReplies: false,
  maxRepliesPerUser: 3, // Max 3 escalations per user
  delaySeconds: 0,
  isActive: true,
  description: 'Route urgent issues to support team'
};

const created = await manager.createRule(userId, accountId, supportRule);
```

### Example 4: Hashtag-Based Rule

```javascript
const campaignRule = {
  name: 'Campaign Promotion',
  hashtags: ['summer2024', 'sale'],
  triggerType: 'keyword',
  replyType: 'predefined',
  predefinedReply: '🎉 Thanks for being part of our Summer 2024 campaign! ' +
                   'Check out our latest collection with exclusive summer deals. ' +
                   'Use code SUMMER20 for 20% off! {emoji:gift}',
  priority: 12,
  delaySeconds: 1,
  isActive: true,
  description: 'Auto-reply to campaign-related messages'
};

const created = await manager.createRule(userId, accountId, campaignRule);
```

### Example 5: Mention-Based Rule

```javascript
const mentionRule = {
  name: 'Mention Response',
  mentions: true,
  triggerType: 'keyword',
  replyType: 'predefined',
  predefinedReply: 'Thanks for mentioning us! {sender.name}, we\'d love to hear more about what you need.',
  priority: 8,
  delaySeconds: 0.5,
  isActive: true,
  description: 'Respond when account is mentioned'
};

const created = await manager.createRule(userId, accountId, mentionRule);
```

## API Usage Examples

### Creating Rules via API

```bash
# Create a welcome rule
curl -X POST http://localhost:3000/api/rules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "accountId": "your-account-id",
    "name": "Welcome Message",
    "keywords": ["hi", "hello"],
    "matchType": "contains",
    "replyType": "predefined",
    "predefinedReply": "Welcome! How can we help?",
    "priority": 10,
    "isActive": true
  }'
```

### Getting Rules

```bash
# Get all active rules for account
curl -X GET "http://localhost:3000/api/rules?accountId=xxx&isActive=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get only keyword-triggered rules
curl -X GET "http://localhost:3000/api/rules?accountId=xxx&triggerType=keyword" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Processing Messages via API

```bash
# Test message processing
curl -X POST http://localhost:3000/api/rules/process-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "accountId": "xxx",
    "message": "Hi, I need help with my order",
    "context": {
      "sender": {
        "id": "12345",
        "name": "John Doe",
        "username": "johndoe"
      },
      "isReply": false
    }
  }'
```

### Getting Suggestions for a Message

```bash
curl -X POST http://localhost:3000/api/rules/get-suggestions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "accountId": "xxx",
    "message": "What products do you have?",
    "limit": 5
  }'
```

### Updating Rules

```bash
# Update a rule
curl -X PUT http://localhost:3000/api/rules/rule-id \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "priority": 15,
    "predefinedReply": "Updated response text",
    "keywords": ["hi", "hello", "hey"]
  }'

# Toggle rule on/off
curl -X PATCH http://localhost:3000/api/rules/rule-id/toggle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"isActive": false}'
```

### Getting Statistics

```bash
# Get rule statistics
curl -X GET "http://localhost:3000/api/rules/stats?accountId=xxx" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get cache statistics
curl -X GET http://localhost:3000/api/rules/cache-stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Advanced Patterns

### Rule Chaining

```javascript
// Create rules that work together
const rules = [
  {
    name: 'Detect Issue',
    keywords: ['issue', 'problem', 'help'],
    priority: 20,
    replyType: 'predefined',
    predefinedReply: 'I understand. Let me help you. Can you provide more details?'
  },
  {
    name: 'Escalate if Urgent',
    keywords: ['urgent', 'immediately', 'asap'],
    priority: 25, // Higher priority, will match first
    replyType: 'handoff',
    handoffEmail: 'support@company.com'
  },
  {
    name: 'Generic Fallback',
    keywords: ['thanks', 'ok', 'bye'],
    priority: 5, // Lower priority fallback
    replyType: 'predefined',
    predefinedReply: 'Thanks for chatting! Have a great day!'
  }
];

for (const ruleData of rules) {
  await manager.createRule(userId, accountId, ruleData);
}
```

### Conditional Rules with Context

```javascript
// Process message with rich context
const result = await engine.processMessage(accountId, message, {
  sender: {
    id: senderId,
    name: senderName,
    username: senderUsername,
    isFollower: checkIfFollower(senderId),
    previousInteractions: getInteractionCount(senderId)
  },
  isReply: isReplyToOurMessage,
  conversationId: convId,
  timestamp: new Date(),
  messageMetadata: {
    hasMedia: message.includes('image') || message.includes('video'),
    language: detectLanguage(message)
  }
});
```

### Monitoring and Analytics

```javascript
// Get comprehensive statistics
const stats = await manager.getRuleStats(accountId, userId);

console.log('Rule Statistics:');
console.log(`Total Rules: ${stats.totalRules}`);
console.log(`Active: ${stats.activeRules}`);
console.log(`Inactive: ${stats.inactiveRules}`);
console.log(`Total Triggers: ${stats.totalTriggers}`);
console.log(`Success Rate: ${((stats.totalSuccesses / stats.totalTriggers) * 100).toFixed(2)}%`);
console.log('By Reply Type:', stats.byReplyType);
console.log('By Priority:', stats.byPriority);

// Detect potential issues
const RuleEngineUtils = require('./utils/RuleEngineUtils');
const conflicts = RuleEngineUtils.detectConflicts(stats.rules);
const recommendations = RuleEngineUtils.getRecommendations({
  rules: stats.rules,
  messageVolume: stats.totalTriggers
});

console.log('Conflicts:', conflicts);
console.log('Recommendations:', recommendations);
```

### Backup and Export

```javascript
// Export all rules for backup
const RuleEngineUtils = require('./utils/RuleEngineUtils');

const rules = await manager.getRulesForAccount(accountId, userId);

// Export as JSON
const jsonBackup = RuleEngineUtils.exportRules(rules.rules, 'json');
fs.writeFileSync(`backup_${accountId}.json`, jsonBackup);

// Export as CSV
const csvBackup = RuleEngineUtils.exportRules(rules.rules, 'csv');
fs.writeFileSync(`backup_${accountId}.csv`, csvBackup);

// Import rules
const jsonData = fs.readFileSync('backup.json', 'utf8');
const importResult = RuleEngineUtils.importRules(jsonData);

if (importResult.success) {
  for (const ruleData of importResult.rules) {
    await manager.createRule(userId, accountId, ruleData);
  }
}
```

## Deployment Considerations

### Environment Variables

```env
# .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
RULE_CACHE_TIMEOUT=300000
MAX_RULES_PER_ACCOUNT=100
ENABLE_AI_FALLBACK=true
AI_SERVICE_API_KEY=your_api_key
```

### Logging

```javascript
// Comprehensive rule execution logging
const logRuleExecution = async (data) => {
  const log = {
    timestamp: new Date(),
    accountId: data.accountId,
    ruleId: data.ruleId,
    senderId: data.senderId,
    messageLength: data.messageText.length,
    replyType: data.replyType,
    responseTime: data.responseTime,
    success: data.success
  };

  await RuleExecutionLog.create(log);

  // Alert if execution time is high
  if (data.responseTime > 2000) {
    console.warn('Slow rule execution:', data.ruleId, data.responseTime);
  }
};
```

### Performance Optimization

```javascript
// Batch operations for high-volume scenarios
const processBatchMessages = async (accountId, messages) => {
  const batchSize = 10;
  const results = [];

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const batchResults = await engine.batchProcessMessages(accountId, batch);
    results.push(...batchResults.results);

    // Small delay between batches
    await sleep(100);
  }

  return results;
};
```

## Testing

```javascript
// Unit test example
const { KeywordMatcher } = require('../src/engines/KeywordMatcher');

describe('KeywordMatcher', () => {
  it('should match keywords case-insensitively', () => {
    const result = KeywordMatcher.match('Hello', ['hello'], 'contains', false);
    expect(result.matched).toBe(true);
  });

  it('should calculate match scores', () => {
    const result = KeywordMatcher.match(
      'hello world test',
      ['hello', 'world', 'test'],
      'contains'
    );
    expect(result.score).toBeGreaterThan(0);
  });
});
```

## Troubleshooting

### Rules Not Triggering

```javascript
// Debug rule matching
const RuleEvaluator = require('./engines/RuleEvaluator');

const rule = await manager.getRule(ruleId);
const evaluation = RuleEvaluator.evaluateRule(rule.rule, testMessage);

console.log('Evaluation Result:', evaluation);
console.log('Triggered:', evaluation.triggered);
console.log('Evaluations:', evaluation.evaluations);
```

### Performance Issues

```javascript
// Check cache stats
const stats = engine.getCacheStats();
console.log('Cache Stats:', stats);

// Clear and reload if needed
engine.clearCacheForAccount(accountId);
const rules = await manager.getRulesForAccount(accountId);
await engine.loadRulesForAccount(accountId, rules.rules);
```

This completes the production-ready rule-based automation engine!
