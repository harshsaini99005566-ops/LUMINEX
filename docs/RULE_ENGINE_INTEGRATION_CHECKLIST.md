# Rule-Based Automation Engine - Integration Checklist

## Pre-Integration Setup

### ✅ Verify Dependencies
- [x] MongoDB connected
- [x] Express server running
- [x] Node.js v18+
- [x] All npm packages installed

### ✅ File Structure Verified
- [x] Engine files in `backend/src/engines/`
- [x] Manager files in `backend/src/managers/`
- [x] Routes in `backend/src/routes/`
- [x] Config in `backend/src/config/`
- [x] Tests in `tests/`
- [x] Docs in `docs/`

## Integration Steps

### Step 1: Import and Initialize ✅

**File**: `backend/src/server.js` (or main entry point)

```javascript
const {
  initializeRuleEngine,
  mountRuleRoutes,
  preloadRulesForAllAccounts
} = require('./config/ruleEngineConfig');

// Initialize engine
const { engine, manager } = await initializeRuleEngine({
  cacheTimeout: 30 * 60 * 1000, // Production: 30 min
  aiService: yourAIService // Optional
});

// Mount API routes
mountRuleRoutes(app, engine, manager, '/api/rules');

// Preload rules
await preloadRulesForAllAccounts(engine);
```

**Checklist:**
- [ ] Import statements added
- [ ] initializeRuleEngine called
- [ ] Routes mounted
- [ ] Rules preloaded
- [ ] Error handling added

### Step 2: Setup Message Handler ✅

**File**: Your webhook or message processing handler

```javascript
// In your Instagram webhook handler
const processInstagramMessage = async (accountId, senderId, messageText) => {
  const result = await engine.processMessage(accountId, messageText, {
    sender: {
      id: senderId,
      name: senderName,
      username: senderUsername
    },
    isReply: false
  });

  if (result.matched && result.reply) {
    // Apply delay if configured
    if (result.reply.delay > 0) {
      await sleep(result.reply.delay * 1000);
    }

    // Send the reply
    await instagram.sendMessage(accountId, senderId, result.reply.content);

    // Log execution
    await logRuleExecution({
      ruleId: result.matchedRule.id,
      senderId,
      accountId,
      success: true
    });
  }
};
```

**Checklist:**
- [ ] Message handler function created
- [ ] Engine.processMessage called
- [ ] Context object properly populated
- [ ] Reply sending implemented
- [ ] Delay handling added
- [ ] Logging added

### Step 3: Setup WebSocket Real-time Updates ✅

**File**: Your Socket.io setup (optional but recommended)

```javascript
const io = require('socket.io')(server);
const { setupRealtimeUpdates } = require('./config/ruleEngineConfig');

// Setup real-time updates
setupRealtimeUpdates(io, engine, manager);

// In your frontend, connect and subscribe
socket.emit('subscribe:account', accountId);
socket.on('rule:created', (data) => console.log('Rule created', data));
socket.on('rule:updated', (data) => console.log('Rule updated', data));
socket.on('rule:deleted', (data) => console.log('Rule deleted', data));
```

**Checklist:**
- [ ] Socket.io configured
- [ ] setupRealtimeUpdates called
- [ ] Event listeners added
- [ ] Frontend subscriptions working

### Step 4: Setup Scheduled Tasks ✅

**File**: Your server initialization

```javascript
const { setupMaintenanceTasks } = require('./config/ruleEngineConfig');

// Setup scheduled tasks
setupMaintenanceTasks(engine, manager);

// Tasks include:
// - Hourly cache maintenance
// - Daily rule audit
// - Success rate monitoring
```

**Checklist:**
- [ ] setupMaintenanceTasks called
- [ ] Logs monitored for maintenance
- [ ] Alerts configured for low success rates

### Step 5: Create Default Rules for New Accounts ✅

**File**: Your account creation endpoint

```javascript
const { createDefaultRules } = require('./config/ruleEngineConfig');

// When new Instagram account is added
router.post('/accounts/add', async (req, res) => {
  // ... create account in DB ...

  // Create default rules
  const result = await createDefaultRules(newAccount._id, req.user._id);

  if (result.success) {
    // Reload rules for engine
    const rules = await AutomationRule.find({ account: newAccount._id });
    await engine.loadRulesForAccount(newAccount._id, rules);
  }

  res.json({ success: true, account: newAccount, rules: result.rules });
});
```

**Checklist:**
- [ ] Default rules created for new accounts
- [ ] Rules loaded into engine cache
- [ ] User notified of created rules

## API Integration Tests

### ✅ Test CRUD Operations

```bash
# Create Rule
curl -X POST http://localhost:3000/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "test-account",
    "name": "Test Rule",
    "keywords": ["test"],
    "matchType": "contains",
    "replyType": "predefined",
    "predefinedReply": "Test response",
    "priority": 10
  }'

# Get Rules
curl -X GET "http://localhost:3000/api/rules?accountId=test-account"

# Update Rule
curl -X PUT http://localhost:3000/api/rules/RULE_ID \
  -H "Content-Type: application/json" \
  -d '{"priority": 20}'

# Delete Rule
curl -X DELETE http://localhost:3000/api/rules/RULE_ID
```

**Checklist:**
- [ ] Create endpoint works
- [ ] Get endpoint works
- [ ] Update endpoint works
- [ ] Delete endpoint works
- [ ] Toggle endpoint works

### ✅ Test Processing Endpoints

```bash
# Process Message
curl -X POST http://localhost:3000/api/rules/process-message \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "test-account",
    "message": "Hi, I need help",
    "context": {
      "sender": {
        "id": "user123",
        "name": "John"
      }
    }
  }'

# Get Suggestions
curl -X POST http://localhost:3000/api/rules/get-suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "test-account",
    "message": "What products do you have?",
    "limit": 5
  }'
```

**Checklist:**
- [ ] Process message endpoint works
- [ ] Suggestions endpoint works
- [ ] Batch processing works
- [ ] Response format correct

### ✅ Test Utility Endpoints

```bash
# Validate Rule
curl -X POST http://localhost:3000/api/rules/validate \
  -H "Content-Type: application/json" \
  -d '{"name": "Rule", "keywords": ["test"]}'

# Get Stats
curl -X GET "http://localhost:3000/api/rules/stats?accountId=test-account"

# Get Cache Stats
curl -X GET http://localhost:3000/api/rules/cache-stats
```

**Checklist:**
- [ ] Validate endpoint works
- [ ] Stats endpoint works
- [ ] Cache stats work
- [ ] Error responses proper

## Data Validation Tests

### ✅ MongoDB Schema

```javascript
// Test that schema is properly defined
const rule = new AutomationRule({
  user: userId,
  account: accountId,
  name: 'Test Rule',
  keywords: ['test'],
  matchType: 'contains',
  replyType: 'predefined',
  predefinedReply: 'Response',
  priority: 10,
  isActive: true
});

await rule.save(); // Should succeed
```

**Checklist:**
- [ ] Schema validation works
- [ ] Indexes created
- [ ] Queries optimized
- [ ] Data persists correctly

## Performance Tests

### ✅ Load Testing

```javascript
// Test with multiple rules
const numRules = 50;
const rules = [];

for (let i = 0; i < numRules; i++) {
  rules.push({
    _id: new ObjectId(),
    name: `Rule ${i}`,
    keywords: ['test'],
    priority: Math.random() * 100,
    isActive: true,
    matchType: 'contains'
  });
}

// Load rules
const startTime = Date.now();
await engine.loadRulesForAccount(accountId, rules);
const loadTime = Date.now() - startTime;
console.log(`Loaded ${numRules} rules in ${loadTime}ms`);

// Process messages
const startProcess = Date.now();
for (let i = 0; i < 100; i++) {
  await engine.processMessage(accountId, 'test message');
}
const processTime = Date.now() - startProcess;
console.log(`Processed 100 messages in ${processTime}ms`);
```

**Checklist:**
- [ ] Rule loading < 100ms
- [ ] Message processing < 10ms (avg)
- [ ] Memory usage acceptable
- [ ] No memory leaks

## Security Tests

### ✅ Input Validation

```javascript
// Test validation
const invalidRules = [
  { name: null }, // Missing required field
  { keywords: [''] }, // Empty keywords
  { priority: -1 }, // Invalid priority
  { aiTemperature: 3 }, // Out of range
];

for (const invalid of invalidRules) {
  const validation = manager.validateRuleData(invalid);
  assert(!validation.valid, 'Should reject invalid rule');
}
```

**Checklist:**
- [ ] Null/undefined rejected
- [ ] Empty values rejected
- [ ] Type validation works
- [ ] Range validation works
- [ ] SQL injection impossible (using Mongoose)

### ✅ Authorization

```javascript
// Ensure user can only access their own rules
const rule = await manager.getRule(ruleId, userId);
// Should only return if userId matches
```

**Checklist:**
- [ ] User isolation enforced
- [ ] Account ownership verified
- [ ] No data leaks between users

## Production Deployment Checklist

### Environment Configuration
- [ ] NODE_ENV set to 'production'
- [ ] MONGODB_URI configured
- [ ] Rule cache timeout set (30 min recommended)
- [ ] Max rules per account configured
- [ ] Logging level set to 'info'

### Database
- [ ] MongoDB connection tested
- [ ] Indexes created and verified
- [ ] Backup strategy implemented
- [ ] Read replicas configured (optional)

### API
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] API authentication/authorization working
- [ ] Error responses consistent

### Monitoring
- [ ] Logging infrastructure setup
- [ ] Metrics collection enabled
- [ ] Alerts configured for:
  - [ ] High rule evaluation times
  - [ ] Low success rates
  - [ ] Cache issues
  - [ ] Database errors

### Documentation
- [ ] Team trained on rule engine
- [ ] Documentation shared
- [ ] Troubleshooting guide available
- [ ] Support procedures documented

## Post-Deployment Validation

### ✅ Live Testing

```javascript
// Test in production environment
const testMessage = 'Testing automation engine';
const result = await engine.processMessage(productionAccountId, testMessage);

console.log('Test Result:', {
  processed: result.processed,
  matched: result.matched,
  ruleTriggered: result.matchedRule?.name || 'none'
});

// Verify reply was sent (if matched)
if (result.matched) {
  // Check conversation for automated reply
}
```

**Checklist:**
- [ ] Rules processing correctly
- [ ] Replies being sent
- [ ] Statistics being tracked
- [ ] No error messages

### ✅ Monitoring Setup

```javascript
// Monitor key metrics
setInterval(() => {
  const stats = engine.getCacheStats();
  const { accountsCached, totalRulesCached } = stats;

  logger.info('Engine Stats', {
    accountsCached,
    totalRulesCached,
    timestamp: new Date().toISOString()
  });
}, 60000); // Every minute
```

**Checklist:**
- [ ] Metrics being collected
- [ ] Dashboards created
- [ ] Alerts working
- [ ] Team notified of setup

## Rollback Plan

### If Issues Occur

1. **Stop new rule creation** - Disable creation endpoint
2. **Clear cache** - `engine.clearAllCache()`
3. **Review error logs** - Check for patterns
4. **Restore from backup** - If data corruption
5. **Notify team** - Keep stakeholders informed

**Checklist:**
- [ ] Rollback procedure documented
- [ ] Team trained on rollback
- [ ] Backup verified
- [ ] Test rollback procedure

## Sign-Off

- [ ] Development Lead Approval
- [ ] QA Sign-Off
- [ ] Security Review Complete
- [ ] Performance Approved
- [ ] Production Deployment Authorized

---

**Integration Date**: ________________
**Completed By**: ________________
**Reviewed By**: ________________
**Status**: Ready for Production ✅
