/**
 * Authentication Middleware
 * 
 * Use this middleware to protect routes that require authentication.
 * Works with both Passport session authentication and JWT tokens.
 */

/**
 * Middleware to check if user is authenticated via Passport session
 * 
 * @example
 * app.get('/api/dashboard', ensureAuthenticated, (req, res) => {
 *   res.json({ user: req.user });
 * });
 */
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ 
    error: 'Unauthorized',
    message: 'Please login to access this resource' 
  });
};

/**
 * Middleware to check if user is authenticated via Passport OR JWT
 * Tries Passport session first, then falls back to JWT token
 * 
 * @example
 * app.get('/api/profile', ensureAuthenticatedOrJWT, (req, res) => {
 *   res.json({ user: req.user });
 * });
 */
const ensureAuthenticatedOrJWT = async (req, res, next) => {
  // Check Passport session first
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Fall back to JWT token
  const jwt = require('jsonwebtoken');
  const { config } = require('../config/env');
  
  try {
    // Check for token in cookies or Authorization header
    const token = req.cookies?.token || 
                  req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Please login to access this resource' 
      });
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Fetch user from database
    const User = require('../models/User');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'User not found' 
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or expired token' 
    });
  }
};

/**
 * Middleware to check if user has a specific plan
 * Must be used after ensureAuthenticated or ensureAuthenticatedOrJWT
 * 
 * @param {string|string[]} allowedPlans - Plan name(s) to allow
 * @example
 * app.get('/api/premium-feature', 
 *   ensureAuthenticated, 
 *   ensurePlan(['pro', 'agency']), 
 *   (req, res) => {
 *     res.json({ feature: 'premium data' });
 *   }
 * );
 */
const ensurePlan = (allowedPlans) => {
  const plans = Array.isArray(allowedPlans) ? allowedPlans : [allowedPlans];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Please login first' 
      });
    }
    
    if (!plans.includes(req.user.plan)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `This feature requires a ${plans.join(' or ')} plan`,
        currentPlan: req.user.plan 
      });
    }
    
    next();
  };
};

/**
 * Middleware to check if user is authenticated via session and return user data
 * If not authenticated, continues without error (optional authentication)
 * 
 * @example
 * app.get('/api/public-data', optionalAuthentication, (req, res) => {
 *   if (req.user) {
 *     res.json({ data: 'personalized', user: req.user });
 *   } else {
 *     res.json({ data: 'public' });
 *   }
 * });
 */
const optionalAuthentication = (req, res, next) => {
  // User will be populated if authenticated, undefined if not
  // Both cases are valid - continues to next middleware
  next();
};

module.exports = {
  ensureAuthenticated,
  ensureAuthenticatedOrJWT,
  ensurePlan,
  optionalAuthentication
};
