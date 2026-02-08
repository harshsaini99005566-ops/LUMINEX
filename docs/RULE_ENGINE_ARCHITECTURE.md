# Rule-Based Automation Engine - Architecture & Design Patterns

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     API Layer (Express Routes)                   │
│  POST /api/rules  GET /api/rules  PUT /api/rules  DELETE ...    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Rule Manager Layer                            │
│                 (Database Operations & CRUD)                     │
│  ├─ Create rules           ├─ Get rules                          │
│  ├─ Update rules           ├─ Delete rules                       │
│  ├─ Bulk operations        └─ Statistics                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│              Automation Rule Engine (Orchestrator)               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Message Processing Pipeline                             │   │
│  │  1. Load rules from cache                                │   │
│  │  2. Evaluate against all rules                           │   │
│  │  3. Get best match                                       │   │
│  │  4. Generate reply                                       │   │
│  │  5. Return result                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐   │
│  │ Keyword Matcher  │  │ Rule Evaluator   │  │ReplyGenerator│   │
│  │ • exact matching │  │ • multi-criteria │  │ • predefined │   │
│  │ • contains       │  │ • priority sort  │  │ • AI fallback│   │
│  │ • regex patterns │  │ • readiness      │  │ • handoff    │   │
│  │ • score calc     │  │   checks         │  │ • variables  │   │
│  └──────────────────┘  └──────────────────┘  └──────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  In-Memory Cache                                         │   │
│  │  Map<accountId, { rules, timestamp }>                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                   Data Layer (MongoDB)                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ AutomationRule Collection                               │   │
│  │ • user (indexed)                                        │   │
│  │ • account (indexed)                                     │   │
│  │ • keywords, hashtags, mentions                          │   │
│  │ • replyType, replyConfig                                │   │
│  │ • priority, isActive                                    │   │
│  │ • statistics (triggers, success, failure)               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

```
Message Arrives
       │
       ▼
┌─────────────────────────────┐
│ AutomationRuleEngine        │
│ .processMessage()           │
└────────────┬────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │ Get rules from cache       │
    │ (or load if needed)        │
    └────────────┬───────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │ RuleEvaluator                  │
    │ .evaluateMultipleRules()       │
    │ - Check keywords               │
    │ - Check hashtags               │
    │ - Check mentions               │
    │ - Sort by priority & score     │
    └────────────┬───────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ Get Best Matching Rule     │
    │ (highest priority + score) │
    └────────────┬───────────────┘
                 │
                 ▼
    ┌────────────────────────────────────────────┐
    │ ReplyGenerator.generateReply()             │
    │ ┌──────────────────────────────────────┐   │
    │ │ 1. Check if predefined reply         │   │
    │ │    └─ Substitute variables           │   │
    │ │    └─ Return predefined response     │   │
    │ │ 2. If failed, check AI reply         │   │
    │ │    └─ Call AI service                │   │
    │ │    └─ Return AI response             │   │
    │ │ 3. If failed, return handoff         │   │
    │ │    └─ Log escalation                 │   │
    │ │ 4. If all failed, fallback           │   │
    │ │    └─ Return generic response        │   │
    │ └──────────────────────────────────────┘   │
    └────────────┬───────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ Return Result              │
    │ {                          │
    │   matched: true,           │
    │   reply: {                 │
    │     type: 'predefined',    │
    │     content: '...',        │
    │     delay: 1.5             │
    │   },                       │
    │   matchedRule: { ... }     │
    │ }                          │
    └────────────┬───────────────┘
                 │
                 ▼
        Send Reply to User
```

## Design Patterns Applied

### 1. **Strategy Pattern** - Keyword Matching
```
KeywordMatcher implements multiple strategies:
- ExactMatchStrategy
- ContainsMatchStrategy
- StartsWithMatchStrategy
- PartialWordMatchStrategy
- RegexMatchStrategy
```

### 2. **Composite Pattern** - Rule Evaluation
```
RuleEvaluator handles multiple evaluation criteria:
- Keyword evaluation
- Hashtag evaluation
- Mention evaluation
- Combined with AND logic
```

### 3. **Chain of Responsibility** - Reply Generation
```
ReplyGenerator tries in order:
1. Predefined reply
2. AI reply
3. Handoff
4. Fallback
Each handler can pass to next if failed.
```

### 4. **Observer Pattern** - Real-time Updates
```
EventEmitter notifies:
- rule:created
- rule:updated
- rule:deleted
Real-time clients receive updates via WebSocket
```

### 5. **Cache Pattern** - Performance
```
In-memory cache with TTL:
Map<accountId, { rules, timestamp }>
Automatic expiration after timeout
Manual cache clearing available
```

### 6. **Repository Pattern** - Data Access
```
RuleManager abstracts database operations:
- Create, read, update, delete
- Filtering and sorting
- Statistics aggregation
```

## Data Flow Diagram

```
User Input
    │
    ├─ Instagram Message ──────┐
    └─ API Request ────────────┤
                               │
                               ▼
                    ┌─────────────────────┐
                    │ API Route Handler   │
                    │ • Validate input    │
                    │ • Extract context   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │ RuleManager or Engine    │
                    │ • Route to operation     │
                    │ • Ensure authorization   │
                    └──────────┬───────────────┘
                               │
                    ┌──────────┴──────────┬──────────────┐
                    │                    │              │
                    ▼                    ▼              ▼
            ┌──────────────┐    ┌──────────────┐  ┌────────────┐
            │Create/Update │    │Process/Query │  │Statistics  │
            │RuleManager   │    │Engine        │  │RuleManager │
            └──────┬───────┘    └──────┬───────┘  └────┬───────┘
                   │                   │               │
                   ▼                   ▼               ▼
            ┌──────────────┐    ┌──────────────┐  ┌────────────┐
            │Validate      │    │Keyword       │  │Aggregate   │
            │Save to DB    │    │Matcher       │  │Statistics  │
            │Update Cache  │    │RuleEvaluator│  │Format      │
            │Emit Event    │    │ReplyGenerator│  │Response    │
            └──────┬───────┘    └──────┬───────┘  └────┬───────┘
                   │                   │               │
                   └─────────┬─────────┴───────────────┘
                             │
                             ▼
                    ┌─────────────────────┐
                    │ Send Response       │
                    │ • API JSON response │
                    │ • WebSocket update  │
                    │ • Send DM (if msg)  │
                    └─────────────────────┘
```

## Class Hierarchy

```
KeywordMatcher (Static Utility)
├─ match()
├─ findBestMatch()
└─ extractKeywordsFromMessage()

RuleEvaluator (Static Utility)
├─ evaluateRule()
├─ evaluateMultipleRules()
├─ getBestMatchingRule()
├─ isRuleReadyForExecution()
└─ getRuleMetadata()

ReplyGenerator (Class)
├─ generateReply()
├─ batchGenerateReplies()
└─ setAIService()

AutomationRuleEngine (Class)
├─ loadRulesForAccount()
├─ processMessage()
├─ batchProcessMessages()
├─ getSuggestedRules()
├─ getCacheStats()
└─ Cache Management

RuleManager (Class)
├─ CRUD Operations
├─ validateRuleData()
├─ getRuleStats()
└─ Event Emission

RuleEngineUtils (Static Utility)
├─ Rule Utilities
├─ Analysis Functions
└─ Import/Export
```

## State Machine - Rule Lifecycle

```
┌──────────┐
│ Created  │
│ isActive │ = false
└────┬─────┘
     │ .updateRule({ isActive: true })
     ▼
┌──────────────┐
│ Activated    │
│ Ready to use │
└────┬─────────┘
     │ Message arrives matching keywords
     ▼
┌──────────────────┐
│ Triggered        │
│ Execute logic    │
└────┬─────────────┘
     │ Generate reply
     ▼
┌──────────────┐
│ Replied      │
│ Send message │
└────┬─────────┘
     │ .updateRule({ isActive: false })
     │
     ├─ Deactivated ───┐
     │                  │
     └─ Deleted ────────┴──► Final State
```

## Cache Management Strategy

```
┌─────────────────────────────────────┐
│ Account Rules Cache                 │
│                                     │
│ accountId_1                         │
│   └─ { rules: [...], ts: 123 }     │
│ accountId_2                         │
│   └─ { rules: [...], ts: 123 }     │
│ accountId_3                         │
│   └─ { rules: [...], ts: 123 }     │
│                                     │
└─────────────────────────────────────┘
              │
              ▼
    On.processMessage()
              │
         ┌────┴────┐
         ▼         ▼
    Cache Hit   Cache Miss
       │            │
       │            ▼
       │        Query DB
       │        Load rules
       │        Update cache
       │            │
       └────┬───────┘
            │
            ▼
      Use cached rules
              │
              ▼
      Process message
              │
         ┌────┴──────┐
         ▼           ▼
    .updateRule  .deleteRule
        │            │
        ▼            ▼
    Cache Update  Cache Remove
```

## Error Handling Flow

```
Any Operation
      │
      ▼
   Try Block
      │
  ┌───┴────────────────────┐
  ▼                        ▼
Success                 Error
  │                        │
  ▼                        ▼
Return Result      ┌──────────────┐
                   │Log Error     │
                   │Return Error  │
                   │Safe Fallback │
                   └──────────────┘
                        │
                        ▼
                  Graceful Failure
```

## Performance Optimization Strategy

```
1. CACHING
   └─ In-memory rule cache with TTL
   
2. INDEXING
   └─ MongoDB indexes on user, account, isActive
   
3. BATCH PROCESSING
   └─ Process multiple messages in one call
   
4. LAZY EVALUATION
   └─ Stop checking rules when first match found
   
5. SORTING
   └─ Pre-sort rules by priority
   
6. QUERY OPTIMIZATION
   └─ Only load active rules
   └─ Use projection to get needed fields
```

## Extension Points

```
1. KeywordMatcher
   └─ Add new matching strategy
   
2. ReplyGenerator
   └─ Add new reply type (custom AI, webhooks)
   
3. RuleEvaluator
   └─ Add new evaluation criteria
   
4. AutomationRuleEngine
   └─ Add pre/post processing hooks
   
5. RuleEngineUtils
   └─ Add new utility functions
```

---

**Architecture Version**: 1.0
**Pattern Compliance**: SOLID + Design Patterns
**Scalability**: Horizontal (multi-server via cache invalidation)
**Production Ready**: ✅ Yes
