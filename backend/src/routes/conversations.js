/**
 * Conversation API Routes
 * RESTful endpoints for inbox management, message history, and replies
 */

const express = require('express');
const router = express.Router();
const conversationService = require('../services/conversationService');
const logger = require('../../utils/logger');

/**
 * GET /api/conversations
 * Get list of conversations with filters
 */
router.get('/', async (req, res) => {
  try {
    const { accountId } = req.query;
    const userId = req.user?.id;

    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      search: req.query.search || '',
      filter: req.query.filter || 'all',
      sortBy: req.query.sortBy || 'updated',
    };

    const result = await conversationService.getConversations(
      userId,
      accountId,
      options
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    logger.error('Error getting conversations', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

/**
 * GET /api/conversations/recent
 * Get recent conversations
 */
router.get('/recent', async (req, res) => {
  try {
    const { accountId } = req.query;
    const userId = req.user?.id;

    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const limit = parseInt(req.query.limit) || 20;

    const result = await conversationService.getRecentConversations(
      userId,
      accountId,
      limit
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    logger.error('Error getting recent conversations', error);
    res.status(500).json({ error: 'Failed to fetch recent conversations' });
  }
});

/**
 * GET /api/conversations/stats
 * Get conversation statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const { accountId } = req.query;
    const userId = req.user?.id;

    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const result = await conversationService.getConversationStats(userId, accountId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    logger.error('Error getting conversation stats', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * GET /api/conversations/search
 * Search conversations
 */
router.get('/search', async (req, res) => {
  try {
    const { accountId, q } = req.query;
    const userId = req.user?.id;

    if (!accountId || !q) {
      return res.status(400).json({ error: 'accountId and q are required' });
    }

    const limit = parseInt(req.query.limit) || 10;

    const result = await conversationService.searchConversations(
      userId,
      accountId,
      q,
      limit
    );

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    logger.error('Error searching conversations', error);
    res.status(500).json({ error: 'Failed to search conversations' });
  }
});

/**
 * GET /api/conversations/:conversationId
 * Get conversation with message history
 */
router.get('/:conversationId', async (req, res) => {
  try {
    const { accountId } = req.query;
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const messageOptions = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 50,
    };

    const result = await conversationService.getConversationWithMessages(
      userId,
      accountId,
      conversationId,
      messageOptions
    );

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    logger.error('Error getting conversation', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

/**
 * POST /api/conversations/:conversationId/reply
 * Send manual reply
 */
router.post('/:conversationId/reply', async (req, res) => {
  try {
    const { accountId, content } = req.body;
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!accountId || !content) {
      return res.status(400).json({ error: 'accountId and content are required' });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (content.length > 4096) {
      return res.status(400).json({ error: 'Message is too long (max 4096 characters)' });
    }

    const result = await conversationService.sendManualReply(
      userId,
      accountId,
      conversationId,
      content.trim(),
      {
        userAgent: req.get('user-agent'),
      }
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data: result.message,
    });
  } catch (error) {
    logger.error('Error sending reply', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

/**
 * PATCH /api/conversations/:conversationId/automation
 * Toggle automation for conversation
 */
router.patch('/:conversationId/automation', async (req, res) => {
  try {
    const { accountId, enabled } = req.body;
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!accountId || enabled === undefined) {
      return res.status(400).json({ error: 'accountId and enabled are required' });
    }

    const result = await conversationService.toggleAutomation(
      userId,
      accountId,
      conversationId,
      enabled
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: `Automation ${enabled ? 'enabled' : 'disabled'}`,
      automationEnabled: result.automationEnabled,
    });
  } catch (error) {
    logger.error('Error toggling automation', error);
    res.status(500).json({ error: 'Failed to toggle automation' });
  }
});

/**
 * PATCH /api/conversations/:conversationId/spam
 * Mark as spam
 */
router.patch('/:conversationId/spam', async (req, res) => {
  try {
    const { accountId, isSpam } = req.body;
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!accountId || isSpam === undefined) {
      return res.status(400).json({ error: 'accountId and isSpam are required' });
    }

    const result = await conversationService.markAsSpam(
      userId,
      accountId,
      conversationId,
      isSpam
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: `Marked as ${isSpam ? 'spam' : 'not spam'}`,
      isSpam,
    });
  } catch (error) {
    logger.error('Error marking as spam', error);
    res.status(500).json({ error: 'Failed to mark as spam' });
  }
});

/**
 * PATCH /api/conversations/:conversationId/priority
 * Mark as priority
 */
router.patch('/:conversationId/priority', async (req, res) => {
  try {
    const { accountId, isPriority } = req.body;
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!accountId || isPriority === undefined) {
      return res.status(400).json({ error: 'accountId and isPriority are required' });
    }

    const result = await conversationService.markAsPriority(
      userId,
      accountId,
      conversationId,
      isPriority
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: `Marked as ${isPriority ? 'priority' : 'normal'}`,
      isPriority,
    });
  } catch (error) {
    logger.error('Error marking as priority', error);
    res.status(500).json({ error: 'Failed to mark as priority' });
  }
});

/**
 * POST /api/conversations/:conversationId/tags
 * Add tags
 */
router.post('/:conversationId/tags', async (req, res) => {
  try {
    const { accountId, tags } = req.body;
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!accountId || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'accountId and tags array are required' });
    }

    const result = await conversationService.addTags(
      userId,
      accountId,
      conversationId,
      tags
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Tags added successfully',
      tags: result.tags,
    });
  } catch (error) {
    logger.error('Error adding tags', error);
    res.status(500).json({ error: 'Failed to add tags' });
  }
});

/**
 * DELETE /api/conversations/:conversationId/tags
 * Remove tags
 */
router.delete('/:conversationId/tags', async (req, res) => {
  try {
    const { accountId, tags } = req.body;
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!accountId || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'accountId and tags array are required' });
    }

    const result = await conversationService.removeTags(
      userId,
      accountId,
      conversationId,
      tags
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Tags removed successfully',
      tags: result.tags,
    });
  } catch (error) {
    logger.error('Error removing tags', error);
    res.status(500).json({ error: 'Failed to remove tags' });
  }
});

/**
 * PATCH /api/conversations/:conversationId/archive
 * Archive conversation
 */
router.patch('/:conversationId/archive', async (req, res) => {
  try {
    const { accountId } = req.body;
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const result = await conversationService.archiveConversation(
      userId,
      accountId,
      conversationId
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Conversation archived',
    });
  } catch (error) {
    logger.error('Error archiving conversation', error);
    res.status(500).json({ error: 'Failed to archive conversation' });
  }
});

/**
 * PATCH /api/conversations/:conversationId/unarchive
 * Unarchive conversation
 */
router.patch('/:conversationId/unarchive', async (req, res) => {
  try {
    const { accountId } = req.body;
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!accountId) {
      return res.status(400).json({ error: 'accountId is required' });
    }

    const result = await conversationService.unarchiveConversation(
      userId,
      accountId,
      conversationId
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      message: 'Conversation unarchived',
    });
  } catch (error) {
    logger.error('Error unarchiving conversation', error);
    res.status(500).json({ error: 'Failed to unarchive conversation' });
  }
});

module.exports = router;
