const logger = require('../../utils/logger');

/**
 * Custom Error Class for API errors
 */
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date();
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Production-grade error handler middleware
 */
const errorHandler = (error, req, res, _next) => {
  const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Sanitize error for logging (remove sensitive data)
  const sanitizedError = {
    id: errorId,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip,
  };

  // Determine status code
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_SERVER_ERROR';
  let details = {};

  // MongoDB Validation Error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details.errors = Object.keys(error.errors).reduce((acc, key) => {
      acc[key] = error.errors[key].message;
      return acc;
    }, {});
  }

  // MongoDB Duplicate Key Error
  if (error.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    const field = Object.keys(error.keyPattern)[0];
    message = `The ${field} already exists`;
    details.field = field;
  }

  // JWT Errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  // Custom AppError
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code || code;
    message = error.message;
  }

  // MongoDB Cast Error (invalid ObjectId)
  if (error.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  }

  // Stripe Errors
  if (error.type && error.type.includes('StripeError')) {
    statusCode = 400;
    code = 'STRIPE_ERROR';
    message = error.message;
    if (error.statusCode) statusCode = error.statusCode;
  }

  // Rate Limit Error
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    statusCode = 429;
    code = 'RATE_LIMIT_EXCEEDED';
    message = 'Too many requests, please try again later';
    details.retryAfter = error.retryAfter;
  }

  // Axios/Network Errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    statusCode = 503;
    code = 'SERVICE_UNAVAILABLE';
    message = 'External service unavailable';
    logger.warn('External service connection failed', {
      code: error.code,
      host: error.hostname,
    });
  }

  // Timeout Error
  if (error.code === 'ECONNABORTED' || error.name === 'TimeoutError') {
    statusCode = 504;
    code = 'GATEWAY_TIMEOUT';
    message = 'Request timeout';
  }

  // Log error based on severity
  if (statusCode >= 500) {
    logger.error('Server error', {
      ...sanitizedError,
      stack: error.stack,
      originalError: error.message,
    });
  } else if (statusCode >= 400) {
    logger.warn('Client error', sanitizedError);
  }

  // Send error response
  const response = {
    success: false,
    error: {
      id: errorId,
      code,
      message,
      ...(Object.keys(details).length > 0 && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          originalError: error.message,
          stack: error.stack,
        },
      }),
    },
    timestamp: new Date().toISOString(),
  };

  // Handle response already sent
  if (res.headersSent) {
    logger.error('Headers already sent, cannot send error response', {
      errorId,
      originalError: error.message,
    });
    return;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 handler middleware
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Cannot ${req.method} ${req.originalUrl}`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

/**
 * Global error boundary wrapper for async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
};
