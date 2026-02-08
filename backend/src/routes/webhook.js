const express = require('express');

const logger = require('../../utils/logger');
const ruleEngine = require('../services/ruleEngine');
const instagramService = require('../services/instagram');
const { sendMessage } = require('../services/instagram');

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const InstagramAccount = require('../models/InstagramAccount');
const AutomationRule = require('../models/AutomationRule');

const { config } = require('../config/env');

const router = express.Router();

/**
 * Verify Instagram Webhook
 * GET /webhook/instagram
 * 
 * Meta sends a verification request with:
 * - hub.mode=subscribe
 * - hub.challenge=random_string
 * - hub.verify_token=your_verify_token
 */
router.get('/instagram', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  logger.info('Webhook verification request received', {
    mode,
    hasChallenge: !!challenge,
    tokenMatch: token === config.instagram.webhookToken,
  });

  if (mode === 'subscribe' && token === config.instagram.webhookToken) {
    logger.info('✅ Webhook verified successfully');
    res.status(200).send(challenge);
  } else {
    logger.warn('❌ Webhook verification failed - invalid token or mode');
    res.sendStatus(403);
  }
});

/**
 * Receive Instagram Webhook Events
 * POST /webhook/instagram
 * 
 * Includes signature verification for security
 */
router.post('/instagram', async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.get('X-Hub-Signature-256');
    const body = req.rawBody || JSON.stringify(req.body);

    if (!instagramService.verifyWebhookSignature(body, signature)) {
      logger.warn('❌ Webhook signature verification failed');
      return res.status(403).json({ error: 'Webhook signature verification failed' });
    }

    const { object, entry } = req.body;

    // Verify this is an Instagram webhook
    if (object !== 'instagram') {
      logger.warn(`Received webhook for object type: ${object}`);
      return res.status(200).json({ success: true });
    }

    if (!entry || entry.length === 0) {
      return res.status(200).json({ success: true });
    }

    // Process all entries
    for (const item of entry) {
      for (const change of item.changes || []) {
        // Handle incoming messages
        if (change.field === 'messages') {
          await handleIncomingMessage(change.value);
        }
        // Handle message status updates (delivery, read)
        else if (change.field === 'message_status') {
          await handleMessageStatus(change.value);
        }
        // Handle comment mentions (comments on posts)
        else if (change.field === 'comments') {
          await handleIncomingComment(change.value);
        }
        // Handle story mentions
        else if (change.field === 'story_mention') {
          await handleStoryMention(change.value);
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Webhook processing error', error);
    // Always return 200 to acknowledge receipt
    res.status(200).json({ success: false, error: error.message });
  }
});

/**
 * Handle message status updates (delivery, read receipts)
 */
const handleMessageStatus = async (data) => {
  try {
    const statusUpdate = instagramService.processMessageStatus(data);
    if (statusUpdate) {
      const { messageId, status } = await statusUpdate;
      
      await Message.updateOne(
        { instagramMessageId: messageId },
        { status, updatedAt: new Date() }
      );

      logger.info(`Message ${messageId} marked as ${status}`);
    }
  } catch (error) {
    logger.error('Error handling message status', error);
  }
};

/**
 * Handle incoming comments (comment automation)
 */
const handleIncomingComment = async (_data) => {
  try {
    // This would be implemented for comment automation
    // data contains: id, from, message, timestamp, post
    logger.info('Comment received (not yet implemented)');
  } catch (error) {
    logger.error('Error handling incoming comment', error);
  }
};

/**
 * Handle story mentions
 */
const handleStoryMention = async (_data) => {
  try {
    // This would be implemented for story mention handling
    logger.info('Story mention received (not yet implemented)');
  } catch (error) {
    logger.error('Error handling story mention', error);
  }
};

/**
 * Handle incoming Instagram DM
 */
const handleIncomingMessage = async (data) => {
  try {
    if (!data.messages || data.messages.length === 0) {
      return;
    }

    const message = data.messages[0];
    const senderId = message.from.id;
    const messageContent = message.text;
    const instagramMessageId = message.id;

    // Find account and conversation
    const account = await InstagramAccount.findOne({ instagramId: data.recipient.id });
    if (!account) {
      logger.warn(`Account not found for recipient ${data.recipient.id}`);
      return;
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      conversationId: data.conversation_id,
      account: account._id,
    });

    if (!conversation) {
      conversation = new Conversation({
        account: account._id,
        user: account.user,
        conversationId: data.conversation_id,
        participantId: senderId,
        participantUsername: message.from.username || 'Unknown',
      });
      await conversation.save();
    }

    // Create message record
    const newMessage = new Message({
      user: account.user,
      account: account._id,
      conversation: conversation._id,
      instagramMessageId,
      instagramSenderId: senderId,
      senderUsername: message.from.username || 'Unknown',
      content: messageContent,
      direction: 'incoming',
    });

    // Load rules for this account
    const rules = await AutomationRule.find({
      account: account._id,
      isActive: true,
    });

    await ruleEngine.loadRules(account._id.toString(), rules);

    // Match rules
    const matchedRules = ruleEngine.matchRules(account._id.toString(), messageContent);

      if (matchedRules.length > 0) {
      const rule = matchedRules[0];
      const response = ruleEngine.generateResponse(rule);

      if (response && response.type === 'predefined') {
        try {
          const accessToken = account.accessToken;
          await sendMessage(accessToken, senderId, response.content);

          newMessage.hasReply = true;
          newMessage.replyType = 'predefined';
          newMessage.replyContent = response.content;
          newMessage.automationRule = rule._id;
          newMessage.sentAt = new Date();

          rule.triggerCount += 1;
          rule.successCount += 1;
          rule.lastTriggered = new Date();
          await rule.save();

          // Increment user outgoing message usage
          try {
            const User = require('../models/User');
            const user = await User.findById(account.user);
            if (user) {
              await user.incrementMessages(1);
            }
          } catch (uErr) {
            logger.error('Error incrementing user message usage', uErr);
          }

          logger.info(`Automated reply sent for rule ${rule._id}`);
        } catch (error) {
          logger.error('Error sending automated reply', error);
          rule.failureCount += 1;
          await rule.save();
        }
      }
      // Handle AI replies (if rule requests AI response)
      if (response && response.type === 'ai') {
        try {
          // NOTE: AI generation service integration placeholder
          // For billing purposes, count AI reply usage even before sending
          const User = require('../models/User');
          const user = await User.findById(account.user);
          if (user) {
            await user.incrementAIReplies(1);
          }

          // The actual AI message sending pipeline should be implemented
          // (generate via LLM -> send via Instagram API)
        } catch (aiErr) {
          logger.error('Error handling AI reply usage', aiErr);
        }
      }
    }

    await newMessage.save();

    conversation.messageCount += 1;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    logger.info(`Message processed from ${senderId}`);
  } catch (error) {
    logger.error('Error handling incoming message', error);
  }
};

module.exports = router;
