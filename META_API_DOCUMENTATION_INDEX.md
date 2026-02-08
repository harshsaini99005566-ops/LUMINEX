# Meta API Integration - Complete Documentation Index

**Project:** Instagram Business Account Automation via Meta API  
**Status:** ✅ COMPLETE  
**Version:** 1.0.0  
**Last Updated:** January 27, 2026

---

## 📋 Documentation Overview

### Getting Started
1. **[Quick Start Guide](#quick-start)** - 5-minute setup
2. **[Environment Setup](#environment-setup)** - Configuration
3. **[API Quick Reference](#api-reference)** - All endpoints

### Implementation Details
4. **[OAuth Integration](#oauth-integration)** - Authentication flow
5. **[Message Management](#message-management)** - Sending & receiving
6. **[Webhook Integration](#webhook-integration)** - Event handling
7. **[Security](#security)** - Encryption & protection

### Deployment & Operations
8. **[Deployment Guide](#deployment)** - Production setup
9. **[Troubleshooting](#troubleshooting)** - Common issues
10. **[Monitoring](#monitoring)** - Health & performance

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
# Copy and edit .env
cp .env.example .env

# Add these variables:
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=verify_token_here
TOKEN_ENCRYPTION_KEY=256bit_hex_key
JWT_SECRET=jwt_secret_here
MONGODB_URI=mongodb+srv://...
```

### 3. Generate Secure Keys
```bash
# Generate 256-bit encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate webhook token
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 4. Start Server
```bash
npm run dev          # Development
npm start            # Production
```

### 5. Configure Meta App
- Go to https://developers.facebook.com
- Create app > Add Instagram product
- Copy App ID & Secret
- Add OAuth redirect URI: `https://your-domain.com/api/instagram/auth/callback`
- Add webhook URL: `https://your-domain.com/webhooks/instagram`
- Set webhook verify token
- Subscribe to: messages, message_echoes, message_template_status_update

### 6. Test Setup
```bash
# Test webhook verification
curl "http://localhost:5001/webhooks/instagram?hub.mode=subscribe&hub.challenge=TEST&hub.verify_token=YOUR_TOKEN"

# Should return: TEST
```

---

## 🔧 Environment Setup

### Required Variables
```env
INSTAGRAM_APP_ID              # From Meta Developer Dashboard
INSTAGRAM_APP_SECRET          # From Meta Developer Dashboard
INSTAGRAM_WEBHOOK_VERIFY_TOKEN # Generated secure token
INSTAGRAM_API_VERSION         # v18.0 or later
TOKEN_ENCRYPTION_KEY          # 256-bit hex (64 chars)
JWT_SECRET                    # JWT signing secret
BACKEND_URL                   # https://api.your-domain.com
FRONTEND_URL                  # https://your-domain.com
API_URL                       # https://api.your-domain.com
MONGODB_URI                   # MongoDB connection string
NODE_ENV                      # production | development
PORT                          # 5001 (default)
```

### Optional Variables
```env
LOG_LEVEL                     # debug | info | warn | error
DEFAULT_DAILY_MESSAGE_LIMIT   # 100 (default)
WEBHOOK_TIMEOUT               # 30000 (milliseconds)
```

---

## 📚 API Reference

### Authentication
```
All protected endpoints require:
Header: Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### OAuth & Accounts
```
GET    /api/instagram/auth/url
       → Returns { url, state }

GET    /api/instagram/auth/callback?code=X&state=Y
       → Handles OAuth response

GET    /api/instagram/accounts
       → Lists all user accounts

GET    /api/instagram/accounts/:id
       → Get account details

DELETE /api/instagram/accounts/:id
       → Disconnect account
```

### Messaging
```
POST   /api/messages/accounts/:id/send
       { recipientId, text }
       → Send text message

POST   /api/messages/accounts/:id/send/template
       { recipientId, templateName, parameters }
       → Send template message

POST   /api/messages/accounts/:id/send/quick-reply
       { recipientId, text, quickReplies: [...] }
       → Send quick reply message

POST   /api/messages/accounts/:id/send/media
       { recipientId, mediaType, mediaUrl, caption }
       → Send media (image/video/audio/file)

GET    /api/messages/accounts/:id/rate-limit
       → Get rate limit status

PUT    /api/messages/accounts/:id/rate-limit
       { dailyLimit }
       → Update daily limit
```

### Webhooks
```
GET    /webhooks/instagram
       → Verification endpoint (called by Meta)

POST   /webhooks/instagram
       → Receive webhook events

GET    /api/webhooks/subscription/status/:id
       → Check webhook subscription status

POST   /api/webhooks/subscription/subscribe/:id
       { fields }
       → Subscribe to webhook fields

POST   /api/webhooks/subscription/unsubscribe/:id
       → Unsubscribe from webhooks

POST   /api/webhooks/subscription/refresh/:id
       → Refresh webhook subscription
```

---

## 🔐 OAuth Integration

### Flow Overview
```
1. User clicks "Connect Instagram"
2. Get auth URL: GET /api/instagram/auth/url
3. Redirect to Instagram login
4. User authorizes permissions
5. Instagram redirects to: /api/instagram/auth/callback?code=X&state=Y
6. Server exchanges code for token
7. Token encrypted and stored
8. Subscribe to webhooks
9. Redirect to success page
```

### Request Example
```javascript
// 1. Get auth URL
const response = await fetch('/api/instagram/auth/url', {
  headers: { 'Authorization': `Bearer ${jwt_token}` }
});
const { url } = await response.json();

// 2. Redirect user
window.location.href = url;

// 3. Handle callback (server-side)
// Exchange code for token, store encrypted
```

### Token Management
- Tokens automatically encrypted at rest
- Stored in InstagramAccount collection
- Automatically refreshed when expired
- Secure decryption on access

---

## 💬 Message Management

### Supported Message Types

#### Text Messages
```javascript
POST /api/messages/accounts/{id}/send
{
  "recipientId": "123456789",
  "text": "Hello, world!"
}
```

#### Quick Reply Messages
```javascript
POST /api/messages/accounts/{id}/send/quick-reply
{
  "recipientId": "123456789",
  "text": "How can we help?",
  "quickReplies": [
    { "title": "Support", "payload": "support" },
    { "title": "Sales", "payload": "sales" }
  ]
}
```

#### Template Messages
```javascript
POST /api/messages/accounts/{id}/send/template
{
  "recipientId": "123456789",
  "templateName": "welcome_message",
  "parameters": ["John", "premium"]
}
```

#### Media Messages
```javascript
POST /api/messages/accounts/{id}/send/media
{
  "recipientId": "123456789",
  "mediaType": "image",  // image | video | audio | file
  "mediaUrl": "https://example.com/image.jpg",
  "caption": "Check this out!"
}
```

### Rate Limiting
- Daily limit per account (default: 100)
- Resets at midnight UTC
- Returns 429 when exceeded
- Updatable via API

---

## 🔔 Webhook Integration

### Webhook Events Handled
1. **Messages** - Incoming user messages
2. **Delivery** - Message delivery confirmations
3. **Read Receipts** - Message read confirmations
4. **Echoes** - Your sent messages
5. **Typing** - User typing indicators

### Event Processing Flow
```
Webhook Event → Signature Verification → Payload Validation →
Event Processing → Database Storage → Success Response
```

### Security
- HMAC-SHA256 signature verification
- Timing-safe comparison
- Payload structure validation
- Always return 200 OK to prevent retries

### Example Event
```json
{
  "object": "instagram",
  "entry": [{
    "id": "page_id",
    "messaging": [{
      "sender": { "id": "user_psid" },
      "recipient": { "id": "page_psid" },
      "timestamp": 1609459200,
      "message": {
        "mid": "message_id",
        "text": "Hello!",
        "attachments": []
      }
    }]
  }]
}
```

---

## 🔒 Security

### Token Encryption
- Algorithm: AES-256-GCM
- Key: Derived from JWT secret using PBKDF2
- Storage: `iv:authTag:encryptedData` format
- Decryption: Automatic on field access

### Webhook Security
- Signature: HMAC-SHA256(payload, APP_SECRET)
- Verification: Timing-safe comparison
- Header: X-Hub-Signature-256

### Authentication
- JWT tokens with 7-day expiry
- CSRF protection via state tokens
- Secure cookie handling
- Account ownership verification

### Data Protection
- HTTPS-only communication
- No sensitive data in logs
- Error messages sanitized
- Rate limiting on API endpoints

---

## 🚀 Deployment

### Pre-Deployment Checklist
- [ ] All environment variables set
- [ ] Database connection verified
- [ ] Webhook URL publicly accessible (HTTPS)
- [ ] SSL certificate valid
- [ ] Meta App webhook configured
- [ ] All scopes authorized
- [ ] Tests passing

### Deployment Steps
1. Set environment variables
2. Configure Meta App webhook URL
3. Deploy backend to production
4. Verify webhook receives test events
5. Test OAuth flow
6. Test message sending
7. Monitor for 24 hours

### Platforms
- **Heroku** - `git push heroku main`
- **AWS EC2** - Manual or with Terraform
- **Docker** - Container deployment
- **Vercel** - API Routes (frontend integration)

---

## 🐛 Troubleshooting

### Common Issues

#### Webhook Not Receiving Events
- Check webhook URL is HTTPS
- Verify token matches in Meta Dashboard
- Ensure firewall allows Meta IPs
- Check Meta Dashboard > Webhooks > Logs
- Test with "Send Test Event" button

#### OAuth Flow Fails
- Verify redirect URI matches exactly
- Check JWT token is valid
- Ensure account is Business type
- Verify INSTAGRAM_APP_ID and SECRET

#### Token Expired Error
- System auto-refreshes (wait a moment)
- Re-authenticate if refresh fails
- Check network connectivity

#### Rate Limit Exceeded
- Check current usage: `GET /api/messages/.../rate-limit`
- Update limit: `PUT /api/messages/.../rate-limit`
- Limit resets at midnight UTC

### Debug Commands
```bash
# Test webhook
curl "http://localhost:5001/webhooks/instagram?hub.mode=subscribe&hub.challenge=TEST&hub.verify_token=TOKEN"

# Test OAuth
curl http://localhost:5001/api/instagram/auth/url \
  -H "Authorization: Bearer JWT"

# Test messaging
curl http://localhost:5001/api/messages/accounts/ID/send \
  -H "Authorization: Bearer JWT" \
  -d '{"recipientId":"123","text":"test"}'

# View logs
tail -f logs/application.log
```

---

## 📊 Monitoring

### Key Metrics
- Webhook delivery success rate
- Message sending latency
- API response times
- Database connection health
- Token refresh success rate
- Error rate and types

### Logging
```bash
# All logs
tail -f logs/application.log

# Filter by component
grep "\[OAuth\]" logs/application.log
grep "\[Webhook\]" logs/application.log
grep "\[Send Message\]" logs/application.log

# Errors only
grep "ERROR" logs/application.log
```

### PM2 Monitoring
```bash
pm2 monit               # Real-time monitoring
pm2 logs app-name       # View logs
pm2 restart app-name    # Restart app
pm2 status              # Check status
```

---

## 📁 File Structure

```
backend/
├── src/
│   ├── models/
│   │   └── InstagramAccount.js      # Enhanced with encryption
│   ├── services/
│   │   ├── instagramOAuth.js        # OAuth flow
│   │   ├── metaApi.js               # Message API
│   │   ├── webhookHandler.js        # Webhook processing
│   │   └── tokenEncryption.js       # Encryption utility
│   ├── routes/
│   │   ├── instagramOAuth.js        # OAuth endpoints
│   │   ├── messages.js              # Message sending
│   │   ├── webhooks.js              # Webhook events
│   │   └── webhookSubscription.js   # Subscription mgmt
│   ├── middleware/
│   │   ├── auth.js                  # JWT auth
│   │   └── subscription.js          # Limits
│   └── server.js                    # Main app
├── logs/
│   └── application.log              # App logs
├── package.json
├── .env.example
└── docs/
    ├── META_API_INTEGRATION_GUIDE.md
    ├── META_API_QUICK_REFERENCE.md
    ├── META_API_DEPLOYMENT_GUIDE.md
    ├── META_API_TROUBLESHOOTING.md
    └── META_API_IMPLEMENTATION_SUMMARY.md
```

---

## 📖 Documentation Files

### Complete Guides
1. **META_API_INTEGRATION_GUIDE.md** (20KB)
   - Architecture overview
   - Detailed OAuth flow
   - Webhook implementation
   - Message management
   - Security best practices
   - Testing procedures

2. **META_API_QUICK_REFERENCE.md** (15KB)
   - API endpoints summary
   - Database schema
   - Environment variables
   - Testing commands
   - Architecture diagram

3. **META_API_DEPLOYMENT_GUIDE.md** (25KB)
   - Step-by-step deployment
   - Platform-specific instructions
   - SSL/HTTPS setup
   - Monitoring & logging
   - Backup & recovery
   - Performance optimization
   - Disaster recovery plan

4. **META_API_TROUBLESHOOTING.md** (20KB)
   - Common issues & solutions
   - Debug commands
   - Error code reference
   - Preventive maintenance
   - Escalation procedures

5. **META_API_IMPLEMENTATION_SUMMARY.md** (10KB)
   - Executive summary
   - Deliverables checklist
   - Technical details
   - Security features
   - File structure
   - Next steps

---

## ✅ Implementation Checklist

### Core Features
- [x] OAuth login flow
- [x] Token encryption (AES-256-GCM)
- [x] Token storage in MongoDB
- [x] Webhook subscription management
- [x] Webhook signature verification
- [x] Incoming message handler
- [x] Message delivery tracking
- [x] Read receipt handling
- [x] Send text messages
- [x] Send quick reply messages
- [x] Send template messages
- [x] Send media messages
- [x] Rate limiting per account
- [x] Daily message limits
- [x] Error tracking & logging

### Security
- [x] HMAC-SHA256 webhook verification
- [x] CSRF protection in OAuth
- [x] Token encryption at rest
- [x] Timing-safe comparison
- [x] Account ownership verification
- [x] Rate limiting
- [x] Error message sanitization
- [x] HTTPS-only communication

### Documentation
- [x] Integration guide
- [x] Quick reference
- [x] Deployment guide
- [x] Troubleshooting guide
- [x] Implementation summary
- [x] API documentation
- [x] Security documentation
- [x] Testing procedures

### Testing
- [x] Webhook verification
- [x] OAuth flow
- [x] Message sending
- [x] Rate limiting
- [x] Error handling
- [x] Token encryption
- [x] Signature verification

---

## 🔗 Related Documentation

### Existing Project Docs
- ARCHITECTURE.md - System architecture
- README.md - Project overview
- DEPLOYMENT_CHECKLIST.md - Deployment checklist
- IMPLEMENTATION_COMPLETE.md - Completion status

### External References
- [Meta Graph API](https://developers.facebook.com/docs/graph-api)
- [Instagram API](https://developers.facebook.com/docs/instagram-api)
- [Webhook Documentation](https://developers.facebook.com/docs/messenger-platform/webhooks)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)

---

## 🎯 Next Steps

### Immediate (Week 1)
1. Deploy to production
2. Configure Meta App webhooks
3. Test OAuth flow with real users
4. Monitor webhook delivery
5. Test all message types

### Short-term (Month 1)
1. Set up monitoring & alerting
2. Implement Redis caching
3. Add message queue (BullMQ)
4. Optimize database queries
5. Scale infrastructure

### Long-term (Months 2-3)
1. AI-powered responses
2. Conversation threading
3. Template management system
4. Analytics dashboard
5. Advanced automation rules

---

## 📞 Support

### For Issues
1. Check [META_API_TROUBLESHOOTING.md](META_API_TROUBLESHOOTING.md)
2. Review logs: `tail -f logs/application.log`
3. Test with curl commands from quick reference
4. Check Meta Dashboard webhook logs
5. Review [META_API_INTEGRATION_GUIDE.md](META_API_INTEGRATION_GUIDE.md)

### For Deployment
1. Follow [META_API_DEPLOYMENT_GUIDE.md](META_API_DEPLOYMENT_GUIDE.md)
2. Use platform-specific instructions
3. Verify all environment variables
4. Test endpoints before production
5. Monitor for 24 hours after deployment

### For Development
1. Review [META_API_INTEGRATION_GUIDE.md](META_API_INTEGRATION_GUIDE.md) for architecture
2. Check [META_API_QUICK_REFERENCE.md](META_API_QUICK_REFERENCE.md) for API endpoints
3. Use debug commands to test
4. Check logs for detailed error messages

---

**Status:** ✅ Complete and Ready for Production  
**Last Updated:** January 27, 2026  
**Version:** 1.0.0
