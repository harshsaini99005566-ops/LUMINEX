/**
 * Instagram OAuth Routes
 * Handles OAuth flow, token management, and account connection
 */

const express = require('express');
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');
const { checkAccountLimit } = require('../middleware/subscription');
const {
  generateAuthUrl,
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  refreshLongLivedToken,
  getBusinessAccountInfo,
  subscribeToWebhook,
  sendInstagramMessage,
  getConversations,
} = require('../services/instagramOAuth');

const { config } = require('../config/env');
const InstagramAccount = require('../models/InstagramAccount');
const User = require('../models/User');
const logger = require('../../utils/logger');

const router = express.Router();

/**
 * GET /api/instagram/auth/url
 * Generate and return the OAuth authorization URL
 * Frontend redirects user to this URL
 */
router.get('/auth/url', async (req, res) => {
  try {
    // TEMPORARY TESTING MODE - allow unauthenticated requests
    const userId = req.user?.id || 'test-user-' + Date.now();

    // Generate CSRF state token
    const state = crypto.randomBytes(16).toString('hex');

    // Compute expiry and save state+expiry in user document
    const stateExpiresAt = new Date(Date.now() + config.instagram.stateTtlMs);

    // Only update user if authenticated
    if (req.user?.id) {
      await User.findByIdAndUpdate(userId, {
        instagramOAuthState: state,
        instagramOAuthStateExpires: stateExpiresAt,
      });
    }

    logger.info('[OAuth] Saved oauth state for user', {
      userId,
      stateSnippet: `${state.substring(0, 8)}...`,
      expiresAt: stateExpiresAt.toISOString(),
      isTestUser: !req.user,
    });

    const authUrl = generateAuthUrl(state);

    logger.info('[OAuth] Auth URL generated', { userId });

    res.json({
      url: authUrl,
      state,
      isTestUser: !req.user,
    });
  } catch (error) {
    logger.error('[OAuth] Failed to generate URL', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

/**
 * GET /api/instagram/auth/callback
 * OAuth callback from Meta after user authorizes
 * Query params: code, state
 * NOTE: This endpoint must NOT require an Authorization header because Meta will redirect the user's browser here.
 * We look up the originating user by the saved `instagramOAuthState`.
 */
router.get('/auth/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    logger.info('[OAuth Callback] Received', { code: code?.substring(0, 10), state: state?.substring(0, 10) });

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }

    // Find the user that initiated this OAuth flow by matching the stored state and ensuring it hasn't expired
    const user = await User.findOne({
      instagramOAuthState: state,
      instagramOAuthStateExpires: { $gt: new Date() },
    });

    if (!user) {
      // If a record exists but the expiry passed, log an explicit message to aid debugging
      const expiredUser = await User.findOne({ instagramOAuthState: state });
      if (expiredUser) {
        logger.warn('[OAuth Callback] Found user for state but state has expired', {
          userId: expiredUser._id,
          stateSnippet: `${state.substring(0, 8)}...`,
          expiredAt: expiredUser.instagramOAuthStateExpires?.toISOString(),
        });
      } else {
        logger.error('[OAuth Callback] No user found for state', { stateSnippet: `${state.substring(0, 8)}...` });
      }

      // Redirect to frontend with a helpful error message
      const errorUrl = new URL(`${process.env.FRONTEND_URL}/dashboard/accounts`);
      errorUrl.searchParams.append('error', 'Invalid or expired state parameter');
      return res.redirect(errorUrl.toString());
    }

    const userId = user._id;

    // Exchange code for SHORT-LIVED token (expires in 1 hour)
    const { accessToken: shortLivedToken, instagramId } = await exchangeCodeForToken(code);

    logger.info('[OAuth Callback] Short-lived token obtained', { instagramId });

    // CRITICAL: Exchange short-lived token for LONG-LIVED token (expires in 60 days)
    const { accessToken: longLivedToken, expiresIn } = await exchangeForLongLivedToken(shortLivedToken);
    
    // Calculate expiration date
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    logger.info('[OAuth Callback] Long-lived token obtained', { 
      expiresAt: tokenExpiresAt.toISOString(),
      expiresInDays: Math.floor(expiresIn / (60 * 60 * 24))
    });

    // Get account info (use long-lived token)
    const accountInfo = await getBusinessAccountInfo(longLivedToken, instagramId);

    // Check if account already connected
    let account = await InstagramAccount.findOne({
      user: userId,
      instagramId,
    });

    if (account) {
      // Update existing account
      account.accessToken = longLivedToken;
      account.tokenExpiresAt = tokenExpiresAt;
      account.username = accountInfo.username;
      account.name = accountInfo.name;
      account.profilePicture = accountInfo.profile_picture_url;
      account.followersCount = accountInfo.followers_count || 0;
      account.websiteUrl = accountInfo.website || '';
      account.isActive = true;
      account.lastTokenRefresh = new Date();
      await account.save();

      logger.info('[OAuth Callback] Account updated', { accountId: account._id });
    } else {
      // Create new account
      account = await InstagramAccount.create({
        user: userId,
        instagramId,
        username: accountInfo.username,
        name: accountInfo.name,
        profilePicture: accountInfo.profile_picture_url,
        followersCount: accountInfo.followers_count || 0,
        websiteUrl: accountInfo.website || '',
        accessToken: longLivedToken,
        tokenExpiresAt: tokenExpiresAt,
        isActive: true,
        connectedAt: new Date(),
        lastTokenRefresh: new Date(),
        syncStatus: 'synced',
      });

      logger.info('[OAuth Callback] New account created', { accountId: account._id });
    }

    // Subscribe to webhooks
    try {
      await subscribeToWebhook(longLivedToken, instagramId);
      logger.info('[OAuth Callback] Webhook subscribed');
    } catch (error) {
      logger.warn('[OAuth Callback] Webhook subscription failed', error.message);
      // Don't fail the whole flow - account is still connected
    }

    // Clear OAuth state and expiry on the user record
    user.instagramOAuthState = null;
    user.instagramOAuthStateExpires = null;
    await user.save();

    logger.info('[OAuth] Cleared OAuth state for user', { userId });

    // Redirect to success page with account info
    const successUrl = new URL(`${process.env.FRONTEND_URL}/dashboard/accounts`);
    successUrl.searchParams.append('connected', 'true');
    successUrl.searchParams.append('accountId', account._id);
    successUrl.searchParams.append('username', account.username);

    res.redirect(successUrl.toString());
  } catch (error) {
    logger.error('[OAuth Callback] Error', error);

    // Redirect to error page
    const errorUrl = new URL(`${process.env.FRONTEND_URL}/dashboard/accounts`);
    errorUrl.searchParams.append('error', 'Failed to connect Instagram account');
    res.redirect(errorUrl.toString());
  }
});

/**
 * GET /api/instagram/accounts
 * List all connected Instagram accounts for user
 */
router.get('/accounts', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const accounts = await InstagramAccount.find({
      user: userId,
      isActive: true,
    }).select('-accessToken');

    res.json({
      accounts,
      count: accounts.length,
    });
  } catch (error) {
    logger.error('[Get Accounts] Error', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

/**
 * GET /api/instagram/accounts/:accountId
 * Get details for a specific account
 */
router.get('/accounts/:accountId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;

    const account = await InstagramAccount.findOne({
      _id: accountId,
      user: userId,
    }).select('-accessToken');

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ account });
  } catch (error) {
    logger.error('[Get Account] Error', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

/**
 * DELETE /api/instagram/accounts/:accountId
 * Disconnect an Instagram account
 */
router.delete('/accounts/:accountId', authenticate, async (req, res) => {
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

    account.isActive = false;
    await account.save();

    logger.info('[Disconnect Account] Success', { accountId });

    res.json({ message: 'Account disconnected' });
  } catch (error) {
    logger.error('[Disconnect Account] Error', error);
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
});

/**
 * POST /api/instagram/accounts/:accountId/messages
 * Send a message through Instagram DM
 */
router.post('/accounts/:accountId/messages', authenticate, checkAccountLimit, async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;
    const { recipientId, message } = req.body;

    if (!recipientId || !message) {
      return res.status(400).json({ error: 'Missing recipientId or message' });
    }

    const account = await InstagramAccount.findOne({
      _id: accountId,
      userId,
      isActive: true,
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Send message
    const result = await sendInstagramMessage(account, recipientId, message);

    logger.info('[Send Message] Success', { accountId, messageId: result.message_id });

    res.json({
      message: 'Message sent',
      messageId: result.message_id,
    });
  } catch (error) {
    logger.error('[Send Message] Error', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * GET /api/instagram/accounts/:accountId/conversations
 * Get all conversations for an account
 */
router.get('/accounts/:accountId/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountId } = req.params;

    const account = await InstagramAccount.findOne({
      _id: accountId,
      userId,
      isActive: true,
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Get conversations from Meta API
    const conversations = await getConversations(account);

    logger.info('[Get Conversations] Success', { accountId, count: conversations.length });

    res.json({ conversations });
  } catch (error) {
    logger.error('[Get Conversations] Error', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

module.exports = router;
