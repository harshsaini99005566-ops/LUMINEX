/**
 * ConversationService - Handles conversation management and retrieval
 * Manages conversation list, message history, and automation toggling
 */

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const logger = require('../../utils/logger');

class ConversationService {
  /**
   * Get all conversations for account with filters and pagination
   */
  async getConversations(userId, accountId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        filter = 'all', // all, unread, archived, spam
        sortBy = 'updated', // updated, unread, messageCount
      } = options;

      const skip = (page - 1) * limit;
      const query = { user: userId, account: accountId };

      // Apply filter
      if (filter === 'unread') {
        query.unreadCount = { $gt: 0 };
      } else if (filter === 'spam') {
        query.isSpam = true;
      } else if (filter === 'priority') {
        query.isPriority = true;
      }

      // Apply search
      if (search) {
        query.$or = [
          { participantUsername: { $regex: search, $options: 'i' } },
          { tags: { $in: [search.toLowerCase()] } },
        ];
      }

      // Build sort object
      let sortObj = {};
      if (sortBy === 'updated') {
        sortObj = { updatedAt: -1 };
      } else if (sortBy === 'unread') {
        sortObj = { unreadCount: -1, updatedAt: -1 };
      } else if (sortBy === 'messageCount') {
        sortObj = { messageCount: -1 };
      }

      // Get conversations
      const conversations = await Conversation.find(query)
        .sort(sortObj)
        .limit(limit)
        .skip(skip)
        .lean();

      // Get total count
      const total = await Conversation.countDocuments(query);

      // Enhance with latest message preview
      const enhanced = await Promise.all(
        conversations.map(async (conv) => {
          const latestMessage = await Message.findOne({
            conversation: conv._id,
          })
            .sort({ createdAt: -1 })
            .lean();

          return {
            ...conv,
            latestMessage: latestMessage ? {
              content: latestMessage.content,
              direction: latestMessage.direction,
              createdAt: latestMessage.createdAt,
            } : null,
          };
        })
      );

      return {
        success: true,
        conversations: enhanced,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching conversations', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get conversation details with message history
   */
  async getConversationWithMessages(
    userId,
    accountId,
    conversationId,
    messageOptions = {}
  ) {
    try {
      const { page = 1, limit = 50 } = messageOptions;
      const skip = (page - 1) * limit;

      // Get conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId,
        account: accountId,
      }).lean();

      if (!conversation) {
        return {
          success: false,
          error: 'Conversation not found',
        };
      }

      // Get messages with pagination
      const messages = await Message.find({
        conversation: conversationId,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      const totalMessages = await Message.countDocuments({
        conversation: conversationId,
      });

      // Reverse messages for chronological order (oldest first)
      const orderedMessages = messages.reverse();

      // Mark as read
      await Conversation.updateOne(
        { _id: conversationId },
        { unreadCount: 0, lastMessageAt: new Date() }
      );

      return {
        success: true,
        conversation: {
          ...conversation,
          automationEnabled: conversation.automationEnabled !== false,
        },
        messages: orderedMessages,
        pagination: {
          page,
          limit,
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit),
        },
      };
    } catch (error) {
      logger.error('Error fetching conversation with messages', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send manual reply
   */
  async sendManualReply(userId, accountId, conversationId, messageText, _context = {}) {
    try {
      // Verify conversation exists
      const conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId,
        account: accountId,
      });

      if (!conversation) {
        return {
          success: false,
          error: 'Conversation not found',
        };
      }

      // Create message record
      const message = await Message.create({
        user: userId,
        account: accountId,
        conversation: conversationId,
        content: messageText,
        direction: 'outgoing',
        type: 'text',
        replyType: 'manual',
        sentiment: 'neutral',
        sentAt: new Date(),
      });

      // Update conversation
      await Conversation.updateOne(
        { _id: conversationId },
        {
          manualReplies: conversation.manualReplies + 1,
          lastReplyAt: new Date(),
          $inc: { messageCount: 1 },
        }
      );

      logger.info(`Manual reply sent to conversation ${conversationId}`);

      return {
        success: true,
        message: message.toObject(),
      };
    } catch (error) {
      logger.error('Error sending manual reply', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Toggle automation for conversation
   */
  async toggleAutomation(userId, accountId, conversationId, enabled) {
    try {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId,
        account: accountId,
      });

      if (!conversation) {
        return {
          success: false,
          error: 'Conversation not found',
        };
      }

      const updated = await Conversation.findByIdAndUpdate(
        conversationId,
        { automationEnabled: enabled },
        { new: true }
      ).lean();

      logger.info(
        `Automation ${enabled ? 'enabled' : 'disabled'} for conversation ${conversationId}`
      );

      return {
        success: true,
        conversation: updated,
        automationEnabled: updated.automationEnabled,
      };
    } catch (error) {
      logger.error('Error toggling automation', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Mark conversation as spam
   */
  async markAsSpam(userId, accountId, conversationId, isSpam = true) {
    try {
      const updated = await Conversation.findOneAndUpdate(
        {
          _id: conversationId,
          user: userId,
          account: accountId,
        },
        { isSpam },
        { new: true }
      ).lean();

      if (!updated) {
        return {
          success: false,
          error: 'Conversation not found',
        };
      }

      logger.info(
        `Conversation ${conversationId} marked as ${isSpam ? 'spam' : 'not spam'}`
      );

      return {
        success: true,
        conversation: updated,
      };
    } catch (error) {
      logger.error('Error marking as spam', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Mark conversation as priority
   */
  async markAsPriority(userId, accountId, conversationId, isPriority = true) {
    try {
      const updated = await Conversation.findOneAndUpdate(
        {
          _id: conversationId,
          user: userId,
          account: accountId,
        },
        { isPriority },
        { new: true }
      ).lean();

      if (!updated) {
        return {
          success: false,
          error: 'Conversation not found',
        };
      }

      logger.info(
        `Conversation ${conversationId} marked as ${isPriority ? 'priority' : 'normal'}`
      );

      return {
        success: true,
        conversation: updated,
      };
    } catch (error) {
      logger.error('Error marking as priority', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Add tags to conversation
   */
  async addTags(userId, accountId, conversationId, tags = []) {
    try {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId,
        account: accountId,
      });

      if (!conversation) {
        return {
          success: false,
          error: 'Conversation not found',
        };
      }

      const uniqueTags = [
        ...new Set([...(conversation.tags || []), ...tags.map((t) => t.toLowerCase())]),
      ];

      const updated = await Conversation.findByIdAndUpdate(
        conversationId,
        { tags: uniqueTags },
        { new: true }
      ).lean();

      logger.info(`Tags added to conversation ${conversationId}`);

      return {
        success: true,
        conversation: updated,
        tags: updated.tags,
      };
    } catch (error) {
      logger.error('Error adding tags', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Remove tags from conversation
   */
  async removeTags(userId, accountId, conversationId, tags = []) {
    try {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        user: userId,
        account: accountId,
      });

      if (!conversation) {
        return {
          success: false,
          error: 'Conversation not found',
        };
      }

      const tagsToRemove = new Set(tags.map((t) => t.toLowerCase()));
      const updatedTags = (conversation.tags || []).filter((t) => !tagsToRemove.has(t));

      const updated = await Conversation.findByIdAndUpdate(
        conversationId,
        { tags: updatedTags },
        { new: true }
      ).lean();

      logger.info(`Tags removed from conversation ${conversationId}`);

      return {
        success: true,
        conversation: updated,
        tags: updated.tags,
      };
    } catch (error) {
      logger.error('Error removing tags', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(userId, accountId) {
    try {
      const conversations = await Conversation.find({
        user: userId,
        account: accountId,
      }).lean();

      const stats = {
        total: conversations.length,
        active: conversations.filter((c) => c.isActive).length,
        archived: conversations.filter((c) => !c.isActive).length,
        spam: conversations.filter((c) => c.isSpam).length,
        priority: conversations.filter((c) => c.isPriority).length,
        unread: conversations.filter((c) => c.unreadCount > 0).length,
        totalMessages: conversations.reduce((sum, c) => sum + (c.messageCount || 0), 0),
        totalAutomatedReplies: conversations.reduce(
          (sum, c) => sum + (c.automatedReplies || 0),
          0
        ),
        totalManualReplies: conversations.reduce(
          (sum, c) => sum + (c.manualReplies || 0),
          0
        ),
      };

      return {
        success: true,
        stats,
      };
    } catch (error) {
      logger.error('Error fetching conversation stats', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Search conversations
   */
  async searchConversations(userId, accountId, query, limit = 10) {
    try {
      const conversations = await Conversation.find(
        {
          user: userId,
          account: accountId,
          $text: { $search: query },
        },
        {
          score: { $meta: 'textScore' },
        }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();

      return {
        success: true,
        conversations,
        count: conversations.length,
      };
    } catch (error) {
      // Fallback to regex search if text search fails
      try {
        const conversations = await Conversation.find({
          user: userId,
          account: accountId,
          $or: [
            { participantUsername: { $regex: query, $options: 'i' } },
            { tags: { $in: [query.toLowerCase()] } },
          ],
        })
          .limit(limit)
          .lean();

        return {
          success: true,
          conversations,
          count: conversations.length,
        };
      } catch (fallbackError) {
        logger.error('Error searching conversations', fallbackError);
        return {
          success: false,
          error: fallbackError.message,
        };
      }
    }
  }

  /**
   * Get recent conversations (last 7 days)
   */
  async getRecentConversations(userId, accountId, limit = 20) {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const conversations = await Conversation.find({
        user: userId,
        account: accountId,
        updatedAt: { $gte: sevenDaysAgo },
      })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .lean();

      return {
        success: true,
        conversations,
        count: conversations.length,
      };
    } catch (error) {
      logger.error('Error fetching recent conversations', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Archive conversation
   */
  async archiveConversation(userId, accountId, conversationId) {
    try {
      const updated = await Conversation.findOneAndUpdate(
        {
          _id: conversationId,
          user: userId,
          account: accountId,
        },
        { isActive: false },
        { new: true }
      ).lean();

      if (!updated) {
        return {
          success: false,
          error: 'Conversation not found',
        };
      }

      logger.info(`Conversation ${conversationId} archived`);

      return {
        success: true,
        conversation: updated,
      };
    } catch (error) {
      logger.error('Error archiving conversation', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Unarchive conversation
   */
  async unarchiveConversation(userId, accountId, conversationId) {
    try {
      const updated = await Conversation.findOneAndUpdate(
        {
          _id: conversationId,
          user: userId,
          account: accountId,
        },
        { isActive: true },
        { new: true }
      ).lean();

      if (!updated) {
        return {
          success: false,
          error: 'Conversation not found',
        };
      }

      logger.info(`Conversation ${conversationId} unarchived`);

      return {
        success: true,
        conversation: updated,
      };
    } catch (error) {
      logger.error('Error unarchiving conversation', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new ConversationService();
