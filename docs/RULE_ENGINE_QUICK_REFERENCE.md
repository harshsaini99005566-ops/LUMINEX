# Rule Engine - Quick Reference Guide

## File Locations

```
Core Components:
- KeywordMatcher        → backend/src/engines/KeywordMatcher.js
- RuleEvaluator         → backend/src/engines/RuleEvaluator.js
- ReplyGenerator        → backend/src/engines/ReplyGenerator.js
- AutomationRuleEngine  → backend/src/engines/AutomationRuleEngine.js

Management:
- RuleManager           → backend/src/managers/RuleManager.js
- RuleEngineUtils       → backend/src/utils/RuleEngineUtils.js

Configuration:
- ruleEngineConfig      → backend/src/config/ruleEngineConfig.js
- automationRules       → backend/src/routes/automationRules.js

MongoDB:
- AutomationRule        → backend/src/models/AutomationRule.js

Tests:
- Test Suite            → tests/automationRuleEngine.test.js

Documentation:
- Full Docs             → docs/RULE_ENGINE_DOCUMENTATION.md
- Implementation        → docs/RULE_ENGINE_IMPLEMENTATION_GUIDE.md
- Summary               → docs/RULE_ENGINE_SUMMARY.md
```

## Module Imports

```javascript
// Core Engine
const KeywordMatcher = require('./engines/KeywordMatcher');
const RuleEvaluator = require('./engines/RuleEvaluator');
const ReplyGenerator = require('./engines/ReplyGenerator');
const AutomationRuleEngine = require('./engines/AutomationRuleEngine');

// Management
const RuleManager = require('./managers/RuleManager');
const RuleEngineUtils = require('./utils/RuleEngineUtils');

// Configuration
const { 
  initializeRuleEngine, 
  mountRuleRoutes 
} = require('./config/ruleEngineConfig');

// Models
const AutomationRule = require('./models/AutomationRule');
```

## API Endpoints Quick Reference

```
CRUD Operations
POST   /api/rules                      Create rule
GET    /api/rules                      List rules
GET    /api/rules/:ruleId              Get rule
PUT    /api/rules/:ruleId              Update rule
PATCH  /api/rules/:ruleId/toggle       Toggle rule
DELETE /api/rules/:ruleId              Delete rule

Processing
POST   /api/rules/process-message      Process message
POST   /api/rules/get-suggestions      Get suggestions
POST   /api/rules/batch-process        Batch process

Management
POST   /api/rules/validate             Validate rule
POST   /api/rules/bulk-update          Bulk update
GET    /api/rules/stats                Get stats
GET    /api/rules/cache-stats          Cache stats
DELETE /api/rules/cache/:accountId     Clear cache
```

## Common Operations

### Initialize Engine

```javascript
const { initializeRuleEngine, mountRuleRoutes } = 
  require('./config/ruleEngineConfig');

const { engine, manager } = await initializeRuleEngine();
mountRuleRoutes(app, engine, manager);
```

### Create Rule

```javascript
const rule = await manager.createRule(userId, accountId, {
  name: 'Rule Name',
  keywords: ['keyword1', 'keyword2'],
  matchType: 'contains',
  caseSensitive: false,
  replyType: 'predefined',
  predefinedReply: 'Response text',
  priority: 10,
  delaySeconds: 1,
  isActive: true
});
```

### Process Message

```javascript
const result = await engine.processMessage(accountId, messageText, {
  sender: { id: senderId, name: senderName },
  isReply: false
});

if (result.matched && result.reply) {
  await sendReply(result.reply.content);
}
```

### Load Rules

```javascript
const rules = await AutomationRule.find({ 
  account: accountId, 
  isActive: true 
});
await engine.loadRulesForAccount(accountId, rules);
```

### Get Statistics

```javascript
const stats = await manager.getRuleStats(accountId, userId);
console.log(stats.stats);
// { totalRules, activeRules, totalTriggers, successRate, ... }
```

## Matching Strategies

| Strategy | Example | Best For |
|----------|---------|----------|
| `exact` | Message must = "hello" | Exact commands |
| `contains` | Message contains "hello" | General keywords |
| `starts_with` | Message starts with "hello" | Commands, instructions |
| `partial_word` | "hello" as whole word | Word-based matching |
| `regex` | Pattern: `^hello\s+` | Complex patterns |

## Reply Types

| Type | Use Case | Config |
|------|----------|--------|
| `predefined` | Static responses | `predefinedReply` text |
| `ai` | Dynamic responses | `aiPrompt` + `aiTemperature` |
| `handoff` | Escalation | `handoffEmail` |

## Variable Substitution

```
{sender.name}       → Sender's name
{sender.username}   → Sender's username
{message}           → Original message
{date}              → Current date
{time}              → Current time
{datetime}          → Full datetime
```

Example:
```
predefinedReply: "Hi {sender.name}, thanks for your message on {date}!"
```

## Configuration Presets

```javascript
// Development (5 min cache, debug logging)
PRESETS.development

// Production (30 min cache, info logging)
PRESETS.production

// Testing (1 min cache, no cache)
PRESETS.testing
```

## Common Error Patterns

### Rule Not Triggering
```javascript
// Debug evaluation
const evaluation = RuleEvaluator.evaluateRule(rule, message);
console.log(evaluation); // Check 'triggered' and 'reason'
```

### Slow Message Processing
```javascript
// Check cache
const stats = engine.getCacheStats();
console.log(stats); // Look at rulesCount per account
```

### Memory Issues
```javascript
// Clear cache if needed
engine.clearCacheForAccount(accountId);
// or
engine.clearAllCache();
```

## Performance Tips

1. **Batch Processing**: Use `batchProcessMessages()` for multiple messages
2. **Rule Limit**: Keep active rules under 50 per account
3. **Cache**: Use 30-minute timeout in production
4. **Keywords**: Keep keyword lists under 20 per rule
5. **Priority**: Use 0-100 range, not negative

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test automationRuleEngine.test.js
```

## Validation

```javascript
// Validate rule before saving
const validation = manager.validateRuleData(ruleData);
if (!validation.valid) {
  console.error(validation.errors);
}
```

## Export/Import

```javascript
// Export rules
const json = RuleEngineUtils.exportRules(rules, 'json');
const csv = RuleEngineUtils.exportRules(rules, 'csv');

// Import rules
const result = RuleEngineUtils.importRules(jsonString);
```

## Debugging Tips

```javascript
// Check keyword matching
const match = KeywordMatcher.match(message, keywords, 'contains');
console.log(match); // { matched, score, matchedKeywords }

// Check rule evaluation
const eval = RuleEvaluator.evaluateRule(rule, message);
console.log(eval); // { triggered, score, evaluations }

// Check all matching rules
const matches = RuleEvaluator.evaluateMultipleRules(rules, message);
matches.forEach(m => console.log(m.rule.name, m.score));

// Check effectiveness
const score = RuleEngineUtils.calculateEffectivenessScore(rule);
console.log(`Effectiveness: ${score}%`);
```

## Integration Checklist

- [ ] Import and initialize engine
- [ ] Mount API routes
- [ ] Load rules for accounts
- [ ] Setup webhook message handler
- [ ] Integrate reply sending
- [ ] Setup logging
- [ ] Create default rules for new accounts
- [ ] Setup monitoring/alerts
- [ ] Write tests
- [ ] Deploy and monitor

## Support & Troubleshooting

**Documentation**: See `docs/RULE_ENGINE_DOCUMENTATION.md`

**Implementation**: See `docs/RULE_ENGINE_IMPLEMENTATION_GUIDE.md`

**Complete Summary**: See `docs/RULE_ENGINE_SUMMARY.md`

**Test Examples**: See `tests/automationRuleEngine.test.js`

## Database Queries

```javascript
// Get active rules for account
const rules = await AutomationRule.find({
  account: accountId,
  isActive: true
}).sort({ priority: -1 });

// Get rules by type
const keywordRules = await AutomationRule.find({
  account: accountId,
  triggerType: 'keyword'
});

// Get high-priority rules
const highPriority = await AutomationRule.find({
  account: accountId,
  priority: { $gte: 15 }
});

// Get recently triggered
const recent = await AutomationRule.find({
  account: accountId,
  lastTriggered: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
});
```

## Real-World Examples

### E-commerce Product Inquiry
```javascript
{
  name: 'Product Questions',
  keywords: ['price', 'cost', 'how much', 'available'],
  matchType: 'contains',
  replyType: 'ai',
  aiPrompt: 'Answer product questions helpfully',
  priority: 15,
  isActive: true
}
```

### Customer Support
```javascript
{
  name: 'Support Escalation',
  keywords: ['urgent', 'help', 'broken'],
  matchType: 'contains',
  replyType: 'handoff',
  handoffEmail: 'support@company.com',
  priority: 20,
  isActive: true
}
```

### Campaign Response
```javascript
{
  name: 'Campaign Engagement',
  hashtags: ['summer2024', 'sale'],
  replyType: 'predefined',
  predefinedReply: 'Thanks for joining! Use code SUMMER20 for 20% off',
  priority: 12,
  isActive: true
}
```

---

**Last Updated**: January 27, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
