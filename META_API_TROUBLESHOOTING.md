# Meta API Integration - Troubleshooting Guide

## Quick Diagnosis

Use this guide to quickly identify and resolve common issues.

---

## Webhook Issues

### Issue: "Invalid Webhook Token"

**Error Message:** `Webhook Verification Failed - Invalid token`

**Diagnosis:**
```bash
# Check verify token in .env
echo $INSTAGRAM_WEBHOOK_VERIFY_TOKEN

# Check token in Meta Dashboard
# Settings > Webhooks > Verify Token
```

**Solutions:**
1. Verify token matches exactly (no spaces)
2. Restart server after changing .env
3. Copy-paste verify token from Meta Dashboard
4. Check for special characters

**Test:**
```bash
VERIFY_TOKEN="your_token_here"
curl -X GET "http://localhost:5001/webhooks/instagram?hub.mode=subscribe&hub.challenge=CHALLENGE&hub.verify_token=$VERIFY_TOKEN"
# Should return: CHALLENGE
```

---

### Issue: "Signature Validation Failed"

**Error Message:** `[Webhook Signature] Invalid signature detected`

**Diagnosis:**
```javascript
// Check if raw body is being used
console.log(typeof req.rawBody); // Should be string
console.log(typeof JSON.stringify(req.body)); // For comparison
```

**Solutions:**
1. Ensure middleware captures raw body BEFORE JSON parsing
2. Check APP_SECRET is correct
3. Verify X-Hub-Signature-256 header is present
4. Don't modify payload after capture

**Code Check:**
```javascript
// Correct order in server.js:
app.use((req, res, next) => {
  let rawBody = '';
  req.on('data', chunk => { rawBody += chunk; });
  req.on('end', () => { req.rawBody = rawBody; next(); });
});
app.use(express.json()); // After raw body capture
```

---

### Issue: Webhook Not Receiving Events

**Diagnosis:**
```bash
# 1. Test webhook URL is accessible
curl -I https://api.your-domain.com/webhooks/instagram
# Should return 200, not 404/500

# 2. Check firewall allows Meta IPs
# Meta uses these IP ranges for webhooks

# 3. Check Meta Dashboard for errors
# Settings > Webhooks > Logs
```

**Solutions:**
1. Ensure HTTPS (not HTTP)
2. Verify URL is publicly accessible
3. Check firewall/security groups allow incoming
4. Verify webhook fields are subscribed:
   - [ ] messages
   - [ ] message_echoes
   - [ ] message_template_status_update
5. Test with Meta Dashboard "Send Test Event"

**Debug:**
```javascript
// Add logging in webhook route
router.post('/instagram', (req, res) => {
  console.log('Webhook received:', {
    header: req.headers['x-hub-signature-256'],
    payload: req.body,
    rawBody: req.rawBody
  });
  // ... continue processing
});
```

---

## OAuth Issues

### Issue: "OAuth Flow Fails at Callback"

**Error:** Callback URL returns error instead of success

**Diagnosis:**
```bash
# 1. Check redirect URI in Meta App
# Settings > Authorized OAuth Redirect URIs

# 2. Check JWT token validity
# Decode: jwt.io

# 3. Check database connection
# Try direct MongoDB query
```

**Solutions:**
1. Verify redirect URI matches EXACTLY in Meta Dashboard
2. Check for trailing slashes
3. Ensure JWT_SECRET is set
4. Verify MONGODB_URI is correct
5. Check account is Instagram Business (not Personal)

**Test:**
```bash
# Get auth URL
curl -X GET http://localhost:5001/api/instagram/auth/url \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Manually test callback with code
curl -X GET "http://localhost:5001/api/instagram/auth/callback?code=TEST_CODE&state=TEST_STATE"
```

---

### Issue: "No Business Account Found"

**Error:** `No business account associated with this Instagram account`

**Diagnosis:**
```javascript
// Check if account is Business type
const response = await axios.get(`${GRAPH_API}/${instagramId}`, {
  params: {
    fields: 'ig_business_account',
    access_token: accessToken
  }
});
console.log(response.data); // Should have ig_business_account
```

**Solutions:**
1. Convert Personal account to Business:
   - Go to Instagram Settings > Account > Account Type
   - Switch to Business Account
2. Reconnect after conversion
3. Verify token has correct scopes

**Required Scopes:**
- instagram_business_basic
- instagram_business_content_publish
- instagram_business_manage_messages
- instagram_business_manage_comments
- pages_read_engagement

---

### Issue: "Token Expired / Invalid Token"

**Error:** `[Meta API] Token expired or invalid`

**Diagnosis:**
```bash
# Check token expiration in database
db.instagramaccounts.findOne({}, { tokenExpiresAt: 1 })

# Check if token refresh is working
grep "Token Refresh" logs/application.log
```

**Solutions:**
1. System auto-refreshes tokens - wait a moment
2. Re-authenticate if refresh fails
3. Ensure token has sufficient TTL
4. Check network connectivity to Meta API

**Manual Test:**
```bash
# Send message with account
curl -X POST http://localhost:5001/api/messages/accounts/{accountId}/send \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"recipientId":"user_psid","text":"test"}'

# If token error, refresh and retry
```

---

## Message Sending Issues

### Issue: "Daily Limit Exceeded"

**Error:** `HTTP 429 - Daily message limit reached`

**Diagnosis:**
```bash
# Check current usage
curl -X GET http://localhost:5001/api/messages/accounts/{accountId}/rate-limit \
  -H "Authorization: Bearer JWT_TOKEN"

# Response shows: sentToday, dailyLimit, remaining
```

**Solutions:**
1. Wait for midnight UTC (daily reset)
2. Update limit if you have higher quota:
   ```bash
   curl -X PUT http://localhost:5001/api/messages/accounts/{accountId}/rate-limit \
     -H "Authorization: Bearer JWT_TOKEN" \
     -d '{"dailyLimit":200}'
   ```
3. Check if limit is per account or system-wide

**Debug:**
```javascript
// Check rate limit tracking
const account = await InstagramAccount.findById(accountId);
console.log({
  sentToday: account.messagesSentToday,
  limit: account.dailyMessageLimit,
  resetTime: account.messagingLimitResetTime
});
```

---

### Issue: "Failed to Send Message"

**Error:** `Failed to send message`

**Diagnosis:**
```bash
# 1. Check account status
curl -X GET http://localhost:5001/api/instagram/accounts/{accountId} \
  -H "Authorization: Bearer JWT_TOKEN"

# 2. Check logs for detailed error
grep "Send Message" logs/application.log

# 3. Verify recipient ID is correct
# Should be numeric PSID
```

**Solutions:**
1. Verify recipientId is valid PSID (numeric)
2. Check message is not empty
3. Ensure message < 4096 characters
4. Verify account is still active
5. Check token hasn't been revoked in Instagram settings

**Test Message:**
```bash
curl -X POST http://localhost:5001/api/messages/accounts/ACCOUNT_ID/send \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "123456789",
    "text": "Test message"
  }'
```

---

### Issue: "No Business Account Found" (on Message Send)

**Error:** When sending message: `No business account found`

**Diagnosis:**
```javascript
// Check businessAccountId is stored
db.instagramaccounts.findOne({ _id: ObjectId("...") }, { businessAccountId: 1 })

// Check if needed to get businessAccountId
const response = await axios.get(`${GRAPH_API}/${instagramId}`, {
  params: { fields: 'ig_business_account', access_token: token }
});
```

**Solutions:**
1. Reconnect Instagram account (OAuth flow)
2. Ensure account is Business type
3. Check if Instagram structure changed
4. Update businessAccountId manually if needed

---

## Token & Encryption Issues

### Issue: "Token Decryption Failed"

**Error:** Decrypted token returns null

**Diagnosis:**
```bash
# Check TOKEN_ENCRYPTION_KEY is set
echo $TOKEN_ENCRYPTION_KEY
# Should be 64 character hex string

# Verify key generation
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Solutions:**
1. Regenerate TOKEN_ENCRYPTION_KEY (must be 64 hex chars)
2. Re-encrypt tokens by re-authenticating
3. Verify token format: `iv:authTag:encryptedData`

**Key Generation:**
```bash
# Generate proper 256-bit hex key
node -e "console.log('TOKEN_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

---

### Issue: "Invalid Encrypted Token Format"

**Error:** Token doesn't match expected format

**Solutions:**
1. Check if token was encrypted with correct key
2. Verify database stores correct format
3. Check for data corruption
4. Re-authenticate to get new token

---

## Database Issues

### Issue: "Database Connection Failed"

**Error:** `MongoDB connection failed` or `connection timeout`

**Diagnosis:**
```bash
# Test connection string
mongosh "mongodb+srv://user:pass@cluster..."

# Check network connectivity
ping cluster.mongodb.net

# Check firewall rules
```

**Solutions:**
1. Verify MONGODB_URI is correct
2. Check IP whitelist in MongoDB Atlas:
   - Security > Network Access
   - Add your server IP
3. Verify username/password
4. Check database exists
5. Increase connection timeout if needed

**Connection String Check:**
```bash
# Test with mongosh
mongosh "your_mongodb_uri"

# Or with Node.js
node -e "
const mongoose = require('mongoose');
mongoose.connect('YOUR_URI')
  .then(() => console.log('Connected'))
  .catch(e => console.error(e))
"
```

---

### Issue: "Duplicate Key Error"

**Error:** `E11000 duplicate key error`

**Diagnosis:**
```bash
# Check for duplicate indexes
db.instagramaccounts.getIndexes()

# Find duplicate entries
db.instagramaccounts.aggregate([
  { $group: { _id: "$instagramId", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```

**Solutions:**
1. Drop duplicate indexes:
   ```bash
   db.instagramaccounts.dropIndex("instagramId_1")
   ```
2. Remove duplicate documents manually
3. Add unique constraint properly:
   ```bash
   db.instagramaccounts.createIndex({ instagramId: 1 }, { unique: true })
   ```

---

## Performance Issues

### Issue: "Slow Message Sending"

**Diagnosis:**
```bash
# Check response time
time curl -X POST http://localhost:5001/api/messages/accounts/{accountId}/send

# Check database performance
db.instagramaccounts.find().explain("executionStats")

# Check network latency
ping graph.instagram.com
```

**Solutions:**
1. Add database indexes:
   ```bash
   db.instagramaccounts.createIndex({ user: 1 })
   db.instagramaccounts.createIndex({ instagramId: 1 })
   ```
2. Enable Redis caching
3. Implement message queue
4. Scale horizontally

---

### Issue: "High Memory Usage"

**Diagnosis:**
```bash
# Check Node.js memory
ps aux | grep node
# Look at RSS column

# Monitor with PM2
pm2 monit
```

**Solutions:**
1. Implement pagination for large queries
2. Use `.lean()` for read-only queries
3. Close connections properly
4. Monitor memory leaks with clinic.js
5. Increase Node heap size if needed

---

## Logging & Debugging

### Enable Debug Logging

```bash
# In .env
DEBUG=meta-api:*
LOG_LEVEL=debug

# Or at runtime
NODE_DEBUG=http node src/server.js
```

### View Logs

```bash
# All logs
tail -f logs/application.log

# Filter by component
grep "\[OAuth\]" logs/application.log
grep "\[Webhook\]" logs/application.log
grep "\[Send Message\]" logs/application.log

# Real-time errors
tail -f logs/application.log | grep ERROR
```

### Test Commands

```bash
# Test webhook verification
curl http://localhost:5001/webhooks/instagram?hub.mode=subscribe&hub.challenge=TEST&hub.verify_token=TEST

# Test OAuth
curl http://localhost:5001/api/instagram/auth/url \
  -H "Authorization: Bearer JWT"

# Test messaging
curl http://localhost:5001/api/messages/accounts/ID/send \
  -H "Authorization: Bearer JWT" \
  -d '{"recipientId":"123","text":"test"}'

# Check health
curl http://localhost:5001/health
```

---

## Getting Help

### Useful Commands

```bash
# Check service status
pm2 status

# View recent logs
pm2 logs instagram-api --lines 100

# Restart service
pm2 restart instagram-api

# View detailed info
pm2 info instagram-api
```

### Escalation Path

1. **Check logs:** `tail -f logs/application.log`
2. **Verify configuration:** Check all .env variables
3. **Test components:** Use curl commands above
4. **Check Meta Dashboard:** Webhooks, App settings
5. **Review documentation:** META_API_INTEGRATION_GUIDE.md
6. **Contact support:** With logs and error details

---

## Common Error Codes

| Error | Cause | Solution |
|-------|-------|----------|
| 401 | Invalid JWT token | Re-authenticate user |
| 403 | Webhook signature invalid | Check APP_SECRET |
| 404 | Account not found | Verify account ID |
| 429 | Rate limit exceeded | Wait or increase limit |
| 500 | Server error | Check logs |
| ECONNREFUSED | Can't connect to Meta API | Check network |
| ETIMEDOUT | Request timeout | Increase timeout |

---

## Preventive Maintenance

### Daily
- [ ] Monitor error logs
- [ ] Check webhook delivery
- [ ] Verify API response times

### Weekly
- [ ] Review rate limit usage
- [ ] Check database performance
- [ ] Test OAuth flow

### Monthly
- [ ] Rotate encryption keys
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Backup database

---

**Last Updated:** January 27, 2026
