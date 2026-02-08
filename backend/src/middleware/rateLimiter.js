const logger = require('../../utils/logger');

/**
 * In-memory store for rate limiting
 * In production, use Redis for distributed rate limiting
 */
class RateLimitStore {
  constructor() {
    this.requests = new Map();
    this.cleanupInterval = 60000; // Cleanup every minute
    this.startCleanup();
  }

  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.requests.entries()) {
        if (now - data.resetTime > 0) {
          this.requests.delete(key);
        }
      }
    }, this.cleanupInterval);
  }

  increment(key, windowMs) {
    const now = Date.now();
    if (!this.requests.has(key)) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
    } else {
      const data = this.requests.get(key);
      if (now > data.resetTime) {
        // Window expired, reset
        data.count = 1;
        data.resetTime = now + windowMs;
      } else {
        data.count++;
      }
    }
    return this.requests.get(key);
  }

  get(key) {
    return this.requests.get(key);
  }
}

const store = new RateLimitStore();

/**
 * Generic rate limiter factory
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    keyGenerator = (req) => req.ip,

    message = 'Too many requests, please try again later',
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const data = store.increment(key, windowMs);

    // Set rate limit headers
    res.set('RateLimit-Limit', maxRequests);
    res.set('RateLimit-Remaining', Math.max(0, maxRequests - data.count));
    res.set('RateLimit-Reset', new Date(data.resetTime).toISOString());

    if (data.count > maxRequests) {
      const error = new Error(message);
      error.code = 'RATE_LIMIT_EXCEEDED';
      error.statusCode = 429;
      error.retryAfter = Math.ceil((data.resetTime - Date.now()) / 1000);

      logger.warn('Rate limit exceeded', {
        key,
        count: data.count,
        limit: maxRequests,
        retryAfter: error.retryAfter,
      });

      return next(error);
    }

    next();
  };
};

/**
 * Authentication endpoints rate limiter (stricter)
 */
const authLimiter = createRateLimiter({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000, // 15 min prod, 1 min dev
  maxRequests: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 attempts prod, 50 dev
  keyGenerator: (req) => `auth-${req.ip}-${req.body?.email || 'unknown'}`,
  message: 'Too many authentication attempts, please try again in 15 minutes',
});

/**
 * API endpoints rate limiter (moderate)
 */
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  keyGenerator: (req) => `api-${req.ip}`,
  message: 'API rate limit exceeded',
});

/**
 * Strict rate limiter for expensive operations
 */
const strictLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  keyGenerator: (req) => `strict-${req.ip}-${req.user?.id || 'anonymous'}`,
  message: 'Too many requests, please slow down',
});

/**
 * Per-user rate limiter
 */
const createUserRateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000,
    maxRequests = 30,
    message = 'User rate limit exceeded',
  } = options;

  return createRateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (req) => `user-${req.user?.id || req.ip}`,
    message,
  });
};

/**
 * Webhook rate limiter (very strict)
 */
const webhookLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 50, // 50 webhook events per minute
  keyGenerator: (req) => `webhook-${req.headers['x-webhook-signature'] || req.ip}`,
  message: 'Webhook rate limit exceeded',
});

/**
 * Search/query rate limiter
 */
const searchLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20, // 20 searches per 5 minutes
  keyGenerator: (req) => `search-${req.ip}-${req.user?.id || 'anonymous'}`,
  message: 'Search rate limit exceeded',
});

/**
 * File upload rate limiter
 */
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // 50 uploads per hour
  keyGenerator: (req) => `upload-${req.user?.id || req.ip}`,
  message: 'Upload limit exceeded',
});

/**
 * Export rate limiter (large data)
 */
const exportLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  maxRequests: 10, // 10 exports per day
  keyGenerator: (req) => `export-${req.user?.id || req.ip}`,
  message: 'Export limit exceeded (10 per day)',
});

module.exports = {
  authLimiter,
  apiLimiter,
  strictLimiter,
  createRateLimiter,
  createUserRateLimiter,
  webhookLimiter,
  searchLimiter,
  uploadLimiter,
  exportLimiter,
};
