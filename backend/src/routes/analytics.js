const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const AutomationRule = require('../models/AutomationRule');

const { authenticate } = require('../middleware/auth');

// Get dashboard overview metrics
router.get('/overview', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Messages sent in last 30 days
    const messagesSent = await Message.countDocuments({
      user: userId,
      direction: 'outgoing',
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Messages received
    const messagesReceived = await Message.countDocuments({
      user: userId,
      direction: 'incoming',
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Replies rate
    const incomingMessages = await Message.countDocuments({
      user: userId,
      direction: 'incoming',
      createdAt: { $gte: thirtyDaysAgo },
    });

    const repliedMessages = await Message.countDocuments({
      user: userId,
      direction: 'incoming',
      hasReply: true,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const repliesRate = incomingMessages > 0 ? (repliedMessages / incomingMessages) * 100 : 0;

    // Automation metrics
    const rules = await AutomationRule.find({ user: userId });
    const totalTriggers = rules.reduce((sum, rule) => sum + rule.triggerCount, 0);
    const totalSuccess = rules.reduce((sum, rule) => sum + rule.successCount, 0);
    const totalFailure = rules.reduce((sum, rule) => sum + rule.failureCount, 0);

    const automationSuccess =
      totalTriggers > 0 ? ((totalSuccess / totalTriggers) * 100).toFixed(2) : 0;

    return res.json({
      messagesSent,
      messagesReceived,
      repliesRate: parseFloat(repliesRate.toFixed(2)),
      automationSuccess: parseFloat(automationSuccess),
      totalTriggers,
      successCount: totalSuccess,
      failureCount: totalFailure,
      activeRules: rules.filter((r) => r.isActive).length,
      totalRules: rules.length,
    });
  } catch (error) {
    console.error('[Analytics] Overview error:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// Get messages sent over time
router.get('/messages-timeline', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    const daysInt = Math.min(parseInt(days), 365);
    const startDate = new Date(Date.now() - daysInt * 24 * 60 * 60 * 1000);

    const timeline = await Message.aggregate([
      {
        $match: {
          user: userId,
          direction: 'outgoing',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.json(timeline);
  } catch (error) {
    console.error('[Analytics] Messages timeline error:', error);
    return res.status(500).json({ error: 'Failed to fetch messages timeline' });
  }
});

// Get rule performance metrics
router.get('/rules-performance', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const rules = await AutomationRule.find({ user: userId }).select(
      'name isActive triggerCount successCount failureCount lastTriggered'
    );

    const performance = rules.map((rule) => ({
      id: rule._id,
      name: rule.name,
      isActive: rule.isActive,
      triggers: rule.triggerCount,
      success: rule.successCount,
      failure: rule.failureCount,
      successRate:
        rule.triggerCount > 0
          ? parseFloat(((rule.successCount / rule.triggerCount) * 100).toFixed(2))
          : 0,
      lastTriggered: rule.lastTriggered,
    }));

    return res.json(performance);
  } catch (error) {
    console.error('[Analytics] Rules performance error:', error);
    return res.status(500).json({ error: 'Failed to fetch rules performance' });
  }
});

// Get sentiment analysis
router.get('/sentiment', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    const daysInt = Math.min(parseInt(days), 365);
    const startDate = new Date(Date.now() - daysInt * 24 * 60 * 60 * 1000);

    const sentiment = await Message.aggregate([
      {
        $match: {
          user: userId,
          direction: 'incoming',
          createdAt: { $gte: startDate },
          sentiment: { $exists: true },
        },
      },
      {
        $group: {
          _id: '$sentiment',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = sentiment.reduce((sum, s) => sum + s.count, 0);
    const distribution = sentiment.map((s) => ({
      sentiment: s._id,
      count: s.count,
      percentage: total > 0 ? parseFloat((s.count / total * 100).toFixed(2)) : 0,
    }));

    return res.json(distribution);
  } catch (error) {
    console.error('[Analytics] Sentiment error:', error);
    return res.status(500).json({ error: 'Failed to fetch sentiment analysis' });
  }
});

// Get hourly activity
router.get('/hourly-activity', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 7 } = req.query;
    const daysInt = Math.min(parseInt(days), 90);
    const startDate = new Date(Date.now() - daysInt * 24 * 60 * 60 * 1000);

    const hourlyData = await Message.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $hour: '$createdAt',
          },
          incoming: {
            $sum: {
              $cond: [{ $eq: ['$direction', 'incoming'] }, 1, 0],
            },
          },
          outgoing: {
            $sum: {
              $cond: [{ $eq: ['$direction', 'outgoing'] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Fill in missing hours
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      incoming: 0,
      outgoing: 0,
    }));

    hourlyData.forEach((d) => {
      hours[d._id].incoming = d.incoming;
      hours[d._id].outgoing = d.outgoing;
    });

    return res.json(hours);
  } catch (error) {
    console.error('[Analytics] Hourly activity error:', error);
    return res.status(500).json({ error: 'Failed to fetch hourly activity' });
  }
});

// Get conversation stats
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    const daysInt = Math.min(parseInt(days), 365);
    const startDate = new Date(Date.now() - daysInt * 24 * 60 * 60 * 1000);

    const conversationStats = await Message.aggregate([
      {
        $match: {
          user: userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$conversation',
          messageCount: { $sum: 1 },
          incomingCount: {
            $sum: {
              $cond: [{ $eq: ['$direction', 'incoming'] }, 1, 0],
            },
          },
          outgoingCount: {
            $sum: {
              $cond: [{ $eq: ['$direction', 'outgoing'] }, 1, 0],
            },
          },
          lastMessage: { $max: '$createdAt' },
        },
      },
      {
        $sort: { messageCount: -1 },
      },
      {
        $limit: 20,
      },
    ]);

    return res.json(conversationStats);
  } catch (error) {
    console.error('[Analytics] Conversations error:', error);
    return res.status(500).json({ error: 'Failed to fetch conversation stats' });
  }
});

// Get response time metrics
router.get('/response-time', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    const daysInt = Math.min(parseInt(days), 365);
    const startDate = new Date(Date.now() - daysInt * 24 * 60 * 60 * 1000);

    // Get messages with time between incoming and reply
    const messages = await Message.find({
      user: userId,
      direction: 'outgoing',
      hasReply: true,
      createdAt: { $gte: startDate },
    }).select('createdAt');

    const avgResponseTime =
      messages.length > 0
        ? messages.reduce((sum, m) => sum + (m.createdAt ? m.createdAt.getTime() : 0), 0) /
          messages.length
        : 0;

    return res.json({
      averageResponseTimeMs: Math.round(avgResponseTime),
      averageResponseTimeMinutes: Math.round(avgResponseTime / 60000),
      messagesAnalyzed: messages.length,
    });
  } catch (error) {
    console.error('[Analytics] Response time error:', error);
    return res.status(500).json({ error: 'Failed to fetch response time metrics' });
  }
});

module.exports = router;
