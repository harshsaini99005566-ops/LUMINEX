/**
 * Messaging API Routes
 * Handles sending and managing Instagram DM messages with rate limiting
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const InstagramAccount = require('../models/InstagramAccount');
const Message = require('../models/Message');
const logger = require('../../utils/logger');
const metaApi = require('../services/metaApi');

const router = express.Router();

/**
 * Rate limiter middleware
 * Limits messages per account
 */
const checkRateLimit = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const account = await InstagramAccount.findById(accountId);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Check daily limit
    if (!account.canSendMessage()) {
      return res.status(429).json({
        error: 'Daily message limit reached',
        limit: account.dailyMessageLimit,
        sent: account.messagesSentToday,
      });
    }

    req.account = account;
    next();
  } catch (error) {
    logger.error('[Rate Limit] Error:', error);
    res.status(500).json({ error: 'Rate limit check failed' });
  }
};

/**
 * POST /api/messages/accounts/:accountId/send
 * Send a simple text message
 * Request: { recipientId, text }
 */
router.post('/accounts/:accountId/send', authenticate, checkRateLimit, async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;
    const { recipientId, text } = req.body;

    // Validation
    if (!recipientId || !text) {
      return res.status(400).json({
        error: 'Missing required fields: recipientId, text',
      });
    }

    if (text.length > 4096) {
      return res.status(400).json({
        error: 'Message too long (max 4096 characters)',
      });
    }

    // Verify account ownership
    const account = await InstagramAccount.findOne({
      _id: accountId,
      user: userId,
      isActive: true,
    }).select('+accessToken');

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Get business account ID
    const businessAccountId = await metaApi.getBusinessAccountId(
      account.accessToken,
      account.instagramId
    );

    // Send message via Meta API
    const result = await metaApi.sendTextMessage(
      account.accessToken,
      businessAccountId,
      recipientId,
      text
    );

    // Store message record
    const message = await Message.create({
      account: account._id,
      instagramMessageId: result.messageId,
      sender: 'bot',
      text: text,
      recipientId: recipientId,
      status: 'sent',
      sentAt: new Date(),
    });

    // Update rate limit
    account.updateMessageCount();
    await account.save();

    logger.info('[Message] Sent successfully', {
      accountId: account._id,
      messageId: result.messageId,
      recipientId,
    });

    res.status(200).json({
      success: true,
      messageId: result.messageId,
      message: message,
      remaining: account.dailyMessageLimit - account.messagesSentToday,
    });
  } catch (error) {
    logger.error('[Message] Send failed:', error);
    res.status(500).json({
      error: 'Failed to send message',
      details: error.message,
    });
  }
});

/**
 * POST /api/messages/accounts/:accountId/send/template
 * Send a template message
 * Request: { recipientId, templateName, parameters }
 */
router.post(
  '/accounts/:accountId/send/template',
  authenticate,
  checkRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { accountId } = req.params;
      const { recipientId, templateName, parameters = [] } = req.body;

      if (!recipientId || !templateName) {
        return res.status(400).json({
          error: 'Missing required fields: recipientId, templateName',
        });
      }

      const account = await InstagramAccount.findOne({
        _id: accountId,
        user: userId,
        isActive: true,
      }).select('+accessToken');

      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      const businessAccountId = await metaApi.getBusinessAccountId(
        account.accessToken,
        account.instagramId
      );

      const result = await metaApi.sendTemplateMessage(
        account.accessToken,
        businessAccountId,
        recipientId,
        templateName,
        parameters
      );

      const message = await Message.create({
        account: account._id,
        instagramMessageId: result.messageId,
        sender: 'bot',
        text: `Template: ${templateName}`,
        recipientId: recipientId,
        status: 'sent',
        sentAt: new Date(),
        metadata: { templateName, parameters },
      });

      account.updateMessageCount();
      await account.save();

      res.status(200).json({
        success: true,
        messageId: result.messageId,
        message: message,
        remaining: account.dailyMessageLimit - account.messagesSentToday,
      });
    } catch (error) {
      logger.error('[Template Message] Send failed:', error);
      res.status(500).json({
        error: 'Failed to send template message',
        details: error.message,
      });
    }
  }
);

/**
 * POST /api/messages/accounts/:accountId/send/quick-reply
 * Send message with quick reply buttons
 * Request: { recipientId, text, quickReplies: [{ title, payload }] }
 */
router.post(
  '/accounts/:accountId/send/quick-reply',
  authenticate,
  checkRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { accountId } = req.params;
      const { recipientId, text, quickReplies = [] } = req.body;

      if (!recipientId || !text || quickReplies.length === 0) {
        return res.status(400).json({
          error: 'Missing required fields: recipientId, text, quickReplies',
        });
      }

      if (quickReplies.length > 11) {
        return res.status(400).json({
          error: 'Too many quick replies (max 11)',
        });
      }

      const account = await InstagramAccount.findOne({
        _id: accountId,
        user: userId,
        isActive: true,
      }).select('+accessToken');

      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      const businessAccountId = await metaApi.getBusinessAccountId(
        account.accessToken,
        account.instagramId
      );

      const result = await metaApi.sendQuickReplyMessage(
        account.accessToken,
        businessAccountId,
        recipientId,
        text,
        quickReplies
      );

      const message = await Message.create({
        account: account._id,
        instagramMessageId: result.messageId,
        sender: 'bot',
        text: text,
        recipientId: recipientId,
        status: 'sent',
        sentAt: new Date(),
        metadata: { quickReplies },
      });

      account.updateMessageCount();
      await account.save();

      res.status(200).json({
        success: true,
        messageId: result.messageId,
        message: message,
        remaining: account.dailyMessageLimit - account.messagesSentToday,
      });
    } catch (error) {
      logger.error('[Quick Reply] Send failed:', error);
      res.status(500).json({
        error: 'Failed to send quick reply message',
        details: error.message,
      });
    }
  }
);

/**
 * POST /api/messages/accounts/:accountId/send/media
 * Send message with media attachment
 * Request: { recipientId, mediaType, mediaUrl, caption? }
 */
router.post('/accounts/:accountId/send/media', authenticate, checkRateLimit, async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;
    const { recipientId, mediaType, mediaUrl, caption } = req.body;

    if (!recipientId || !mediaType || !mediaUrl) {
      return res.status(400).json({
        error: 'Missing required fields: recipientId, mediaType, mediaUrl',
      });
    }

    const validTypes = ['image', 'video', 'audio', 'file'];
    if (!validTypes.includes(mediaType)) {
      return res.status(400).json({
        error: `Invalid mediaType. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    const account = await InstagramAccount.findOne({
      _id: accountId,
      user: userId,
      isActive: true,
    }).select('+accessToken');

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const businessAccountId = await metaApi.getBusinessAccountId(
      account.accessToken,
      account.instagramId
    );

    const result = await metaApi.sendMediaMessage(
      account.accessToken,
      businessAccountId,
      recipientId,
      mediaType,
      mediaUrl,
      caption
    );

    const message = await Message.create({
      account: account._id,
      instagramMessageId: result.messageId,
      sender: 'bot',
      text: caption || `${mediaType} attachment`,
      recipientId: recipientId,
      status: 'sent',
      sentAt: new Date(),
      attachments: [{ type: mediaType, url: mediaUrl }],
    });

    account.updateMessageCount();
    await account.save();

    res.status(200).json({
      success: true,
      messageId: result.messageId,
      message: message,
      remaining: account.dailyMessageLimit - account.messagesSentToday,
    });
  } catch (error) {
    logger.error('[Media Message] Send failed:', error);
    res.status(500).json({
      error: 'Failed to send media message',
      details: error.message,
    });
  }
});

/**
 * GET /api/messages/accounts/:accountId/rate-limit
 * Get current rate limit status
 */
router.get('/accounts/:accountId/rate-limit', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;

    const account = await InstagramAccount.findOne({
      _id: accountId,
      user: userId,
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      dailyLimit: account.dailyMessageLimit,
      sentToday: account.messagesSentToday,
      remaining: account.dailyMessageLimit - account.messagesSentToday,
      resetTime: account.messagingLimitResetTime,
      canSend: account.canSendMessage(),
    });
  } catch (error) {
    logger.error('[Rate Limit] Get failed:', error);
    res.status(500).json({ error: 'Failed to get rate limit status' });
  }
});

/**
 * PUT /api/messages/accounts/:accountId/rate-limit
 * Update daily message limit (admin only)
 */
router.put('/accounts/:accountId/rate-limit', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;
    const { dailyLimit } = req.body;

    if (!dailyLimit || dailyLimit < 1 || dailyLimit > 1000) {
      return res.status(400).json({
        error: 'Daily limit must be between 1 and 1000',
      });
    }

    const account = await InstagramAccount.findOne({
      _id: accountId,
      user: userId,
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    account.dailyMessageLimit = dailyLimit;
    await account.save();

    res.json({
      success: true,
      dailyLimit: account.dailyMessageLimit,
    });
  } catch (error) {
    logger.error('[Rate Limit] Update failed:', error);
    res.status(500).json({ error: 'Failed to update rate limit' });
  }
});

/**
 * GET /api/messages/accounts/:accountId/message/:messageId
 * Get message details
 */
router.get('/accounts/:accountId/message/:messageId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId, messageId } = req.params;

    const account = await InstagramAccount.findOne({
      _id: accountId,
      user: userId,
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const message = await Message.findOne({
      _id: messageId,
      account: accountId,
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message });
  } catch (error) {
    logger.error('[Get Message] Failed:', error);
    res.status(500).json({ error: 'Failed to get message' });
  }
});

module.exports = router;
