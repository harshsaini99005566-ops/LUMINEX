const helmet = require('helmet');
const logger = require('../../utils/logger');

/**
 * Comprehensive security headers middleware
 */
const securityHeaders = (app) => {
  // Helmet provides sensible defaults for 15+ security headers
  app.use(
    helmet({
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.stripe.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          imgSrc: ["'self'", 'data:', 'https:', 'https://*.cdninstagram.com', 'https://*.fbcdn.net'],
          connectSrc: ["'self'", 'https://api.stripe.com', 'https://graph.instagram.com'],
          frameSrc: ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
          objectSrc: ["'none'"],
          ...(process.env.NODE_ENV === 'production' && { upgradeInsecureRequests: [] }),
        },
      },

      // Cross-Origin Resource Sharing (CORS) - handled separately
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',

      // X-Frame-Options: Prevent clickjacking
      frameguard: {
        action: 'deny',
      },

      // X-Content-Type-Options: Prevent MIME type sniffing
      noSniff: true,

      // X-XSS-Protection: Legacy XSS protection
      xssFilter: true,

      // Referrer-Policy: Control referrer information
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },

      // Permissions-Policy (formerly Feature-Policy)
      permittedCrossDomainPolicies: false,

      // HSTS: HTTP Strict Transport Security
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: process.env.NODE_ENV === 'production',
      },

      // DNS Prefetch Control
      dnsPrefetchControl: {
        allow: false,
      },

      // Powered-By header removal
      hidePoweredBy: true,

      // Cross-Origin-Opener-Policy
      crossOriginOpenerPolicy: process.env.NODE_ENV === 'production',
    })
  );

  // Additional custom security headers
  app.use((req, res, next) => {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS filtering
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Strict Transport Security (HTTPS only)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // Permissions Policy (formerly Feature-Policy)
    res.setHeader(
      'Permissions-Policy',
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
    );

    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');

    // API security headers
    if (req.path.startsWith('/api')) {
      // Prevent caching of sensitive data
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    next();
  });

  logger.info('Security headers configured');
};

/**
 * CORS configuration
 */
const corsConfig = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
    ];

    if (process.env.NODE_ENV === 'production') {
      // In production, only allow specific domains
      allowedOrigins.splice(1); // Remove localhost entries
      if (process.env.PRODUCTION_FRONTEND_URL) {
        allowedOrigins.push(process.env.PRODUCTION_FRONTEND_URL);
      }
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked request', { origin });
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 3600, // 1 hour
};

/**
 * Request validation middleware
 */
const validateRequest = (req, res, next) => {
  // Validate Content-Type for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
      return res.status(400).json({
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Content-Type must be application/json or multipart/form-data',
        },
      });
    }
  }

  // Validate request size
  if (req.headers['content-length']) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (parseInt(req.headers['content-length']) > maxSize) {
      return res.status(413).json({
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request payload too large',
        },
      });
    }
  }

  // Sanitize input headers
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-client-ip',
    'x-originating-ip',
  ];

  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      logger.debug('Suspicious header detected', { header, value: req.headers[header] });
    }
  }

  next();
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const shouldLog = process.env.NODE_ENV === 'development' || res.statusCode >= 400;

    if (shouldLog) {
      logger.info('HTTP Request', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.headers['user-agent']?.substring(0, 100),
      });
    }
  });

  next();
};

/**
 * Input sanitization
 */
const sanitizeInput = (req, res, next) => {
  // Remove potential injection patterns from query and body
  const sanitize = (obj) => {
    if (!obj) return obj;
    
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove common injection patterns
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };

  if (req.query) sanitize(req.query);
  if (req.body) sanitize(req.body);

  next();
};

module.exports = {
  securityHeaders,
  corsConfig,
  validateRequest,
  requestLogger,
  sanitizeInput,
};
