/**
 * Webhook Service
 * Handles webhook verification, signature validation, and event processing
 * Implements Meta webhook security best practices
 */

const crypto = require('crypto');
const logger = require('../../utils/logger');
const InstagramAccount = require('../models/InstagramAccount');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

/**
 * Verify webhook token (called by Meta during configuration)
 * @param {string} token - Token from query parameter
 * @returns {boolean} True if token matches
 */
const verifyWebhookToken = (token) => {
  const expectedToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
  if (!expectedToken) {
    logger.error('[Webhook] INSTAGRAM_WEBHOOK_VERIFY_TOKEN not configured');
    return false;
  }
  return token === expectedToken;
};

/**
 * Verify webhook signature from Meta
 * Meta sends X-Hub-Signature-256 header with HMAC-SHA256 signature
 * @param {string} payload - Raw request payload (string)
 * @param {string} signature - X-Hub-Signature-256 header value
 * @returns {boolean} True if signature is valid
 */
const verifyWebhookSignature = (payload, signature) => {
  try {
    if (!signature) {
      logger.error('[Webhook Signature] Missing signature header');
      return false;
    }

    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    if (!appSecret) {
      logger.error('[Webhook Signature] INSTAGRAM_APP_SECRET not configured');
      return false;
    }

    // Generate HMAC-SHA256
    const hash = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex');

    // Signature format: sha256=hash
    const expectedSignature = `sha256=${hash}`;
    const providedSignature = signature.trim();

    // Use constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(providedSignature)
    );

    if (!isValid) {
      logger.warn('[Webhook Signature] Invalid signature detected - possible security threat');
    }

    return isValid;
  } catch (error) {
    logger.error('[Webhook Signature] Verification error:', error.message);
    return false;
  }
};

/**
 * Handle incoming webhook message
 * @param {Object} messageData - Message event from Meta
 * @returns {Promise<Object>} Processed message object
 */
const handleIncomingMessage = async (messageData) => {
  try {
    const { sender, recipient, message, timestamp } = messageData;

    logger.info('[Webhook] Processing message', {
      senderId: sender.id,
      recipientId: recipient.id,
      messageId: message.mid,
    });

    // Find account by recipient ID
    const account = await InstagramAccount.findOne({
      instagramId: recipient.id,
      isActive: true,
    }).select('+accessToken');

    if (!account) {
      logger.warn('[Webhook] Account not found', {
        recipientId: recipient.id,
      });
      return null;
    }

    // Create or update conversation
    const conversationId = `${sender.id}-${recipient.id}`;
    let conversation = await Conversation.findOne({
      account: account._id,
      instagramConversationId: conversationId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        account: account._id,
        user: account.user,
        instagramConversationId: conversationId,
        participantId: sender.id,
        participantUsername: message.from?.username || 'Unknown',
        lastMessageAt: new Date(timestamp * 1000),
        status: 'active',
      });

      logger.info('[Webhook] New conversation created', {
        conversationId: conversation._id,
      });
    } else {
      // Update last message timestamp
      conversation.lastMessageAt = new Date(timestamp * 1000);
      conversation.status = 'active';
      await conversation.save();
    }

    // Store message
    const savedMessage = await Message.create({
      conversation: conversation._id,
      account: account._id,
      sender: 'customer',
      instagramMessageId: message.mid,
      text: message.text || '',
      attachments: message.attachments || [],
      receivedAt: new Date(timestamp * 1000),
    });

    logger.info('[Webhook] Message stored', {
      messageId: savedMessage._id,
      conversationId: conversation._id,
    });

    return {
      message: savedMessage,
      conversation,
      account,
    };
  } catch (error) {
    logger.error('[Webhook] Error processing message:', error);
    throw error;
  }
};

/**
 * Handle message delivered confirmation
 * @param {Object} deliveryData - Delivery confirmation from Meta
 * @returns {Promise<void>}
 */
const handleDeliveryConfirmation = async (deliveryData) => {
  try {
    const { sender, delivery } = deliveryData;

    logger.info('[Webhook] Delivery confirmation', {
      senderId: sender.id,
      messageCount: delivery.mids?.length || 0,
    });

    // Update message delivery status in database
    if (delivery.mids && Array.isArray(delivery.mids)) {
      await Message.updateMany(
        { instagramMessageId: { $in: delivery.mids } },
        {
          status: 'delivered',
          deliveredAt: new Date(),
        }
      );

      logger.info('[Webhook] Updated delivery status for messages', {
        count: delivery.mids.length,
      });
    }
  } catch (error) {
    logger.error('[Webhook] Error handling delivery:', error);
    // Don't throw - this is not critical
  }
};

/**
 * Handle read receipt
 * @param {Object} readData - Read receipt from Meta
 * @returns {Promise<void>}
 */
const handleReadReceipt = async (readData) => {
  try {
    const { sender, read } = readData;

    logger.info('[Webhook] Read receipt', {
      senderId: sender.id,
      watermark: read.watermark,
    });

    // Update message read status
    await Message.updateMany(
      {
        receivedAt: { $lte: new Date(read.watermark * 1000) },
      },
      {
        status: 'read',
        readAt: new Date(),
      }
    );
  } catch (error) {
    logger.error('[Webhook] Error handling read receipt:', error);
    // Don't throw - this is not critical
  }
};

/**
 * Handle echo (message we sent)
 * @param {Object} messageData - Echo message data
 * @returns {Promise<void>}
 */
const handleMessageEcho = async (messageData) => {
  try {
    const { message } = messageData;

    logger.info('[Webhook] Message echo', {
      messageId: message.mid,
    });

    // Update our sent message with confirmation
    await Message.updateOne(
      { instagramMessageId: message.mid },
      {
        status: 'sent',
        sentAt: new Date(message.created_timestamp * 1000),
      }
    );
  } catch (error) {
    logger.error('[Webhook] Error handling echo:', error);
    // Don't throw - this is not critical
  }
};

/**
 * Process all webhook events from a single entry
 * @param {Object} entry - Entry object from webhook payload
 * @returns {Promise<Array>} Array of processed events
 */
const processWebhookEntry = async (entry) => {
  const results = [];

  try {
    if (!entry.messaging || !Array.isArray(entry.messaging)) {
      return results;
    }

    for (const messagingEvent of entry.messaging) {
      try {
        // Handle incoming messages (excluding echoes)
        if (messagingEvent.message && !messagingEvent.message.is_echo) {
          const result = await handleIncomingMessage({
            sender: messagingEvent.sender,
            recipient: messagingEvent.recipient,
            message: messagingEvent.message,
            timestamp: messagingEvent.timestamp,
          });
          results.push({
            type: 'message',
            status: 'success',
            data: result,
          });
        }

        // Handle message echoes
        if (messagingEvent.message?.is_echo) {
          await handleMessageEcho({
            sender: messagingEvent.sender,
            recipient: messagingEvent.recipient,
            message: messagingEvent.message,
            timestamp: messagingEvent.timestamp,
          });
          results.push({
            type: 'echo',
            status: 'success',
          });
        }

        // Handle delivery confirmations
        if (messagingEvent.delivery) {
          await handleDeliveryConfirmation({
            sender: messagingEvent.sender,
            recipient: messagingEvent.recipient,
            delivery: messagingEvent.delivery,
          });
          results.push({
            type: 'delivery',
            status: 'success',
          });
        }

        // Handle read receipts
        if (messagingEvent.read) {
          await handleReadReceipt({
            sender: messagingEvent.sender,
            recipient: messagingEvent.recipient,
            read: messagingEvent.read,
          });
          results.push({
            type: 'read',
            status: 'success',
          });
        }

        // Handle typing events (optional)
        if (messagingEvent.typing) {
          logger.info('[Webhook] Typing event', {
            senderId: messagingEvent.sender.id,
          });
        }
      } catch (eventError) {
        logger.error('[Webhook] Error processing event:', eventError);
        results.push({
          type: messagingEvent.message ? 'message' : 'other',
          status: 'error',
          error: eventError.message,
        });
        // Continue processing other events
      }
    }
  } catch (error) {
    logger.error('[Webhook] Error processing entry:', error);
  }

  return results;
};

/**
 * Validate webhook payload structure
 * @param {Object} body - Request body
 * @returns {boolean} True if valid
 */
const validateWebhookPayload = (body) => {
  if (!body || typeof body !== 'object') {
    logger.error('[Webhook] Invalid payload type');
    return false;
  }

  if (body.object !== 'instagram') {
    logger.error('[Webhook] Invalid object type:', body.object);
    return false;
  }

  if (!Array.isArray(body.entry)) {
    logger.error('[Webhook] Missing or invalid entry array');
    return false;
  }

  return true;
};

module.exports = {
  verifyWebhookToken,
  verifyWebhookSignature,
  handleIncomingMessage,
  handleDeliveryConfirmation,
  handleReadReceipt,
  handleMessageEcho,
  processWebhookEntry,
  validateWebhookPayload,
};
