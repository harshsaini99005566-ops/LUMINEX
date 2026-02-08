/**
 * Instagram Webhook Routes
 * Handles Meta webhook events (messages, status updates, etc.)
 */

const express = require('express');
const {
  verifyWebhookToken,
  verifyWebhookSignature,
  processWebhookEntry,
  validateWebhookPayload,
} = require('../services/webhookHandler');
const logger = require('../../utils/logger');

const router = express.Router();

/**
 * GET /webhooks/instagram
 * Called by Meta to verify webhook URL during setup
 * Meta sends: ?hub.mode=subscribe&hub.challenge=CHALLENGE&hub.verify_token=TOKEN
 */
router.get('/instagram', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  logger.info('[Webhook Verification] Request received', { mode });

  // Verify mode is 'subscribe'
  if (mode !== 'subscribe') {
    logger.error('[Webhook Verification] Invalid mode', { mode });
    return res.status(403).json({ error: 'Invalid mode' });
  }

  // Verify token matches configuration
  if (!verifyWebhookToken(token)) {
    logger.error('[Webhook Verification] Invalid token');
    return res.status(403).json({ error: 'Invalid token' });
  }

  logger.info('[Webhook Verification] Successful - returning challenge');
  res.status(200).send(challenge);
});

/**
 * POST /webhooks/instagram
 * Receives webhook events from Meta
 * Validates signature and processes:
 * - Incoming messages
 * - Delivery confirmations
 * - Read receipts
 * - Message echoes
 */
router.post('/instagram', async (req, res) => {
  try {
    // Step 1: Verify webhook signature
    const signature = req.headers['x-hub-signature-256'];
    const payload = req.rawBody || JSON.stringify(req.body);

    if (!verifyWebhookSignature(payload, signature)) {
      logger.error('[Webhook] Invalid signature - rejecting request');
      return res.status(403).json({ error: 'Invalid signature' });
    }

    // Step 2: Validate payload structure
    if (!validateWebhookPayload(req.body)) {
      logger.error('[Webhook] Invalid payload structure');
      return res.status(400).json({ error: 'Invalid payload' });
    }

    logger.info('[Webhook] Valid signature verified - processing events', {
      entryCount: req.body.entry?.length || 0,
    });

    // Step 3: Process all entries
    const { entry } = req.body;
    const allResults = [];

    for (const pageEntry of entry) {
      logger.info('[Webhook] Processing entry', {
        pageId: pageEntry.id,
        eventCount: pageEntry.messaging?.length || 0,
      });

      const entryResults = await processWebhookEntry(pageEntry);
      allResults.push(...entryResults);
    }

    // Step 4: Log results
    const successCount = allResults.filter((r) => r.status === 'success').length;
    const errorCount = allResults.filter((r) => r.status === 'error').length;

    logger.info('[Webhook] Processing complete', {
      totalEvents: allResults.length,
      successful: successCount,
      errors: errorCount,
    });

    // Always return 200 to acknowledge receipt (Meta requirement)
    // This prevents Meta from retrying the webhook
    res.status(200).json({
      status: 'ok',
      processedEvents: successCount,
      errors: errorCount,
    });
  } catch (error) {
    logger.error('[Webhook] Unexpected error:', error);
    // Still return 200 to prevent Meta from retrying
    res.status(200).json({
      status: 'error',
      message: 'Processing error',
    });
  }
});

module.exports = router;
