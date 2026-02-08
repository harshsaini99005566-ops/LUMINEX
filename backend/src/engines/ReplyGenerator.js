/**
 * ReplyGenerator - Generates responses with AI fallback
 * Integrates predefined replies, AI responses, and handoff logic
 */

const logger = require('../../utils/logger');

class ReplyGenerator {
  constructor(aiService = null) {
    this.aiService = aiService;
  }

  /**
   * Generate reply based on rule configuration
   * @param {object} rule - The automation rule
   * @param {object} context - Message context { sender, message, conversationId }
   * @returns {Promise<object>} - { type, content, delay, metadata }
   */
  async generateReply(rule, context = {}) {
    try {
      if (!rule.isActive) {
        return {
          type: 'error',
          content: 'Rule is disabled',
          delay: 0,
        };
      }

      let reply = null;

      // Execute based on reply type priority
      if (rule.replyType === 'predefined' && rule.predefinedReply) {
        reply = this._generatePredefinedReply(rule, context);
      } else if (rule.replyType === 'ai' && rule.aiPrompt) {
        reply = await this._generateAIReply(rule, context);
      } else if (rule.replyType === 'handoff') {
        reply = this._generateHandoffReply(rule, context);
      }

      // If primary method failed or not configured, try AI fallback
      if (!reply && rule.useAI && rule.aiPrompt) {
        reply = await this._generateAIReply(rule, context);
      }

      // If still no reply, generate generic fallback
      if (!reply) {
        reply = this._generateFallbackReply(context);
      }

      // Apply delay
      reply.delay = this._calculateDelay(rule);
      reply.ruleId = rule._id;
      reply.timestamp = new Date();

      return reply;
    } catch (error) {
      logger.error('Error generating reply', error);
      return this._generateErrorReply();
    }
  }

  /**
   * Generate predefined reply with variable substitution
   */
  _generatePredefinedReply(rule, context) {
    try {
      let content = rule.predefinedReply;

      // Variable substitution
      content = this._substituteVariables(content, context);

      return {
        type: 'predefined',
        content,
        metadata: {
          ruleId: rule._id,
          ruleName: rule.name,
          matchedKeywords: context.matchedKeywords || [],
        },
      };
    } catch (error) {
      logger.error('Error generating predefined reply', error);
      return null;
    }
  }

  /**
   * Generate AI reply using AI service
   */
  async _generateAIReply(rule, context) {
    try {
      if (!this.aiService) {
        logger.warn('AI service not configured');
        return null;
      }

      const prompt = this._buildAIPrompt(rule, context);

      const aiResponse = await this.aiService.generateResponse({
        prompt,
        temperature: rule.aiTemperature || 0.7,
        maxTokens: 200,
        context: {
          senderName: context.sender?.name,
          originalMessage: context.message,
        },
      });

      return {
        type: 'ai',
        content: aiResponse.text || aiResponse.content,
        metadata: {
          ruleId: rule._id,
          ruleName: rule.name,
          temperature: rule.aiTemperature,
          model: aiResponse.model,
          tokensUsed: aiResponse.tokens,
        },
      };
    } catch (error) {
      logger.error('Error generating AI reply', error);
      return null;
    }
  }

  /**
   * Generate handoff notification
   */
  _generateHandoffReply(rule, context) {
    return {
      type: 'handoff',
      content: `Message has been escalated to ${rule.handoffEmail}`,
      metadata: {
        ruleId: rule._id,
        ruleName: rule.name,
        handoffEmail: rule.handoffEmail,
        originalSender: context.sender?.id,
        timestamp: new Date(),
      },
    };
  }

  /**
   * Generate fallback reply
   */
  _generateFallbackReply(context) {
    const templates = [
      'Thanks for your message! We will get back to you soon.',
      'We appreciate your message and will respond shortly.',
      'Thank you for reaching out. Our team will be in touch soon.',
      'Your message has been received. We will assist you shortly.',
    ];

    const randomTemplate =
      templates[Math.floor(Math.random() * templates.length)];

    return {
      type: 'fallback',
      content: randomTemplate,
      metadata: {
        sender: context.sender?.id,
        generatedAt: new Date(),
      },
    };
  }

  /**
   * Generate error reply
   */
  _generateErrorReply() {
    return {
      type: 'error',
      content: 'Unable to generate response at this time',
      delay: 0,
      metadata: {
        timestamp: new Date(),
      },
    };
  }

  /**
   * Build comprehensive AI prompt from rule and context
   */
  _buildAIPrompt(rule, context) {
    const basePrompt = rule.aiPrompt || 'Respond to the customer inquiry helpfully.';

    const contextInfo = [
      `Original message: "${context.message || ''}"`,
      context.sender?.name ? `Customer name: ${context.sender.name}` : null,
      context.previousMessages
        ? `Message history: ${context.previousMessages.length} previous messages`
        : null,
      rule.description ? `Context: ${rule.description}` : null,
    ].filter(Boolean);

    return contextInfo.length > 0
      ? `${basePrompt}\n\nContext:\n${contextInfo.join('\n')}`
      : basePrompt;
  }

  /**
   * Substitute variables in template strings
   */
  _substituteVariables(template, context) {
    let result = template;

    // Replace common variables
    if (context.sender?.name) {
      result = result.replace(/\{sender\.name\}/g, context.sender.name);
    }
    if (context.sender?.username) {
      result = result.replace(/\{sender\.username\}/g, context.sender.username);
    }
    if (context.message) {
      result = result.replace(/\{message\}/g, context.message);
    }

    // Replace current date/time
    const now = new Date();
    result = result.replace(/\{date\}/g, now.toLocaleDateString());
    result = result.replace(/\{time\}/g, now.toLocaleTimeString());
    result = result.replace(
      /\{datetime\}/g,
      now.toLocaleString()
    );

    return result;
  }

  /**
   * Calculate delay with jitter for more natural feel
   */
  _calculateDelay(rule) {
    const baseDelay = rule.delaySeconds || 0;

    // Add random jitter (±10% of base delay)
    if (baseDelay > 0) {
      const jitter = (Math.random() - 0.5) * (baseDelay * 0.2);
      return Math.max(0, baseDelay + jitter);
    }

    return 0;
  }

  /**
   * Batch generate replies for multiple messages
   */
  async batchGenerateReplies(rules, messages) {
    try {
      const replies = await Promise.all(
        messages.map((msg) =>
          this.generateReply(
            rules[0], // Use first matching rule for demo
            msg
          )
        )
      );

      return {
        success: true,
        count: replies.length,
        replies,
      };
    } catch (error) {
      logger.error('Error in batch reply generation', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Set custom AI service
   */
  setAIService(aiService) {
    this.aiService = aiService;
  }
}

module.exports = ReplyGenerator;
