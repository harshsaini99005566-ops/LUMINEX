# Meta API Integration - Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] All services properly error-handled
- [ ] Logging implemented across all modules
- [ ] Rate limiting active
- [ ] Token encryption verified
- [ ] Webhook signature verification enabled

### Environment Configuration
- [ ] .env file with all required variables
- [ ] HTTPS endpoints configured
- [ ] Webhook URL publicly accessible
- [ ] CORS properly configured
- [ ] Database connections tested

### Meta App Setup
- [ ] App ID and Secret obtained
- [ ] Scopes configured (6 required scopes)
- [ ] Redirect URI added
- [ ] Webhook URL configured
- [ ] Webhook verify token set
- [ ] Webhook fields subscribed
- [ ] App approved for production

### Security
- [ ] All tokens encrypted at rest
- [ ] Webhook signatures verified
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Error messages don't leak sensitive data
- [ ] Secrets not in version control

### Testing
- [ ] Webhook verification tested
- [ ] OAuth flow tested end-to-end
- [ ] Message sending tested
- [ ] Rate limiting tested
- [ ] Error handling tested
- [ ] Webhook event processing tested

---

## Step-by-Step Deployment

### 1. Prepare Meta App

**Navigate to:** https://developers.facebook.com/apps

1. Create Business or Consumer app
2. Add Instagram product
3. In Instagram > Basic Settings:
   ```
   Copy: App ID and App Secret
   ```
4. In Instagram > Settings > Basic:
   ```
   Client token: Save for reference
   ```

### 2. Configure OAuth

In Meta App Dashboard > Instagram > Settings:

```
Authorized Redirect URIs:
https://your-domain.com/api/instagram/auth/callback
https://api.your-domain.com/api/instagram/auth/callback
```

### 3. Configure Webhooks

In Meta App Dashboard > Webhooks:

1. Click "Edit Subscriptions"
2. Set Callback URL:
   ```
   https://your-domain.com/webhooks/instagram
   ```
3. Set Verify Token:
   ```
   Use value from INSTAGRAM_WEBHOOK_VERIFY_TOKEN env var
   ```
4. Subscribe to events:
   - [ ] messages
   - [ ] message_echoes
   - [ ] message_template_status_update
5. Click Verify and Save

### 4. Generate Encryption Keys

```bash
# In project directory, run:
node -e "console.log('TOKEN_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('INSTAGRAM_WEBHOOK_VERIFY_TOKEN=' + require('crypto').randomBytes(16).toString('hex'))"
```

### 5. Set Environment Variables

Copy output to `.env`:

```env
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=your_token
INSTAGRAM_API_VERSION=v18.0
TOKEN_ENCRYPTION_KEY=your_key
JWT_SECRET=your_secret
BACKEND_URL=https://api.your-domain.com
FRONTEND_URL=https://your-domain.com
API_URL=https://api.your-domain.com
MONGODB_URI=mongodb+srv://user:pass@cluster...
NODE_ENV=production
PORT=5001
```

### 6. Deploy Backend

```bash
# Install dependencies
npm install

# Run migrations (if any)
npm run migrate

# Start server
npm start

# Or with PM2
pm2 start src/server.js --name "instagram-api"
```

### 7. Test Webhook URL

```bash
# Test verification
curl -X GET "https://api.your-domain.com/webhooks/instagram?hub.mode=subscribe&hub.challenge=CHALLENGE&hub.verify_token=YOUR_VERIFY_TOKEN"

# Should return: CHALLENGE
```

### 8. Verify in Meta Dashboard

After webhook is registered:
- Go to Meta App Dashboard > Webhooks
- Status should show "Verified"
- Test button sends test events

### 9. Test OAuth Flow

```bash
# 1. Get auth URL
curl -X GET https://api.your-domain.com/api/instagram/auth/url \
  -H "Authorization: Bearer your_jwt_token"

# 2. Visit returned URL
# 3. Authorize with Instagram
# 4. Should redirect to your frontend with success params
```

### 10. Test Message Sending

```bash
# After OAuth connection, test sending
curl -X POST https://api.your-domain.com/api/messages/accounts/{accountId}/send \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "target_user_id",
    "text": "Test message"
  }'
```

---

## Production Deployment Platforms

### Heroku Deployment

```bash
# 1. Create Heroku app
heroku create your-app-name

# 2. Set environment variables
heroku config:set INSTAGRAM_APP_ID=xxx \
  INSTAGRAM_APP_SECRET=xxx \
  INSTAGRAM_WEBHOOK_VERIFY_TOKEN=xxx \
  TOKEN_ENCRYPTION_KEY=xxx \
  JWT_SECRET=xxx \
  MONGODB_URI=xxx

# 3. Deploy
git push heroku main

# 4. Check logs
heroku logs --tail
```

### AWS EC2 Deployment

```bash
# 1. SSH into instance
ssh -i key.pem ubuntu@your-instance-ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone repository
git clone your-repo-url
cd your-repo

# 4. Install dependencies
npm install

# 5. Create .env file
nano .env
# Paste all environment variables

# 6. Start with PM2
npm install -g pm2
pm2 start src/server.js --name "instagram-api"
pm2 startup
pm2 save

# 7. Setup nginx reverse proxy
# Configure /etc/nginx/sites-available/default
# Point to localhost:5001
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5001

CMD ["node", "src/server.js"]
```

```bash
# Build
docker build -t instagram-api .

# Run with env file
docker run -d \
  --name instagram-api \
  --env-file .env \
  -p 5001:5001 \
  instagram-api
```

### Vercel Deployment (API Routes)

```javascript
// api/webhooks/instagram.js
export default async (req, res) => {
  // Webhook handler
};

// api/messages/[...].js
export default async (req, res) => {
  // Message routes
};
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt with Certbot

```bash
sudo apt-get install certbot python3-certbot-nginx

sudo certbot certonly --standalone -d api.your-domain.com

# Update nginx
sudo nano /etc/nginx/sites-available/default

# Add SSL directives
ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;

# Test renewal
sudo certbot renew --dry-run
```

### Using AWS Certificate Manager

1. Go to AWS Certificate Manager
2. Request public certificate
3. Validate domain ownership
4. Apply to CloudFront distribution
5. Update Route 53 DNS records

---

## Monitoring & Logging

### Application Logging

```bash
# View logs
tail -f logs/application.log

# Filter for errors
grep "ERROR" logs/application.log

# Filter for webhooks
grep "Webhook" logs/application.log

# View last 100 lines
tail -100 logs/application.log
```

### PM2 Monitoring

```bash
# Monitor app
pm2 monit

# View logs
pm2 logs instagram-api

# Check status
pm2 status

# Restart app
pm2 restart instagram-api
```

### CloudWatch Metrics (AWS)

```javascript
// Send custom metrics
const cloudwatch = new AWS.CloudWatch();
cloudwatch.putMetricData({
  Namespace: 'InstagramAPI',
  MetricData: [{
    MetricName: 'MessagesProcessed',
    Value: count,
    Unit: 'Count'
  }]
}).promise();
```

### New Relic APM

```bash
npm install newrelic

# Create newrelic.js
# Add environment variables:
# NEW_RELIC_APP_NAME=
# NEW_RELIC_LICENSE_KEY=

# In server.js, add at very top:
require('newrelic');
```

---

## Database Optimization

### MongoDB Indexes

```javascript
// Already created in schema, but verify:
db.instagramaccounts.createIndex({ user: 1 });
db.instagramaccounts.createIndex({ instagramId: 1 });
db.instagramaccounts.createIndex({ webhookSubscribed: 1 });
db.instagramaccounts.createIndex({ createdAt: -1 });

db.messages.createIndex({ account: 1, receivedAt: -1 });
db.messages.createIndex({ conversation: 1 });
db.messages.createIndex({ status: 1 });
```

### Query Optimization

```javascript
// Use lean() for read-only queries
const accounts = await InstagramAccount.find().lean();

// Use select() to exclude large fields
const account = await InstagramAccount.findById(id)
  .select('-accessToken -refreshToken');

// Use pagination for large datasets
const messages = await Message.find()
  .limit(20)
  .skip(0)
  .sort({ createdAt: -1 });
```

### Connection Pooling

```env
# In MongoDB URI
mongodb+srv://user:pass@cluster...?maxPoolSize=50&minPoolSize=10
```

---

## Backup & Recovery

### MongoDB Atlas Automatic Backups

1. Go to Atlas > Backups
2. Enable automatic backups (24 hours retention)
3. Enable point-in-time restore (35 days)
4. Configure backup schedule

### Manual Backup

```bash
# Export all data
mongodump --uri="mongodb+srv://user:pass@cluster..." \
  --out=/backup/mongo-$(date +%Y%m%d)

# Restore from backup
mongorestore --uri="mongodb+srv://user:pass@cluster..." \
  --dir=/backup/mongo-backup
```

### Environment Variable Backup

```bash
# Save .env securely
# Use AWS Secrets Manager, HashiCorp Vault, or similar
aws secretsmanager create-secret \
  --name instagram-api-env \
  --secret-string file://.env
```

---

## Performance Optimization

### Caching

```javascript
// Redis caching for frequently accessed data
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache business account ID lookups
const getCachedBusinessAccountId = async (instagramId) => {
  const cached = await client.get(`ba:${instagramId}`);
  if (cached) return cached;
  
  const id = await getBusinessAccountId(token, instagramId);
  await client.setex(`ba:${instagramId}`, 3600, id); // 1 hour
  return id;
};
```

### Message Queue

```javascript
// Use BullMQ for async message processing
const Queue = require('bull');
const messageQueue = new Queue('instagram-messages');

messageQueue.process(async (job) => {
  // Process message sending asynchronously
  await sendInstagramMessage(job.data);
});
```

### Rate Limiting Middleware

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests'
});

app.use('/api/', limiter);
```

---

## Scaling Strategies

### Horizontal Scaling

1. **Load Balancer**
   - AWS ELB or CloudFront
   - Distribute traffic across instances
   - Health checks

2. **Multiple Instances**
   - Run multiple Node processes
   - Use PM2 cluster mode
   - Sticky sessions for OAuth flow

3. **Database Sharding**
   - Partition data by user or account
   - Scale read/write capacity

### Vertical Scaling

1. Increase server RAM
2. Use more powerful CPU
3. Upgrade database instance

---

## Disaster Recovery Plan

### RTO/RPO Targets
- **RTO** (Recovery Time Objective): 4 hours
- **RPO** (Recovery Point Objective): 1 hour

### Failover Steps

1. **Database Failure**
   - Switch to replica set
   - Promote secondary to primary
   - Update connection string

2. **Application Failure**
   - AWS Auto Scaling Group recovery
   - Health check failure triggers replacement
   - DNS failover to backup instance

3. **Complete Outage**
   - Restore from backup
   - Rebuild infrastructure
   - Verify webhooks resume delivery

---

## Post-Deployment Tasks

1. **Verify All Systems**
   ```bash
   # Test health endpoint
   curl https://api.your-domain.com/health
   
   # Test webhook
   curl https://api.your-domain.com/webhooks/instagram?hub.mode=subscribe&hub.challenge=TEST&hub.verify_token=TOKEN
   
   # Test OAuth
   curl -H "Authorization: Bearer JWT" https://api.your-domain.com/api/instagram/auth/url
   ```

2. **Monitor for 24 Hours**
   - Watch error logs
   - Monitor API response times
   - Track webhook delivery
   - Monitor database performance

3. **Update Documentation**
   - Add deployment notes
   - Document any customizations
   - Update runbook

4. **Setup Alerts**
   - High error rate (>1%)
   - Webhook delivery failures
   - Database connection issues
   - High response times (>1s)

---

## Troubleshooting Deployment Issues

### Webhook Not Receiving Events

```
1. Check webhook URL is HTTPS and publicly accessible
2. Verify token matches in Meta Dashboard
3. Check firewall allows Meta IPs
4. Review Meta Dashboard > Webhooks > Logs
5. Resend test webhook from dashboard
```

### OAuth Callback Fails

```
1. Verify redirect URI matches in Meta App
2. Check CORS settings
3. Verify JWT_SECRET is set
4. Check database connection
5. Review application logs
```

### High Latency

```
1. Check database query performance
2. Add Redis caching layer
3. Implement message queue
4. Scale horizontally
5. Review network latency
```

### Rate Limiting Issues

```
1. Verify rate limit logic
2. Check message count tracking
3. Ensure daily reset working
4. Review error logs
5. Check rate limit configuration
```

---

## References

- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [AWS Deployment Guide](https://aws.amazon.com/getting-started/hands-on/serve-a-web-page/module-three/)
- [Heroku Node.js Deployment](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
