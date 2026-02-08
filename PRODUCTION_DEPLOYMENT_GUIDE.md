# Production Deployment Guide

## Overview

This guide covers preparing your SaaS application for production deployment with comprehensive error handling, rate limiting, logging, security headers, and performance optimization.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Error Handling Setup](#error-handling-setup)
4. [Rate Limiting Implementation](#rate-limiting-implementation)
5. [Logging Configuration](#logging-configuration)
6. [Security Headers](#security-headers)
7. [Docker Deployment](#docker-deployment)
8. [Nginx Reverse Proxy](#nginx-reverse-proxy)
9. [Performance Optimization](#performance-optimization)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

### Critical Items
- [ ] All environment variables configured
- [ ] SSL/TLS certificates obtained (Let's Encrypt recommended)
- [ ] Database backups configured
- [ ] Monitoring/alerting setup (Sentry, DataDog, New Relic)
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Disaster recovery plan documented

### Code Quality
- [ ] All tests passing (npm test)
- [ ] Code review completed
- [ ] No console.log statements in production code
- [ ] Error handling covers all endpoints
- [ ] Rate limits configured appropriately
- [ ] Security headers enabled

### Infrastructure
- [ ] Server provisioned (AWS, GCP, DigitalOcean, etc.)
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Database servers secured
- [ ] Backup storage configured
- [ ] CDN enabled for static assets
- [ ] DNS configured

---

## Environment Configuration

### Step 1: Copy Production Env File

```bash
cp backend/.env.production backend/.env.production.local
```

### Step 2: Update Required Variables

Edit `backend/.env.production.local` and fill in:

```env
# Server
NODE_ENV=production
PORT=5001

# Database
MONGODB_URI=your_production_mongodb_uri
DB_POOL_SIZE=20

# Authentication
JWT_SECRET=your_long_random_secret_minimum_32_chars
JWT_EXPIRY=7d

# Instagram
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=random_token

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs
FRONTEND_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com

# Monitoring
MONITORING_ENABLED=true
SENTRY_DSN=your_sentry_dsn
```

### Step 3: Validate Configuration

```bash
cd backend
node -e "require('./config/env').validateEnv(); console.log('✓ All env vars valid')"
```

---

## Error Handling Setup

### Features Implemented

1. **AppError Class** - Consistent error structure
2. **Detailed Error Logging** - Error IDs for tracking
3. **HTTP Status Codes** - Proper status for each error type
4. **Development Debug Info** - Stack traces in development only
5. **Production Monitoring** - Integration ready

### Usage in Routes

```javascript
const { asyncHandler, AppError } = require('../middleware/errorHandler');

router.post('/endpoint', asyncHandler(async (req, res) => {
  // Validation
  if (!req.body.email) {
    throw new AppError('Email is required', 400, 'MISSING_FIELD');
  }

  // Database operation
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  // Success
  res.json({ success: true, data: user });
}));
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "id": "ERR-1706335478925-abc123",
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email"
    }
  },
  "timestamp": "2024-01-27T10:31:18.925Z"
}
```

---

## Rate Limiting Implementation

### Pre-Configured Limiters

1. **Auth Limiter** - 5 attempts per 15 minutes
2. **API Limiter** - 100 requests per 15 minutes
3. **Strict Limiter** - 10 requests per minute
4. **Search Limiter** - 20 searches per 5 minutes
5. **Upload Limiter** - 50 uploads per hour
6. **Export Limiter** - 10 exports per day

### Usage in Routes

```javascript
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');

// Apply to auth routes
router.post('/login', authLimiter, async (req, res) => {
  // Handle login
});

// Apply to API routes
router.get('/data', apiLimiter, async (req, res) => {
  // Return data
});
```

### Rate Limit Headers

```
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 2024-01-27T10:46:18.925Z
```

### Configuration

Update in `.env`:

```env
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_API_MAX=100
RATE_LIMIT_STRICT_MAX=10
```

**Important**: In production with multiple servers, migrate to Redis:

```bash
npm install redis
```

Then update rate limiter to use Redis instead of in-memory storage.

---

## Logging Configuration

### Log Levels

Set `LOG_LEVEL` in environment:

- **error** - Only errors
- **warn** - Errors and warnings
- **info** - Errors, warnings, and info (default)
- **debug** - All logs (development only)

### Log Files

- `logs/combined.log` - All logs
- `logs/error.log` - Errors only
- `logs/app.log` - Application logs

### Log Rotation

Enabled by default. Configure:

```env
LOG_ROTATION_ENABLED=true
LOG_MAX_AGE_DAYS=7
```

### Usage in Code

```javascript
const logger = require('../utils/logger');

// Basic logging
logger.info('User signed up', { userId: '123', email: 'user@example.com' });
logger.error('Database connection failed', error);
logger.warn('Rate limit approaching', { remaining: 5 });

// Performance tracking
logger.performance('User fetch', 145, { userId: '123' });

// API request logging
logger.apiRequest('GET', '/api/users', 200, 150, '123');

// Database logging
logger.database('find', 'users', 75, { query: {} });
```

### Monitoring Integration

For production error monitoring:

```env
MONITORING_ENABLED=true
SENTRY_DSN=https://your_key@sentry.io/project
```

---

## Security Headers

### Middleware Stack

All routes automatically get:

1. **Content Security Policy** - Prevent XSS
2. **X-Frame-Options** - Prevent clickjacking
3. **X-Content-Type-Options** - Prevent MIME sniffing
4. **HSTS** - Force HTTPS
5. **Referrer Policy** - Control referrer info
6. **Permissions Policy** - Restrict browser APIs
7. **CORS** - Cross-origin restrictions

### Configuration

Update `server.js`:

```javascript
const { securityHeaders, corsConfig } = require('./middleware/security');

// Apply security headers
securityHeaders(app);

// Apply CORS
app.use(cors(corsConfig));
```

### Custom Headers

All API endpoints get:

```
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Expires: 0
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

---

## Docker Deployment

### Build Images

```bash
# Build backend
cd backend
docker build -t autodm-backend:latest .

# Build frontend
cd ../frontend
docker build -t autodm-frontend:latest .

# Build all with docker-compose
docker-compose -f docker-compose.production.yml build
```

### Deploy with Docker Compose

```bash
# Start services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f backend

# Stop services
docker-compose -f docker-compose.production.yml down
```

### Environment File for Docker

Create `.env.docker`:

```env
NODE_ENV=production
PORT=5001
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=secure_password_here
MONGODB_URI=mongodb://admin:secure_password_here@mongodb:27017/autodm?authSource=admin
JWT_SECRET=your_secret_key
# ... other vars
```

---

## Nginx Reverse Proxy

### Configuration

The `nginx.conf` provides:

1. **SSL/TLS** - Secure connections
2. **Rate Limiting** - Per-endpoint limits
3. **Compression** - gzip for bandwidth
4. **Caching** - Static file caching
5. **Load Balancing** - Multiple backend instances
6. **Security Headers** - CORS, CSP, etc.

### Setup SSL Certificates

Using Let's Encrypt with Certbot:

```bash
sudo apt-get install certbot python3-certbot-nginx

sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Copy certificates to nginx
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
```

### Update nginx.conf

Uncomment SSL section:

```nginx
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
ssl_protocols TLSv1.2 TLSv1.3;
```

### Reload Nginx

```bash
docker exec autodm-nginx nginx -s reload
# or
sudo systemctl reload nginx
```

---

## Performance Optimization

### Frontend Optimization

1. **Next.js Production Build**
   ```bash
   npm run build
   npm start
   ```

2. **Image Optimization** - Already configured in `next.config.js`

3. **Code Splitting** - Automatic with Next.js

4. **Environment Variables** - Prefix with `NEXT_PUBLIC_`

### Backend Optimization

1. **Connection Pooling**
   ```env
   DB_POOL_SIZE=20
   ```

2. **Compression**
   ```env
   ENABLE_COMPRESSION=true
   ```

3. **Caching**
   ```env
   ENABLE_CACHING=true
   CACHE_MAX_AGE=3600
   ```

4. **Request Timeout Tuning**
   - Short endpoints: 10s
   - Long operations: 120s
   - Webhooks: 30s

### Database Optimization

1. **Indexes** - Created on frequently queried fields
2. **Connection Pooling** - Default 20 connections
3. **Query Optimization** - Use `.lean()` for read-only operations
4. **Replication** - Configure MongoDB replica set for production

### Caching Strategy

- **Static Assets** - 30 days (Nginx)
- **API Responses** - 1 hour (Redis, optional)
- **Session Data** - In-memory (JWT)

---

## Monitoring & Maintenance

### Health Checks

Application has automatic health checks:

```bash
curl https://api.yourdomain.com/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-27T10:31:18.925Z",
  "database": {
    "connected": true,
    "database": "autodm"
  },
  "server": "running"
}
```

### Log Monitoring

```bash
# Tail logs
tail -f backend/logs/combined.log

# View errors
tail -f backend/logs/error.log

# Search logs
grep "STRIPE_ERROR" backend/logs/error.log
```

### Alerting

Set up alerts for:

1. **Error Rate** > 1% of requests
2. **Response Time** > 5 seconds average
3. **Database Connection** failures
4. **Disk Space** < 10% available
5. **Memory Usage** > 80%
6. **CPU Usage** > 75%

### Scheduled Maintenance

1. **Daily** - Check error logs
2. **Weekly** - Database backup verification
3. **Monthly** - Security updates
4. **Quarterly** - Full system audit

### Backup Strategy

```bash
# Manual backup
mongodump --uri="mongodb://user:pass@host:27017/autodm" --out ./backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://user:pass@host:27017" ./backups/20240127/
```

### Disaster Recovery

1. **RTO** (Recovery Time Objective): < 1 hour
2. **RPO** (Recovery Point Objective): < 15 minutes
3. **Backup Location** - Separate region
4. **Test Recovery** - Monthly

---

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer** - Distribute traffic across multiple instances
2. **Session Storage** - Use MongoDB instead of in-memory
3. **Rate Limiting** - Migrate to Redis for distributed limits
4. **Caching** - Use Redis for distributed caching

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Increase database pool size
3. Increase worker processes (Node clusters)

### Database Scaling

1. **Replication** - For read scalability
2. **Sharding** - For write scalability
3. **Indexing** - Optimize queries

---

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check for memory leaks with `node --inspect`
   - Review logger file size
   - Enable log rotation

2. **Slow API Response**
   - Check database performance
   - Review rate limiting configuration
   - Enable caching

3. **SSL Certificate Issues**
   - Verify certificate validity: `openssl x509 -in cert.pem -text`
   - Check certificate expiration
   - Update with new certificates

4. **Database Connection Errors**
   - Verify MongoDB URI
   - Check network connectivity
   - Verify credentials

---

## Support & Resources

- **Documentation**: See other PRODUCTION_* guides
- **Monitoring**: Setup Sentry, DataDog, or New Relic
- **Logging**: Check `logs/` directory
- **Status Page**: Monitor at `/health` endpoint

---

**Last Updated**: January 27, 2024
**Version**: 1.0.0
**Status**: Production Ready
