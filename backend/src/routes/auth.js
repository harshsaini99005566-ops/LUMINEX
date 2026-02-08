const express = require('express');
const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');
const { authenticate } = require('../middleware/auth');
const { config } = require('../config/env');
const axios = require('axios');

const User = require('../models/User');
const Subscription = require('../models/Subscription');
const InstagramAccount = require('../models/InstagramAccount');

const router = express.Router();

/**
 * Signup new user (primary endpoint)
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    logger.info(`[Signup] Received signup request for email: ${email}`);
    logger.info(`[Signup] Request body:`, {
      email,
      firstName,
      lastName,
      passwordLength: password ? password.length : 0,
    });

    // Validation
    if (!email || !password || !firstName || !lastName) {
      logger.warn(`[Signup] Validation failed - missing required fields`);
      return res.status(400).json({ error: 'Email, password, first name, and last name are required' });
    }

    if (password.length < 8) {
      logger.warn(`[Signup] Password too short for email: ${email}`);
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      logger.warn(`[Signup] Invalid email format: ${email}`);
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`[Signup] Email already registered: ${email}`);
      return res.status(400).json({ error: 'Email already registered' });
    }

    logger.info(`[Signup] Creating new user account for: ${email}`);

    const user = new User({
      email,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      plan: 'free',
    });

    await user.save();
    logger.info(`[Signup] User saved to database: ${user._id}`);

    const subscription = new Subscription({
      user: user._id,
      plan: 'free',
      status: 'active',
    });

    await subscription.save();
    logger.info(`[Signup] Subscription created for user: ${user._id}`);

    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );

    const decodedToken = jwt.decode(token) || {};
    const tokenExpiresAt = decodedToken.exp ? new Date(decodedToken.exp * 1000) : null;

    logger.info(`[Signup] JWT token generated for user: ${email}, expiresAt=${tokenExpiresAt?.toISOString()}`);

    // Set HttpOnly cookie with SameSite=lax for session persistence
    try {
      const cookieOptions = {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.nodeEnv === 'production',
        maxAge: tokenExpiresAt ? tokenExpiresAt.getTime() - Date.now() : undefined,
        path: '/',
      };
      res.cookie('token', token, cookieOptions);
      logger.info('[Signup] Set session cookie (httpOnly, SameSite=lax)');
    } catch (cookieErr) {
      logger.warn('[Signup] Failed to set session cookie', { error: cookieErr.message });
    }

    const responseData = {
      message: 'Account created successfully',
      token,
      tokenExpiresAt: tokenExpiresAt ? tokenExpiresAt.toISOString() : null,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: 'free',
      },
    };

    logger.info(`[Signup] Signup successful for: ${email}`);
    res.status(201).json(responseData);
  } catch (error) {
    logger.error(`[Signup] Error during signup:`, error);
    next(error);
  }
});

/**
 * Register new user (legacy endpoint for backward compatibility)
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      plan: 'free',
    });

    await user.save();

    const subscription = new Subscription({
      user: user._id,
      plan: 'free',
      status: 'active',
    });

    await subscription.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      message: 'Account created',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName,
        lastName,
        plan: 'free',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Login user
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    logger.info(`[Login] Attempt for email: ${email}`);

    if (!email || !password) {
      logger.warn('[Login] Missing email or password');
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      logger.warn(`[Login] Failed - invalid credentials for: ${email}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );

    const decodedToken = jwt.decode(token) || {};
    const tokenExpiresAt = decodedToken.exp ? new Date(decodedToken.exp * 1000) : null;

    logger.info(`[Login] Success for user: ${email}, expiresAt=${tokenExpiresAt?.toISOString()}`);

    // Set HttpOnly session cookie
    try {
      const cookieOptions = {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.nodeEnv === 'production',
        maxAge: tokenExpiresAt ? tokenExpiresAt.getTime() - Date.now() : undefined,
        path: '/',
      };
      res.cookie('token', token, cookieOptions);
      logger.info('[Login] Set session cookie (httpOnly, SameSite=lax)');
    } catch (cookieErr) {
      logger.warn('[Login] Failed to set session cookie', { error: cookieErr.message });
    }

    res.status(200).json({
      token,
      tokenExpiresAt: tokenExpiresAt ? tokenExpiresAt.toISOString() : null,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        usage: user.usage,
        limits: user.limits,
        trialEndsAt: user.trialEndsAt,
      },
    });
  } catch (error) {
    logger.error('[Login] Error during login:', error.message);
    next(error);
  }
});

/**
 * Get current user
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    logger.info(`[Auth] /me endpoint called for user: ${req.user.id}`);
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      logger.warn(`[Auth] User not found: ${req.user.id}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    logger.info(`[Auth] Returning user data for: ${user.email}`);
    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        usage: user.usage,
        limits: user.limits,
        trialEndsAt: user.trialEndsAt,
      },
    });
  } catch (error) {
    logger.error(`[Auth] Error in /me endpoint:`, error.message);
    next(error);
  }
});

/**
 * Refresh token
 */
router.post('/refresh', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    const token = jwt.sign(
      { id: user._id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );

    const decodedToken = jwt.decode(token) || {};
    const tokenExpiresAt = decodedToken.exp ? new Date(decodedToken.exp * 1000) : null;

    logger.info(`[Auth Refresh] Issued new token for user: ${user._id}, expiresAt=${tokenExpiresAt?.toISOString()}`);

    // Set refreshed token into HttpOnly cookie
    try {
      const cookieOptions = {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.nodeEnv === 'production',
        maxAge: tokenExpiresAt ? tokenExpiresAt.getTime() - Date.now() : undefined,
        path: '/',
      };
      res.cookie('token', token, cookieOptions);
      logger.info('[Auth Refresh] Set refreshed session cookie');
    } catch (cookieErr) {
      logger.warn('[Auth Refresh] Failed to set session cookie', { error: cookieErr.message });
    }

    res.json({ token, tokenExpiresAt: tokenExpiresAt ? tokenExpiresAt.toISOString() : null });
  } catch (error) {
    next(error);
  }
});

/**
 * OAuth callback for Instagram
 */
const {
  getAccessTokenFromCode,
  exchangeAccessToken,
  getInstagramBusinessAccountId,
  getUserInfo,
} = require('../services/instagram');

router.get('/instagram/callback', authenticate, async (req, res) => {
  try {
    const { code, error, error_description } = req.query;

    if (error) {
      return res.redirect(`/dashboard/accounts?error=${encodeURIComponent(error_description || error)}`);
    }

    if (!code) {
      return res.redirect('/dashboard/accounts?error=No authorization code received');
    }

    const userId = req.user && req.user.id;
    if (!userId) {
      return res.redirect('/login?error=Session expired');
    }

    // Exchange code for short-lived access token
    const { accessToken, userId: igUserId } = await getAccessTokenFromCode(code);
    if (!accessToken || !igUserId) {
      throw new Error('Failed to get access token from code');
    }

    // Get Instagram Business Account ID
    const instagramId = await getInstagramBusinessAccountId(igUserId, accessToken);
    if (!instagramId) {
      throw new Error('Failed to get Instagram Business Account ID');
    }

    // Exchange for long-lived token
    const exchanged = await exchangeAccessToken(accessToken);
    const longLivedToken = exchanged && exchanged.accessToken ? exchanged.accessToken : exchanged.access_token || null;
    if (!longLivedToken) {
      throw new Error('Failed to get long-lived access token');
    }

    // Fetch account details
    let accountInfo = {};
    try {
      accountInfo = await getUserInfo(longLivedToken, igUserId);
    } catch (err) {
      logger.warn('Failed to fetch account details:', err);
    }

    // Check if account already exists for this user
    const existingAccount = await InstagramAccount.findOne({ instagramId, user: userId });

    if (existingAccount && existingAccount.isActive) {
      return res.redirect('/dashboard/accounts?error=This account is already connected');
    }

    let account;
    const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
    if (existingAccount) {
      account = existingAccount;
      account.isActive = true;
      account.accessToken = longLivedToken;
      account.tokenExpiresAt = new Date(Date.now() + sixtyDaysMs);
      account.username = accountInfo.username || account.username;
      account.profilePicture = accountInfo.profile_picture_url || account.profilePicture;
      account.followersCount = accountInfo.followers_count || account.followersCount;
      account.lastSyncedAt = new Date();
    } else {
      account = new InstagramAccount({
        user: userId,
        instagramId,
        username: accountInfo.username || '',
        profilePicture: accountInfo.profile_picture_url || '',
        followersCount: accountInfo.followers_count || 0,
        accessToken: longLivedToken,
        tokenExpiresAt: new Date(Date.now() + sixtyDaysMs),
        isActive: true,
        connectedAt: new Date(),
        lastSyncedAt: new Date(),
      });
    }

    await account.save();

    // Increment user's account usage if this is a new connection
    const UserModel = require('../models/User');
    const user = await UserModel.findById(userId);
    if (user && !existingAccount) {
      user.usage.accountsUsed = (user.usage.accountsUsed || 0) + 1;
      await user.save();
    }

    return res.redirect('/dashboard/accounts?success=true&account=' + account._id);
  } catch (error) {
    logger.error('OAuth callback error:', error);
    const errorMessage = error.message || 'Failed to connect account';
    return res.redirect(`/dashboard/accounts?error=${encodeURIComponent(errorMessage)}`);
  }
});

/**
 * Facebook OAuth integration
 */
const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
const FACEBOOK_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI;

/**
 * Facebook OAuth: Redirect to Meta login
 */
router.get('/facebook', (req, res) => {
  const fbAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent(FACEBOOK_REDIRECT_URI)}&scope=email,public_profile`;
  logger.info(`[Facebook OAuth] Redirecting to: ${fbAuthUrl}`);
  res.redirect(fbAuthUrl);
});

/**
 * Facebook OAuth: Callback handler
 */
router.get('/facebook/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    logger.warn('[Facebook OAuth] No code provided in callback');
    return res.status(400).json({ error: 'No code provided' });
  }
  try {
    // Exchange code for access_token
    const tokenRes = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: FACEBOOK_CLIENT_ID,
        client_secret: FACEBOOK_CLIENT_SECRET,
        redirect_uri: FACEBOOK_REDIRECT_URI,
        code,
      },
    });
    const { access_token } = tokenRes.data;
    logger.info('[Facebook OAuth] Access token received');

    // Store token in JWT (or session cookie)
    const token = jwt.sign({ access_token, provider: 'facebook' }, config.jwtSecret, { expiresIn: config.jwtExpiry });
    const decodedToken = jwt.decode(token) || {};
    const tokenExpiresAt = decodedToken.exp ? new Date(decodedToken.exp * 1000) : null;

    // Set HttpOnly cookie for session persistence
    try {
      const cookieOptions = {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.nodeEnv === 'production',
        maxAge: tokenExpiresAt ? tokenExpiresAt.getTime() - Date.now() : undefined,
        path: '/',
      };
      res.cookie('token', token, cookieOptions);
      logger.info('[Facebook OAuth] Set session cookie (httpOnly, SameSite=lax)');
    } catch (cookieErr) {
      logger.warn('[Facebook OAuth] Failed to set session cookie', { error: cookieErr.message });
    }

    // Redirect to frontend with success (customize as needed)
    return res.redirect(`/dashboard/accounts?fb_oauth=success`);
  } catch (err) {
    logger.error('[Facebook OAuth] Token exchange failed:', err.message);
    return res.redirect(`/dashboard/accounts?error=${encodeURIComponent('Facebook login failed')}`);
  }
});

module.exports = router;
