const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');
const { config } = require('../config/env');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    logger.debug('[Auth Middleware] Authorization header present:', !!authHeader);

    // Prefer Authorization header; fallback to cookie named 'token'
    let token = authHeader?.split(' ')[1];

    if (!token && req.headers.cookie) {
      // Parse cookies manually (no cookie-parser dependency required)
      const cookies = req.headers.cookie.split(';').map(c => c.trim());
      const tokenCookie = cookies.find(c => c.startsWith('token='));
      if (tokenCookie) {
        token = decodeURIComponent(tokenCookie.split('=')[1]);
        logger.debug('[Auth Middleware] Token found in cookie');
      }
    }

    if (!token) {
      logger.warn('[Auth Middleware] No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    // Log decoded payload (non-sensitive fields only)
    const decodedPreview = jwt.decode(token) || {};
    logger.debug('[Auth Middleware] Token preview', {
      userId: decodedPreview.id,
      exp: decodedPreview.exp ? new Date(decodedPreview.exp * 1000).toISOString() : null,
    });

    // Verify token using configured secret
    const decoded = jwt.verify(token, config.jwtSecret || process.env.JWT_SECRET);
    logger.info('[Auth Middleware] Token verified for user', { userId: decoded.id });
    req.user = decoded;
    next();
  } catch (error) {
    if (error && error.name === 'TokenExpiredError') {
      logger.warn('[Auth Middleware] Token expired', { message: error.message, expiredAt: error.expiredAt });
      return res.status(401).json({ error: 'Token expired' });
    }

    logger.error('[Auth Middleware] Token verification failed', { error: error.message });
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').map(c => c.trim());
      const tokenCookie = cookies.find(c => c.startsWith('token='));
      if (tokenCookie) {
        token = decodeURIComponent(tokenCookie.split('=')[1]);
      }
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret || process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (error) {
    // Silent fail for optional auth
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
};
