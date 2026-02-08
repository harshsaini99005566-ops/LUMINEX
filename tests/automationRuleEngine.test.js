/**
 * Automation Rule Engine - Comprehensive Test Suite
 * Tests for KeywordMatcher, RuleEvaluator, ReplyGenerator, and AutomationRuleEngine
 */

const KeywordMatcher = require('../src/engines/KeywordMatcher');
const RuleEvaluator = require('../src/engines/RuleEvaluator');
const ReplyGenerator = require('../src/engines/ReplyGenerator');
const RuleEngineUtils = require('../src/utils/RuleEngineUtils');

describe('KeywordMatcher', () => {
  describe('Basic Matching', () => {
    it('should match keywords in contains mode', () => {
      const result = KeywordMatcher.match('hello world', ['hello', 'test'], 'contains');
      expect(result.matched).toBe(true);
      expect(result.matchedKeywords).toContain('hello');
    });

    it('should match exact keywords', () => {
      const result = KeywordMatcher.match('hello', ['hello'], 'exact');
      expect(result.matched).toBe(true);
    });

    it('should match case-insensitive by default', () => {
      const result = KeywordMatcher.match('HELLO', ['hello'], 'contains', false);
      expect(result.matched).toBe(true);
    });

    it('should respect case sensitivity', () => {
      const result = KeywordMatcher.match('Hello', ['hello'], 'contains', true);
      expect(result.matched).toBe(false);
    });

    it('should match starts_with pattern', () => {
      const result = KeywordMatcher.match('hello world', ['hello'], 'starts_with');
      expect(result.matched).toBe(true);
    });

    it('should match partial word keywords', () => {
      const result = KeywordMatcher.match('I love coding', ['love'], 'partial_word');
      expect(result.matched).toBe(true);
    });

    it('should not match substring in partial_word mode', () => {
      const result = KeywordMatcher.match('absolutely', ['absolute'], 'partial_word');
      expect(result.matched).toBe(false);
    });
  });

  describe('Advanced Matching', () => {
    it('should calculate match scores', () => {
      const result = KeywordMatcher.match('hello world test', ['hello', 'world', 'test'], 'contains');
      expect(result.score).toBeGreaterThan(0);
    });

    it('should extract keywords from message', () => {
      const extracted = KeywordMatcher.extractKeywordsFromMessage(
        'Hey @john check out #marketing'
      );
      expect(extracted.mentions).toContain('@john');
      expect(extracted.hashtags).toContain('#marketing');
    });

    it('should find best match from multiple rules', () => {
      const rules = [
        { keywords: ['hello'], matchType: 'contains' },
        { keywords: ['hello', 'world'], matchType: 'contains' },
        { keywords: ['goodbye'], matchType: 'contains' },
      ];

      const best = KeywordMatcher.findBestMatch('hello world', rules);
      expect(best).not.toBeNull();
      expect(best.rule.keywords).toContain('world');
    });
  });

  describe('Regex Matching', () => {
    it('should match regex patterns', () => {
      const result = KeywordMatcher.match(
        'Email: test@example.com',
        ['^Email:'],
        'regex'
      );
      expect(result.matched).toBe(true);
    });

    it('should handle invalid regex gracefully', () => {
      const result = KeywordMatcher.match('text', ['[invalid(regex'], 'regex');
      expect(result.matched).toBe(false);
    });
  });
});

describe('RuleEvaluator', () => {
  const mockRule = {
    _id: '123',
    name: 'Test Rule',
    isActive: true,
    keywords: ['hello', 'hi'],
    matchType: 'contains',
    caseSensitive: false,
    hashtags: [],
    mentions: false,
    doNotReplyToReplies: false,
    maxRepliesPerUser: 0,
  };

  describe('Rule Evaluation', () => {
    it('should evaluate active rule successfully', () => {
      const result = RuleEvaluator.evaluateRule(mockRule, 'hello there');
      expect(result.triggered).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should not evaluate inactive rule', () => {
      const inactiveRule = { ...mockRule, isActive: false };
      const result = RuleEvaluator.evaluateRule(inactiveRule, 'hello');
      expect(result.triggered).toBe(false);
    });

    it('should check hashtags', () => {
      const ruleWithHashtag = {
        ...mockRule,
        keywords: [],
        hashtags: ['marketing'],
      };
      const result = RuleEvaluator.evaluateRule(
        ruleWithHashtag,
        'Check out #marketing'
      );
      expect(result.triggered).toBe(true);
    });

    it('should respect no-reply-to-replies policy', () => {
      const ruleNoReply = { ...mockRule, doNotReplyToReplies: true };
      const result = RuleEvaluator.evaluateRule(ruleNoReply, 'hello', {
        isReply: true,
      });
      expect(result.triggered).toBe(false);
    });

    it('should enforce max replies per user', () => {
      const ruleMaxReplies = { ...mockRule, maxRepliesPerUser: 2 };
      const result = RuleEvaluator.evaluateRule(ruleMaxReplies, 'hello', {
        userReplyCount: 3,
      });
      expect(result.triggered).toBe(false);
    });
  });

  describe('Multiple Rules', () => {
    const rules = [
      { ...mockRule, priority: 10 },
      { ...mockRule, _id: '124', priority: 5, keywords: ['bye'] },
      { ...mockRule, _id: '125', priority: 15, keywords: ['hello'] },
    ];

    it('should evaluate multiple rules', () => {
      const results = RuleEvaluator.evaluateMultipleRules(rules, 'hello');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should sort by priority', () => {
      const results = RuleEvaluator.evaluateMultipleRules(rules, 'hello');
      expect(results[0].priority).toBeGreaterThanOrEqual(
        results[results.length - 1].priority
      );
    });

    it('should get best matching rule', () => {
      const best = RuleEvaluator.getBestMatchingRule(rules, 'hello');
      expect(best).not.toBeNull();
      expect(best.rule.priority).toBe(15);
    });
  });

  describe('Execution Readiness', () => {
    it('should check if rule is ready for execution', () => {
      const rule = {
        ...mockRule,
        replyType: 'predefined',
        predefinedReply: 'Hello!',
      };
      const readiness = RuleEvaluator.isRuleReadyForExecution(rule);
      expect(readiness.ready).toBe(true);
    });

    it('should detect missing reply configuration', () => {
      const rule = { ...mockRule, replyType: 'predefined', predefinedReply: null };
      const readiness = RuleEvaluator.isRuleReadyForExecution(rule);
      expect(readiness.ready).toBe(false);
    });
  });
});

describe('ReplyGenerator', () => {
  const mockRule = {
    _id: '123',
    name: 'Test Rule',
    isActive: true,
    replyType: 'predefined',
    predefinedReply: 'Thanks for contacting us!',
    delaySeconds: 0,
  };

  describe('Reply Generation', () => {
    it('should generate predefined reply', async () => {
      const generator = new ReplyGenerator();
      const reply = await generator.generateReply(mockRule);
      expect(reply.type).toBe('predefined');
      expect(reply.content).toBe('Thanks for contacting us!');
    });

    it('should reject inactive rule', async () => {
      const generator = new ReplyGenerator();
      const inactiveRule = { ...mockRule, isActive: false };
      const reply = await generator.generateReply(inactiveRule);
      expect(reply.type).toBe('error');
    });

    it('should apply delay', async () => {
      const generator = new ReplyGenerator();
      const ruleWithDelay = { ...mockRule, delaySeconds: 5 };
      const reply = await generator.generateReply(ruleWithDelay);
      expect(reply.delay).toBeGreaterThan(0);
    });

    it('should substitute variables in template', async () => {
      const generator = new ReplyGenerator();
      const templateRule = {
        ...mockRule,
        predefinedReply: 'Hi {sender.name}, thanks for your message!',
      };
      const reply = await generator.generateReply(templateRule, {
        sender: { name: 'John' },
      });
      expect(reply.content).toContain('John');
    });
  });

  describe('Handoff Generation', () => {
    it('should generate handoff reply', async () => {
      const generator = new ReplyGenerator();
      const handoffRule = {
        ...mockRule,
        replyType: 'handoff',
        handoffEmail: 'support@example.com',
      };
      const reply = await generator.generateReply(handoffRule);
      expect(reply.type).toBe('handoff');
    });
  });

  describe('Fallback', () => {
    it('should generate fallback reply', async () => {
      const generator = new ReplyGenerator();
      const reply = await generator.generateReply({
        isActive: true,
        replyType: 'invalid',
      });
      expect(reply.type).toBe('fallback');
    });
  });
});

describe('RuleEngineUtils', () => {
  describe('Keyword Sanitization', () => {
    it('should sanitize keywords', () => {
      const keywords = ['HELLO', '  WORLD  ', 'hello', ''];
      const sanitized = RuleEngineUtils.sanitizeKeywords(keywords);
      expect(sanitized).toHaveLength(2);
      expect(sanitized).toContain('hello');
      expect(sanitized).toContain('world');
    });
  });

  describe('Effectiveness Score', () => {
    it('should calculate effectiveness score', () => {
      const rule = {
        triggerCount: 100,
        successCount: 80,
        priority: 10,
        lastTriggered: new Date(),
      };
      const score = RuleEngineUtils.calculateEffectivenessScore(rule);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should return 0 for rules with no triggers', () => {
      const rule = { triggerCount: 0, successCount: 0 };
      const score = RuleEngineUtils.calculateEffectivenessScore(rule);
      expect(score).toBe(0);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect priority conflicts', () => {
      const rules = [
        {
          _id: '1',
          name: 'Rule 1',
          triggerType: 'keyword',
          priority: 10,
          keywords: ['hello'],
        },
        {
          _id: '2',
          name: 'Rule 2',
          triggerType: 'keyword',
          priority: 5,
          keywords: ['hello'],
        },
      ];
      const conflicts = RuleEngineUtils.detectConflicts(rules);
      expect(conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('Export/Import', () => {
    it('should export rules as JSON', () => {
      const rules = [
        {
          _id: '1',
          name: 'Test',
          keywords: ['hello'],
          priority: 10,
        },
      ];
      const json = RuleEngineUtils.exportRules(rules, 'json');
      expect(json).toBeTruthy();
      const parsed = JSON.parse(json);
      expect(Array.isArray(parsed)).toBe(true);
    });

    it('should import rules from JSON', () => {
      const jsonData = JSON.stringify([
        { name: 'Rule 1', keywords: ['hello'] },
      ]);
      const result = RuleEngineUtils.importRules(jsonData);
      expect(result.success).toBe(true);
      expect(result.rules).toHaveLength(1);
    });

    it('should handle invalid JSON', () => {
      const result = RuleEngineUtils.importRules('invalid json');
      expect(result.success).toBe(false);
    });
  });
});

// Test Summary
console.log(
  '\nAutomation Rule Engine Test Suite Loaded\n' +
    'Run with: npm test\n' +
    'Coverage: npm test -- --coverage'
);

module.exports = {
  KeywordMatcher,
  RuleEvaluator,
  ReplyGenerator,
  RuleEngineUtils,
};
