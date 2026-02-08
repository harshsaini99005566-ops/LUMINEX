# Production Environment Checklist & Quick Reference

## ✅ Pre-Launch Verification

### Code Quality
- [ ] All npm tests passing: `npm test`
- [ ] No ESLint errors: `npm run lint`
- [ ] No TypeScript errors (frontend): `npm run type-check`
- [ ] No console.log() statements in production code
- [ ] All error paths handled with try-catch or asyncHandler
- [ ] No hardcoded secrets or API keys
- [ ] All dependencies up to date: `npm audit` shows 0 vulnerabilities

### Environment Setup
- [ ] `.env.production` created and validated
- [ ] All required environment variables set:
  - NODE_ENV=production
  - JWT_SECRET (32+ characters)
  - MONGODB_URI (production database)
  - STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
  - INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET
  - FRONTEND_URL and API_URL
- [ ] Database connection tested
- [ ] Stripe account configured with webhook
- [ ] Instagram app configured with webhook

### Security
- [ ] SSL/TLS certificate obtained (Let's Encrypt recommended)
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled and tested
- [ ] Security headers enabled (CSP, HSTS, X-Frame-Options, etc.)
- [ ] Input validation and sanitization enabled
- [ ] No sensitive data in logs
- [ ] Webhook signatures verified

### Infrastructure
- [ ] Server provisioned (AWS EC2, DigitalOcean, Heroku, etc.)
- [ ] Firewall configured to allow only necessary ports (80, 443, 22)
- [ ] MongoDB Atlas or self-hosted MongoDB production instance
- [ ] Automatic backups configured (daily minimum)
- [ ] Database replication enabled (if available)
- [ ] SSH keys configured (no password access)
- [ ] Monitoring and alerting setup (Sentry, DataDog, New Relic)

### Performance
- [ ] Database indexes created for common queries
- [ ] Query performance tested (< 500ms for most endpoints)
- [ ] Compression enabled (gzip)
- [ ] Static assets optimized and cached
- [ ] Database connection pooling configured (pool size: 20)
- [ ] Load testing completed (simulate 1000+ concurrent users)

### Deployment
- [ ] Docker images built and tested
- [ ] docker-compose.production.yml configured
- [ ] Nginx reverse proxy configured
- [ ] Health check endpoint verified (`/health`)
- [ ] All routes accessible from production domain
- [ ] SSL certificate configured in Nginx
- [ ] Log rotation enabled

### Data & Backups
- [ ] Database backup strategy documented
- [ ] Automatic daily backups configured
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented
- [ ] Database exports working
- [ ] User data migration plan (if applicable)

### Testing
- [ ] Integration tests passing
- [ ] E2E tests passing (signup, login, payment flow)
- [ ] API endpoints tested with production data
- [ ] Payment flow tested (Stripe test mode)
- [ ] Webhook endpoints tested
- [ ] Rate limiting tested
- [ ] Error handling tested

### Monitoring
- [ ] Error tracking configured (Sentry/DataDog/New Relic)
- [ ] Log monitoring setup
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring configured
- [ ] Alert thresholds set:
  - Error rate > 1%
  - Response time > 5 seconds
  - Database connection failures
  - Disk space < 10% available
  - Memory usage > 80%

### Documentation
- [ ] Deployment guide completed
- [ ] API documentation updated
- [ ] Environment variables documented
- [ ] Runbook created for common issues
- [ ] Team trained on production deployment
- [ ] Incident response plan documented

---

## 🚀 Quick Start Commands

### Build & Deploy

```bash
# Backend
cd backend
npm install
npm run build
docker build -t autodm-backend:latest .

# Frontend
cd ../frontend
npm install
npm run build
docker build -t autodm-frontend:latest .

# Deploy with docker-compose
docker-compose -f docker-compose.production.yml up -d
```

### Environment Variables (Critical)

```bash
# Copy and fill in
cp backend/.env.production backend/.env.production.local

# Validate
cd backend
node -e "require('./config/env').validateEnv(); console.log('✓ Valid')"
```

### Verify Deployment

```bash
# Check services
docker-compose -f docker-compose.production.yml ps

# Test health
curl https://api.yourdomain.com/health

# View logs
docker-compose -f docker-compose.production.yml logs -f backend
```

### SSL Certificate Setup

```bash
# Get certificate (Let's Encrypt)
sudo certbot certonly --standalone -d yourdomain.com

# Copy to nginx
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/ssl/key.pem

# Reload nginx
docker exec autodm-nginx nginx -s reload
```

---

## 📊 Key Metrics to Monitor

### Performance
- **Response Time**: Target < 500ms (p95)
- **Database Query Time**: Target < 200ms
- **Throughput**: Requests per second
- **Error Rate**: Target < 0.1%

### Reliability
- **Uptime**: Target > 99.9%
- **Mean Time to Recovery**: Target < 1 hour
- **Database Connection Success**: Target 99.99%

### Security
- **Failed Auth Attempts**: Monitor for brute force
- **Rate Limit Violations**: Monitor for DDoS
- **Error Rate 4xx/5xx**: Track for potential issues
- **Unauthorized Access Attempts**: Alert on repeated 401/403

### Business
- **Active Users**: Track growth
- **Conversion Rate**: Free to paid
- **Churn Rate**: Subscription cancellations
- **Revenue**: MRR, ARR, MRR Growth

---

## 🔍 Common Production Issues & Solutions

### Issue: High Memory Usage
```bash
# Check memory
docker stats autodm-backend

# Solution:
# 1. Check logger file size (may be growing)
# 2. Review logger rotation settings
# 3. Check for memory leaks: node --inspect src/server.js
# 4. Increase server RAM
# 5. Enable memory caching limits
```

### Issue: Slow API Responses
```bash
# Check database performance
mongosh --eval "db.currentOp()" # MongoDB

# Solutions:
# 1. Check database indexes
# 2. Review slow queries in logs
# 3. Increase database pool size
# 4. Enable caching for frequently accessed data
# 5. Optimize heavy queries with .lean()
```

### Issue: Rate Limiting Too Strict
```bash
# Adjust in .env
RATE_LIMIT_API_MAX=100  # Increase from default

# Restart service
docker-compose -f docker-compose.production.yml restart backend
```

### Issue: SSL Certificate Expiring
```bash
# Check expiration
openssl x509 -in /path/to/cert.pem -noout -dates

# Renew (Let's Encrypt)
sudo certbot renew

# Update nginx
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/ssl/
docker exec autodm-nginx nginx -s reload
```

### Issue: Database Connection Errors
```bash
# Check connectivity
mongosh --uri "mongodb://user:pass@host:27017/autodm"

# Solutions:
# 1. Verify MongoDB URI in .env
# 2. Check firewall rules
# 3. Verify credentials
# 4. Increase connection timeout: DB_POOL_SIZE=30
# 5. Check MongoDB status/memory
```

---

## 📋 Maintenance Schedule

### Daily
- [ ] Monitor error logs for spikes
- [ ] Check uptime dashboard
- [ ] Review failed auth attempts
- [ ] Check API response times

### Weekly
- [ ] Database backup verification
- [ ] Security alert review
- [ ] Performance metrics review
- [ ] User feedback monitoring

### Monthly
- [ ] Security updates installation
- [ ] Database optimization (VACUUM, reindex)
- [ ] Full backup restoration test
- [ ] Dependency audit (`npm audit`)

### Quarterly
- [ ] Full security audit
- [ ] Capacity planning review
- [ ] Disaster recovery drill
- [ ] Performance optimization review

---

## 🚨 Alert Thresholds

Set these in your monitoring service (Sentry, DataDog, etc.):

| Metric | Threshold | Severity |
|--------|-----------|----------|
| Error Rate | > 1% | Critical |
| Response Time (p95) | > 5s | High |
| Database Connection Pool | > 90% | High |
| Disk Space Used | > 90% | High |
| Memory Usage | > 85% | Medium |
| CPU Usage | > 80% | Medium |
| Failed Stripe Webhooks | > 10/day | Medium |
| Rate Limit Hits | Spike | Medium |
| SSL Certificate | < 30 days to expiry | Low |

---

## 📞 Emergency Contacts

Setup contact list for:
- [ ] Database administrator
- [ ] DevOps/Infrastructure team
- [ ] Lead developer
- [ ] Monitoring service support
- [ ] Cloud provider support

---

## 🔐 Security Checklist - Do Before Launch

- [ ] All hardcoded secrets removed
- [ ] Environment variables validated
- [ ] API keys rotated (not from dev environment)
- [ ] Database user passwords changed
- [ ] SSH keys configured (no password login)
- [ ] Firewall rules restricted
- [ ] CORS limited to production domain
- [ ] Rate limiting enabled
- [ ] Input sanitization active
- [ ] HTTPS enforced
- [ ] Security headers enabled
- [ ] Webhook signatures verified
- [ ] No debug mode enabled
- [ ] No verbose logging in production
- [ ] Database backups encrypted

---

## 📝 Post-Launch Verification

After deployment:

1. **Day 1**
   - [ ] Monitor error logs
   - [ ] Verify all endpoints respond
   - [ ] Check database connectivity
   - [ ] Monitor resource usage

2. **Week 1**
   - [ ] Review performance metrics
   - [ ] Check user sign-ups (if applicable)
   - [ ] Verify payment processing
   - [ ] Monitor error rate trends

3. **Month 1**
   - [ ] Full system audit
   - [ ] Performance baseline established
   - [ ] All monitoring rules validated
   - [ ] Team trained on production procedures

---

**Last Updated**: January 27, 2024
**Version**: 1.0.0
**Status**: Ready for Production
