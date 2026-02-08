/**
 * Webhook Subscription Management Routes
 * Handles subscribing/unsubscribing accounts from webhook events
 */

const express = require('express');
const { authenticate } = require('../middleware/auth');
const InstagramAccount = require('../models/InstagramAccount');
const logger = require('../../utils/logger');
const metaApi = require('../services/metaApi');

const router = express.Router();

const WEBHOOK_FIELDS = [
  'messages',
  'message_echoes',
  'message_template_status_update',
  'message_deliveries',
  'messaging_handovers',
];

/**
 * GET /api/webhooks/subscription/status/:accountId
 * Check webhook subscription status
 */
router.get('/subscription/status/:accountId', authenticate, async (req, res) => {
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
      accountId: account._id,
      instagramUsername: account.username,
      webhookSubscribed: account.webhookSubscribed,
      webhookStatus: account.webhookSubscriptionStatus,
      subscriptionFields: account.webhookSubscriptionFields,
      lastSubscriptionTime: account.lastWebhookSubscriptionAt,
      isActive: account.isActive,
    });
  } catch (error) {
    logger.error('[Webhook Status] Error:', error);
    res.status(500).json({ error: 'Failed to get webhook status' });
  }
});

/**
 * POST /api/webhooks/subscription/subscribe/:accountId
 * Subscribe account to webhook events
 */
router.post('/subscription/subscribe/:accountId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;
    const { fields = WEBHOOK_FIELDS } = req.body;

    // Validate fields
    const invalidFields = fields.filter((f) => !WEBHOOK_FIELDS.includes(f));
    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: `Invalid webhook fields: ${invalidFields.join(', ')}`,
        validFields: WEBHOOK_FIELDS,
      });
    }

    const account = await InstagramAccount.findOne({
      _id: accountId,
      user: userId,
    }).select('+accessToken');

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    logger.info('[Webhook] Subscribing account', {
      accountId: account._id,
      instagramId: account.instagramId,
      fields,
    });

    try {
      // Get business account ID
      const businessAccountId = await metaApi.getBusinessAccountId(
        account.accessToken,
        account.instagramId
      );

      // Subscribe to webhook
      await subscribeToWebhookFields(account.accessToken, businessAccountId, fields);

      // Update account record
      account.webhookSubscribed = true;
      account.webhookSubscriptionStatus = 'active';
      account.webhookSubscriptionFields = fields;
      account.lastWebhookSubscriptionAt = new Date();
      await account.save();

      logger.info('[Webhook] Subscription successful', {
        accountId: account._id,
        businessAccountId,
      });

      res.json({
        success: true,
        message: 'Webhook subscription successful',
        accountId: account._id,
        fields: account.webhookSubscriptionFields,
        status: account.webhookSubscriptionStatus,
      });
    } catch (subscriptionError) {
      logger.error('[Webhook] Subscription failed:', subscriptionError.message);

      // Update account status to failed
      account.webhookSubscriptionStatus = 'failed';
      account.lastError = subscriptionError.message;
      account.lastErrorAt = new Date();
      await account.save();

      res.status(500).json({
        error: 'Failed to subscribe to webhooks',
        details: subscriptionError.message,
        retry: true,
      });
    }
  } catch (error) {
    logger.error('[Webhook Subscribe] Error:', error);
    res.status(500).json({ error: 'Failed to subscribe to webhooks' });
  }
});

/**
 * POST /api/webhooks/subscription/unsubscribe/:accountId
 * Unsubscribe account from webhook events
 */
router.post('/subscription/unsubscribe/:accountId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;

    const account = await InstagramAccount.findOne({
      _id: accountId,
      user: userId,
    }).select('+accessToken');

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    logger.info('[Webhook] Unsubscribing account', {
      accountId: account._id,
    });

    try {
      const businessAccountId = await metaApi.getBusinessAccountId(
        account.accessToken,
        account.instagramId
      );

      // Unsubscribe from webhook
      await unsubscribeFromWebhook(account.accessToken, businessAccountId);

      // Update account record
      account.webhookSubscribed = false;
      account.webhookSubscriptionStatus = 'inactive';
      account.lastWebhookSubscriptionAt = new Date();
      await account.save();

      logger.info('[Webhook] Unsubscription successful', {
        accountId: account._id,
      });

      res.json({
        success: true,
        message: 'Webhook unsubscription successful',
        accountId: account._id,
      });
    } catch (unsubscribeError) {
      logger.error('[Webhook] Unsubscription failed:', unsubscribeError.message);

      res.status(500).json({
        error: 'Failed to unsubscribe from webhooks',
        details: unsubscribeError.message,
      });
    }
  } catch (error) {
    logger.error('[Webhook Unsubscribe] Error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from webhooks' });
  }
});

/**
 * POST /api/webhooks/subscription/refresh/:accountId
 * Refresh webhook subscription (in case of failures)
 */
router.post('/subscription/refresh/:accountId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;

    const account = await InstagramAccount.findOne({
      _id: accountId,
      user: userId,
    }).select('+accessToken');

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    logger.info('[Webhook] Refreshing subscription', {
      accountId: account._id,
    });

    try {
      const businessAccountId = await metaApi.getBusinessAccountId(
        account.accessToken,
        account.instagramId
      );

      // First unsubscribe
      try {
        await unsubscribeFromWebhook(account.accessToken, businessAccountId);
        logger.info('[Webhook] Previous subscription cleared');
      } catch (error) {
        logger.warn('[Webhook] Could not clear previous subscription:', error.message);
      }

      // Then subscribe again
      await subscribeToWebhookFields(
        account.accessToken,
        businessAccountId,
        WEBHOOK_FIELDS
      );

      // Update account
      account.webhookSubscribed = true;
      account.webhookSubscriptionStatus = 'active';
      account.webhookSubscriptionFields = WEBHOOK_FIELDS;
      account.lastWebhookSubscriptionAt = new Date();
      account.errorCount = 0;
      account.lastError = null;
      await account.save();

      logger.info('[Webhook] Subscription refreshed successfully', {
        accountId: account._id,
      });

      res.json({
        success: true,
        message: 'Webhook subscription refreshed',
        accountId: account._id,
        fields: account.webhookSubscriptionFields,
      });
    } catch (refreshError) {
      logger.error('[Webhook] Refresh failed:', refreshError.message);

      // Increment error count
      account.errorCount += 1;
      account.lastError = refreshError.message;
      account.lastErrorAt = new Date();
      account.webhookSubscriptionStatus = 'failed';
      await account.save();

      res.status(500).json({
        error: 'Failed to refresh webhook subscription',
        details: refreshError.message,
        errorCount: account.errorCount,
      });
    }
  } catch (error) {
    logger.error('[Webhook Refresh] Error:', error);
    res.status(500).json({ error: 'Failed to refresh webhook subscription' });
  }
});

/**
 * Helper: Subscribe to webhook fields
 * @private
 */
const subscribeToWebhookFields = async (accessToken, businessAccountId, fields) => {
  const axios = require('axios');
  const API_VERSION = process.env.INSTAGRAM_API_VERSION || 'v18.0';
  const GRAPH_API = `https://graph.instagram.com/${API_VERSION}`;

  try {
    const response = await axios.post(
      `${GRAPH_API}/${businessAccountId}/subscribed_apps`,
      {},
      {
        params: {
          access_token: accessToken,
          subscribed_fields: fields.join(','),
        },
      }
    );

    logger.info('[Webhook] Fields subscription successful', {
      businessAccountId,
      fields,
    });

    return response.data;
  } catch (error) {
    logger.error('[Webhook] Subscription request failed:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Helper: Unsubscribe from webhook
 * @private
 */
const unsubscribeFromWebhook = async (accessToken, businessAccountId) => {
  const axios = require('axios');
  const API_VERSION = process.env.INSTAGRAM_API_VERSION || 'v18.0';
  const GRAPH_API = `https://graph.instagram.com/${API_VERSION}`;

  try {
    const response = await axios.delete(
      `${GRAPH_API}/${businessAccountId}/subscribed_apps`,
      {
        params: {
          access_token: accessToken,
        },
      }
    );

    logger.info('[Webhook] Unsubscription successful', { businessAccountId });
    return response.data;
  } catch (error) {
    logger.error(
      '[Webhook] Unsubscription request failed:',
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = router;
