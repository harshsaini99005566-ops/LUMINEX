# Rule-Based Automation Engine Documentation

## Overview

The Rule-Based Automation Engine is a production-grade system designed to process Instagram Direct Messages and trigger automated responses based on configurable rules. It provides intelligent keyword matching, priority-based rule execution, flexible reply generation, and comprehensive management capabilities.

## Architecture

### Core Components

```
├── AutomationRuleEngine (Main Orchestrator)
│   ├── KeywordMatcher (Pattern matching)
│   ├── RuleEvaluator (Rule evaluation logic)
│   ├── ReplyGenerator (Response generation)
│   └── RuleEngineUtils (Utilities)
│
├── RuleManager (Database operations)
├── MongoDB Schema (AutomationRule)
└── API Routes (RESTful endpoints)
```

## Components

### 1. KeywordMatcher

Advanced keyword matching with multiple strategies.

**Matching Strategies:**
- `exact` - Entire message must equal keyword
- `contains` - Keyword anywhere in message
- `starts_with` - Message begins with keyword
- `partial_word` - Keyword as complete word
- `regex` - Keyword as regex pattern

**Usage:**

```javascript
const KeywordMatcher = require('./engines/KeywordMatcher');

const result = KeywordMatcher.match(
  'Hello world',
  ['hello', 'test'],
  'contains',
  false // case-insensitive
);

// Returns:
// {
//   matched: true,
//   matchedKeywords: ['hello'],
//   score: 85.5,
//   matchType: 'contains'
// }
```

**Key Methods:**
- `match()` - Match message against keywords
- `findBestMatch()` - Find best match from multiple rules
- `extractKeywordsFromMessage()` - Extract hashtags, mentions, words

### 2. RuleEvaluator

Core rule evaluation and matching logic.

**Features:**
- Multi-criteria evaluation (keywords, hashtags, mentions)
- Priority sorting
- Execution readiness checks
- Rule metadata and statistics

**Usage:**

```javascript
const RuleEvaluator = require('./engines/RuleEvaluator');

const evaluation = RuleEvaluator.evaluateRule(rule, message, context);
// Returns: { triggered: boolean, score: number, evaluations: [...] }

const best = RuleEvaluator.getBestMatchingRule(rules, message);
// Returns: Best matching rule with highest priority and score

const readiness = RuleEvaluator.isRuleReadyForExecution(rule);
// Returns: { ready: boolean, checks: {...} }
```

**Evaluation Criteria:**
- Rule active status
- Keyword matching
- Hashtag requirements
- Mention requirements
- Reply-to-replies policy
- Per-user reply limits

### 3. ReplyGenerator

Generates responses with AI fallback capabilities.

**Reply Types:**
- `predefined` - Fixed template responses
- `ai` - AI-generated responses
- `handoff` - Route to support email
- `fallback` - Generic fallback response

**Features:**
- Variable substitution in templates
- AI temperature control
- Response delays with jitter
- Batch reply generation
- Automatic fallback chain

**Usage:**

```javascript
const ReplyGenerator = require('./engines/ReplyGenerator');

const generator = new ReplyGenerator(aiService);

const reply = await generator.generateReply(rule, {
  sender: { name: 'John', id: '123' },
  message: 'Hello',
  matchedKeywords: ['hello']
});

// Returns:
// {
//   type: 'predefined',
//   content: 'Hi John, thanks for reaching out!',
//   delay: 2.5,
//   ruleId: '...', 
//   metadata: {...}
// }
```

**Variable Substitution:**
- `{sender.name}` - Sender's name
- `{sender.username}` - Sender's username
- `{message}` - Original message
- `{date}` - Current date
- `{time}` - Current time
- `{datetime}` - Full datetime

### 4. AutomationRuleEngine

Main orchestration engine coordinating all components.

**Features:**
- Rule caching with timeout
- Message processing pipeline
- Batch processing
- Rule suggestions
- Cache management
- Performance statistics

**Usage:**

```javascript
const AutomationRuleEngine = require('./engines/AutomationRuleEngine');

const engine = new AutomationRuleEngine({
  aiService: aiServiceInstance,
  cacheTimeout: 5 * 60 * 1000 // 5 minutes
});

// Load rules for account
await engine.loadRulesForAccount(accountId, rulesArray);

// Process single message
const result = await engine.processMessage(accountId, message, context);
// Returns: { processed, matched, reply, matchedRule, ... }

// Batch process
const batchResult = await engine.batchProcessMessages(
  accountId,
  [msg1, msg2, msg3],
  context
);

// Get suggestions
const suggestions = await engine.getSuggestedRules(accountId, message, limit);

// Cache stats
const stats = engine.getCacheStats();
```

### 5. RuleManager

High-level database operations and management.

**CRUD Operations:**

```javascript
const RuleManager = require('./managers/RuleManager');

const manager = new RuleManager(AutomationRuleModel, engine, eventEmitter);

// Create rule
const created = await manager.createRule(userId, accountId, ruleData);

// Get rules
const rules = await manager.getRulesForAccount(accountId, userId, filters);

// Update rule
const updated = await manager.updateRule(ruleId, updates, userId);

// Toggle active status
const toggled = await manager.toggleRule(ruleId, isActive, userId);

// Delete rule
const deleted = await manager.deleteRule(ruleId, userId);

// Get statistics
const stats = await manager.getRuleStats(accountId, userId);
```

**Validation:**

```javascript
const validation = manager.validateRuleData(ruleData);
// Returns: { valid: boolean, errors: [...] }
```

### 6. RuleEngineUtils

Utility functions for rule management and analysis.

**Key Functions:**

```javascript
const RuleEngineUtils = require('./utils/RuleEngineUtils');

// Keyword sanitization
const clean = RuleEngineUtils.sanitizeKeywords(keywords);

// Effectiveness score
const score = RuleEngineUtils.calculateEffectivenessScore(rule);

// Conflict detection
const conflicts = RuleEngineUtils.detectConflicts(rules);

// Recommendations
const recommendations = RuleEngineUtils.getRecommendations(accountData);

// Export/Import
const json = RuleEngineUtils.exportRules(rules, 'json');
const csv = RuleEngineUtils.exportRules(rules, 'csv');

const imported = RuleEngineUtils.importRules(jsonString);
```

## MongoDB Schema

### AutomationRule

```javascript
{
  // Basic Info
  user: ObjectId,                    // User reference
  account: ObjectId,                 // Instagram account
  name: String,                      // Rule name
  description: String,               // Rule description
  
  // Control
  isActive: Boolean,                 // Enable/disable rule
  priority: Number,                  // Execution priority (higher = first)
  
  // Trigger Configuration
  triggerType: String,               // 'keyword', 'direct_message', 'comment', 'mention'
  keywords: [String],                // Keywords to match
  hashtags: [String],                // Hashtags to match
  mentions: Boolean,                 // Require mentions
  matchType: String,                 // 'exact', 'contains', 'starts_with'
  caseSensitive: Boolean,            // Case sensitivity
  
  // Reply Configuration
  replyType: String,                 // 'predefined', 'ai', 'handoff'
  predefinedReply: String,           // Template response
  useAI: Boolean,                    // AI fallback enabled
  aiPrompt: String,                  // AI generation prompt
  aiTemperature: Number,             // AI creativity (0-2)
  handoffEmail: String,              // Support email
  
  // Behavior
  delaySeconds: Number,              // Response delay
  doNotReplyToReplies: Boolean,      // Skip replies
  maxRepliesPerUser: Number,         // Reply limit per user
  
  // Statistics
  triggerCount: Number,              // Total triggers
  successCount: Number,              // Successful replies
  failureCount: Number,              // Failed replies
  lastTriggered: Date,               // Last trigger time
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
```javascript
{ user: 1, account: 1, isActive: 1 }
{ user: 1 }
```

## API Endpoints

### Rule CRUD

**Create Rule**
```
POST /api/rules
Body: { accountId, name, keywords, replyType, ... }
```

**Get Rules**
```
GET /api/rules?accountId=xxx&isActive=true&triggerType=keyword
```

**Get Specific Rule**
```
GET /api/rules/:ruleId
```

**Update Rule**
```
PUT /api/rules/:ruleId
Body: { updates }
```

**Toggle Rule**
```
PATCH /api/rules/:ruleId/toggle
Body: { isActive: boolean }
```

**Delete Rule**
```
DELETE /api/rules/:ruleId
```

### Processing

**Process Single Message**
```
POST /api/rules/process-message
Body: {
  accountId: String,
  message: String,
  context: { sender, isReply, ... }
}
```

**Get Suggestions**
```
POST /api/rules/get-suggestions
Body: { accountId, message, limit: 5 }
```

**Batch Process**
```
POST /api/rules/batch-process
Body: { accountId, messages: [...], context }
```

### Utilities

**Validate Rule**
```
POST /api/rules/validate
Body: { ruleData }
```

**Get Statistics**
```
GET /api/rules/stats?accountId=xxx
```

**Get Cache Stats**
```
GET /api/rules/cache-stats
```

**Bulk Update**
```
POST /api/rules/bulk-update
Body: { accountId, updates }
```

**Clear Cache**
```
DELETE /api/rules/cache/:accountId
```

## Usage Examples

### Basic Setup

```javascript
const express = require('express');
const AutomationRuleEngine = require('./engines/AutomationRuleEngine');
const RuleManager = require('./managers/RuleManager');
const AutomationRule = require('./models/AutomationRule');
const { createRuleRoutes } = require('./routes/automationRules');

const app = express();

// Initialize engine and manager
const engine = new AutomationRuleEngine();
const manager = new RuleManager(AutomationRule, engine);

// Mount routes
app.use('/api/rules', createRuleRoutes(manager, engine));

app.listen(3000);
```

### Processing Messages

```javascript
// Load rules for account
const rules = await AutomationRule.find({ account: accountId, isActive: true });
await engine.loadRulesForAccount(accountId, rules);

// Process incoming message
const result = await engine.processMessage(accountId, messageText, {
  sender: { id: senderId, name: senderName },
  isReply: false,
});

if (result.matched && result.reply) {
  // Send reply
  await instagram.sendMessage(senderId, result.reply.content);
  
  // Log delay if needed
  if (result.reply.delay > 0) {
    setTimeout(() => {
      // Send notification
    }, result.reply.delay * 1000);
  }
}
```

### Creating Rules

```javascript
// Create keyword-based rule
const rule = await manager.createRule(userId, accountId, {
  name: 'Welcome Message',
  keywords: ['hi', 'hello', 'hey'],
  matchType: 'contains',
  replyType: 'predefined',
  predefinedReply: 'Welcome! How can we help?',
  priority: 10,
  isActive: true,
});

// Create AI-based rule
const aiRule = await manager.createRule(userId, accountId, {
  name: 'Smart Support',
  keywords: ['help', 'issue', 'problem'],
  matchType: 'contains',
  replyType: 'ai',
  aiPrompt: 'Provide helpful support response',
  aiTemperature: 0.7,
  priority: 5,
  isActive: true,
});

// Create handoff rule
const handoffRule = await manager.createRule(userId, accountId, {
  name: 'Escalate to Support',
  keywords: ['urgent', 'complaint'],
  matchType: 'contains',
  replyType: 'handoff',
  handoffEmail: 'support@company.com',
  priority: 15,
  isActive: true,
});
```

### Rule Management

```javascript
// Get all rules for account
const rules = await manager.getRulesForAccount(accountId, userId);

// Filter by type
const keywords = await manager.getRulesForAccount(accountId, userId, {
  triggerType: 'keyword'
});

// Update rule
await manager.updateRule(ruleId, {
  priority: 20,
  predefinedReply: 'Updated response'
});

// Disable rule temporarily
await manager.toggleRule(ruleId, false);

// Get statistics
const stats = await manager.getRuleStats(accountId);
console.log(stats);
// {
//   totalRules: 5,
//   activeRules: 4,
//   byReplyType: { predefined: 3, ai: 1, handoff: 1 },
//   ...
// }

// Detect conflicts
const conflicts = RuleEngineUtils.detectConflicts(rules);
```

## Performance Considerations

### Caching

Rules are cached in memory with configurable timeout (default 5 minutes):

```javascript
const engine = new AutomationRuleEngine({
  cacheTimeout: 10 * 60 * 1000 // 10 minutes
});

// Manual cache management
engine.clearCacheForAccount(accountId);
engine.clearAllCache();

const stats = engine.getCacheStats();
// { accountsCached: 5, totalRulesCached: 48, cacheEntries: [...] }
```

### Database Queries

Optimized indexes for common queries:
- User + Account + Active status
- User only

### Batch Processing

Process multiple messages efficiently:

```javascript
const results = await engine.batchProcessMessages(
  accountId,
  [msg1, msg2, msg3, ...],
  context
);
```

## Best Practices

1. **Rule Priority**
   - Use 0-10 for low priority (fallback rules)
   - Use 10-20 for normal priority
   - Use 20+ for high priority (specific, time-sensitive)

2. **Keywords**
   - Keep keywords specific and relevant
   - Use `partial_word` mode for single keywords
   - Use `contains` for multi-word phrases
   - Use `regex` for complex patterns

3. **Reply Types**
   - Use `predefined` for common responses
   - Use `ai` for complex, context-dependent responses
   - Use `handoff` for issues needing human support
   - Enable `useAI` fallback for failsafe

4. **Rate Limiting**
   - Set `maxRepliesPerUser` to avoid spam
   - Use `delaySeconds` to simulate human behavior
   - Monitor `doNotReplyToReplies` setting

5. **Monitoring**
   - Check rule statistics regularly
   - Review low success-rate rules
   - Detect and resolve conflicts
   - Monitor cache hit rates

## Error Handling

All components include comprehensive error handling:

```javascript
try {
  const result = await engine.processMessage(accountId, message);
  if (!result.processed) {
    logger.warn('Message not processed', result.reason);
  }
} catch (error) {
  logger.error('Engine error', error);
}
```

## Extending the Engine

### Custom Matching Strategy

```javascript
class CustomMatcher extends KeywordMatcher {
  static customMatch(message, keywords) {
    // Custom logic
  }
}
```

### Custom AI Service

```javascript
const aiService = {
  async generateResponse({ prompt, temperature, context }) {
    // Custom AI integration
    return { text: response, model: 'custom', tokens: count };
  }
};

engine.setAIService(aiService);
```

## Troubleshooting

**Rule not triggering:**
- Verify rule is active
- Check keywords match message
- Review case sensitivity setting
- Check priority conflicts with higher-priority rules

**Reply not sent:**
- Verify replyType configuration
- Check AI service if using AI replies
- Review rule execution readiness
- Check rate limits and delays

**Performance issues:**
- Reduce cache timeout
- Implement query pagination
- Use batch processing
- Monitor rule count per account

## Testing

```bash
# Run full test suite
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test automationRuleEngine.test.js
```

## License

MIT
