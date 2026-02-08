# Production Features Quick Reference

## Middleware Stack Overview

### 1. Security Headers (Helmet + Custom)
```javascript
// Automatically applied to all routes
- Content-Security-Policy
- X-Frame-Options (DENY)
- X-Content-Type-Options (nosniff)
- HSTS (Strict-Transport-Security)
- Referrer-Policy (strict-origin-when-cross-origin)
- Permissions-Policy (disable browser APIs)
```

### 2. CORS (Cross-Origin Resource Sharing)
```javascript
// Configured per environment
Development: localhost:3000, localhost:3001
Production: FRONTEND_URL environment variable
Methods: GET, POST, PUT, PATCH, DELETE
Credentials: true (for cookies/auth headers)
```

### 3. Rate Limiting
```javascript
// Pre-configured limiters available:

// Auth Limiter - 5 attempts per 15 minutes
const { authLimiter } = require('../middleware/rateLimiter');
app.post('/api/auth/login', authLimiter, handler);

// API Limiter - 100 requests per 15 minutes
const { apiLimiter } = require('../middleware/rateLimiter');
app.get('/api/data', apiLimiter, handler);

// Strict Limiter - 10 requests per minute
const { strictLimiter } = require('../middleware/rateLimiter');
app.post('/api/expensive-operation', strictLimiter, handler);

// Custom Limiters
const { 
  searchLimiter,      // 20 per 5 minutes
  uploadLimiter,      // 50 per hour
  exportLimiter,      // 10 per day
  webhookLimiter      // 50 per minute
} = require('../middleware/rateLimiter');
```

### 4. Request Validation & Sanitization
```javascript
// Automatically validates:
- Content-Type (must be JSON or multipart)
- Content-Length (max 10MB)
- Removes XSS patterns from inputs
- Logs suspicious headers
```

### 5. Request/Response Logging
```javascript
// Automatically logs:
- HTTP method, path, status code
- Response time duration
- IP address, user agent
- Errors to separate error.log

// Custom logging in code:
logger.apiRequest(method, path, statusCode, duration, userId);
logger.database(operation, collection, duration, data);
logger.performance(operation, duration, data);
```

### 6. Error Handling
```javascript
// Use asyncHandler for async routes:
const { asyncHandler, AppError } = require('../middleware/errorHandler');

router.post('/endpoint', asyncHandler(async (req, res) => {
  // Errors automatically caught and formatted
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }
}));

// Error response format:
{
  "success": false,
  "error": {
    "id": "ERR-1706335478925-abc123",
    "code": "NOT_FOUND",
    "message": "User not found",
    "details": {}
  },
  "timestamp": "2024-01-27T10:31:18.925Z"
}
```

---

## Environment Variables Configuration

### Server Configuration
```env
NODE_ENV=production                    # development|staging|production
PORT=5001                             # Server port
LOG_LEVEL=info                        # error|warn|info|debug
LOG_ROTATION_ENABLED=true             # Enable log file rotation
LOG_MAX_AGE_DAYS=7                    # Delete logs older than X days
```

### Database
```env
MONGODB_URI=mongodb+srv://...         # MongoDB connection string
DB_POOL_SIZE=20                       # Connection pool size
```

### Authentication
```env
JWT_SECRET=your_secret_32_chars_min   # JWT signing key (32+ chars)
JWT_EXPIRY=7d                         # Access token expiry
JWT_REFRESH_EXPIRY=30d                # Refresh token expiry
```

### Instagram Integration
```env
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=token
INSTAGRAM_API_VERSION=v18.0
INSTAGRAM_WEBHOOK_URL=https://api.yourdomain.com/api/webhooks/instagram
```

### Stripe Billing
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_FREE_PRICE_ID=price_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_AGENCY_PRICE_ID=price_...
```

### URLs
```env
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
PRODUCTION_URL=https://yourdomain.com
```

### Rate Limiting (Optional Overrides)
```env
RATE_LIMIT_AUTH_MAX=5              # Max auth attempts per window
RATE_LIMIT_API_MAX=100             # Max API requests per window
RATE_LIMIT_STRICT_MAX=10           # Max strict operation requests
```

### Performance
```env
ENABLE_COMPRESSION=true             # Enable gzip compression
ENABLE_CACHING=true                 # Enable response caching
CACHE_MAX_AGE=3600                  # Cache max age in seconds
```

### Features
```env
ANALYTICS_ENABLED=true
WEBHOOKS_ENABLED=true
BILLING_ENABLED=true
MAINTENANCE_MODE=false              # Set true to enable maintenance
```

### Monitoring
```env
MONITORING_ENABLED=true
SENTRY_DSN=https://your_dsn@sentry.io/...
NEW_RELIC_LICENSE_KEY=your_key
DATADOG_API_KEY=your_key
```

---

## Logger Usage Examples

### Basic Logging
```javascript
const logger = require('../utils/logger');

// Info level
logger.info('User signed up', {
  userId: user._id,
  email: user.email,
  plan: user.subscription.plan
});

// Warn level
logger.warn('Rate limit approaching', {
  userId: user._id,
  remaining: 5
});

// Error level
logger.error('Payment failed', {
  error: error.message,
  userId: user._id,
  amount: 99.99
});

// Debug level (development only)
logger.debug('Query executed', {
  collection: 'users',
  query: { email: user.email }
});
```

### Specialized Logging
```javascript
// Performance tracking
logger.performance('User lookup', 145, {
  method: 'findById',
  indexed: true
});

// API request logging
logger.apiRequest('POST', '/api/billing/checkout', 201, 340, userId);

// Database operation logging
logger.database('findOneAndUpdate', 'users', 125, {
  operation: 'subscription update'
});
```

### Log File Locations
```
logs/
├── combined.log      # All logs
├── error.log         # Errors only
└── app.log           # Application logs
```

---

## Error Handling Best Practices

### Standard Error Response
```javascript
// For known errors, throw AppError
router.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  res.json({ success: true, data: user });
}));

// Response on error:
{
  "success": false,
  "error": {
    "id": "ERR-...",
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```

### Specific Error Codes
```javascript
// Validation
throw new AppError('Email required', 400, 'VALIDATION_ERROR');

// Authentication
throw new AppError('Invalid token', 401, 'INVALID_TOKEN');

// Authorization
throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');

// Not Found
throw new AppError('Resource not found', 404, 'NOT_FOUND');

// Conflict (duplicate)
throw new AppError('Email already exists', 409, 'DUPLICATE_ENTRY');

// Rate Limited
throw new AppError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');

// Server Error
throw new AppError('Internal error', 500, 'INTERNAL_SERVER_ERROR');
```

---

## Rate Limiting Examples

### Apply to Individual Routes
```javascript
const { authLimiter, apiLimiter, strictLimiter } = require('../middleware/rateLimiter');

// Auth endpoints - strict
router.post('/login', authLimiter, handler);
router.post('/signup', authLimiter, handler);

// API endpoints - moderate
router.get('/data', apiLimiter, handler);
router.post('/users', apiLimiter, handler);

// Expensive operations - very strict
router.post('/export', strictLimiter, handler);
```

### Apply to Entire Route File
```javascript
const { apiLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.use(apiLimiter); // Apply to all routes in this file

router.get('/all-data', handler);
router.post('/create-data', handler);
```

### Custom Rate Limiter
```javascript
const { createRateLimiter } = require('../middleware/rateLimiter');

const customLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,    // 10 minutes
  maxRequests: 20,              // 20 requests
  keyGenerator: (req) => req.user?.id || req.ip,
  message: 'Custom limit exceeded'
});

router.post('/custom', customLimiter, handler);
```

---

## Docker Deployment

### Build Commands
```bash
# Build backend
cd backend
docker build -t autodm-backend:latest .

# Build frontend
cd ../frontend
docker build -t autodm-frontend:latest .

# Build all with compose
docker-compose -f docker-compose.production.yml build
```

### Run Commands
```bash
# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f frontend

# Stop services
docker-compose -f docker-compose.production.yml down

# Restart specific service
docker-compose -f docker-compose.production.yml restart backend
```

---

## Health Checks

### API Health
```bash
curl https://api.yourdomain.com/health
```

Response:
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-01-27T10:31:18.925Z",
  "environment": "production",
  "database": {
    "connected": true,
    "database": "autodm"
  },
  "server": "running"
}
```

### Docker Health
```bash
docker-compose -f docker-compose.production.yml ps
# HEALTHCHECK values visible in STATUS column
```

### Database Health
```javascript
// In routes
app.get('/health/db', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  await User.countDocuments();
  const duration = Date.now() - startTime;
  
  res.json({
    success: true,
    database: 'connected',
    responseTime: `${duration}ms`
  });
}));
```

---

## Nginx Configuration Features

The pre-configured `nginx.conf` includes:

### Performance
- Gzip compression for text/JSON
- Static file caching (30 days)
- HTTP/2 multiplexing
- Connection keep-alive
- Load balancing

### Security
- SSL/TLS configuration
- Rate limiting per endpoint
- Security headers (HSTS, CSP, etc.)
- DDoS protection
- Access log filtering

### Routing
- Frontend proxy (port 3000)
- Backend API proxy (port 5001)
- Static file serving
- Webhook endpoints
- Health check endpoints

### Usage
```bash
# Validate config
docker exec autodm-nginx nginx -t

# Reload after config change
docker exec autodm-nginx nginx -s reload

# View access logs
docker logs autodm-nginx
```

---

## Monitoring Integration Points

### Ready for Integration With:
- **Sentry** - Error tracking (`SENTRY_DSN`)
- **DataDog** - APM & monitoring (`DATADOG_API_KEY`)
- **New Relic** - Application performance (`NEW_RELIC_LICENSE_KEY`)
- **Prometheus** - Metrics collection
- **ELK Stack** - Log aggregation
- **CloudWatch** - AWS monitoring

### Setup Example (Sentry)
```javascript
// Add to server.js after imports
if (process.env.SENTRY_DSN) {
  const Sentry = require("@sentry/node");
  Sentry.init({ dsn: process.env.SENTRY_DSN });
  app.use(Sentry.Handlers.requestHandler());
}
```

---

## Performance Optimization Tips

1. **Database Indexes**
   ```javascript
   // Ensure these indexes exist
   db.users.createIndex({ email: 1 });
   db.users.createIndex({ stripeCustomerId: 1 });
   db.conversations.createIndex({ userId: 1, instagramId: 1 });
   ```

2. **Query Optimization**
   ```javascript
   // Use .lean() for read-only operations
   const users = await User.find().lean();
   
   // Select only needed fields
   const emails = await User.find({}, 'email');
   ```

3. **Caching**
   ```javascript
   // Cache frequently accessed data
   const cachedUser = await redis.get(`user:${id}`);
   if (!cachedUser) {
     const user = await User.findById(id);
     await redis.set(`user:${id}`, JSON.stringify(user), 'EX', 3600);
   }
   ```

4. **Connection Pooling**
   ```env
   DB_POOL_SIZE=20  # Increase if high concurrency
   ```

---

**Last Updated**: January 27, 2024
**Version**: 1.0.0
**Status**: Production Ready
