# Meta API Integration - Quick Reference

## Implementation Checklist

### ✅ Completed Components

- [x] **InstagramAccount Model** - Enhanced with webhook and encryption fields
  - Token encryption (AES-256-GCM)
  - Webhook subscription management
  - Rate limiting per account
  - Error tracking
  - Business account ID storage

- [x] **Token Encryption Utility** (`tokenEncryption.js`)
  - Secure token storage at rest
  - AES-256-GCM authenticated encryption
  - Token hashing for comparison
  - Batch encryption/decryption

- [x] **OAuth Service** (`instagramOAuth.js`)
  - Authorization URL generation
  - Code-to-token exchange
  - Token refresh mechanism
  - Business account info retrieval
  - CSRF protection with state tokens

- [x] **OAuth Routes** (`routes/instagramOAuth.js`)
  - GET `/auth/url` - Generate OAuth URL
  - GET `/auth/callback` - Handle OAuth response
  - GET `/accounts` - List user's accounts
  - GET `/accounts/:id` - Get account details
  - DELETE `/accounts/:id` - Disconnect account
  - POST `/accounts/:id/messages` - Send message

- [x] **Meta API Service** (`metaApi.js`)
  - Text message sending
  - Quick reply messages
  - Template messages
  - Media attachments (image, video, audio, file)
  - Message details retrieval
  - Conversation management
  - Read receipts and typing indicators
  - Account insights
  - Welcome message management

- [x] **Webhook Handler** (`webhookHandler.js`)
  - Signature verification (HMAC-SHA256)
  - Token validation
  - Message processing
  - Delivery confirmations
  - Read receipts
  - Message echoes
  - Payload validation

- [x] **Webhook Routes** (`routes/webhooks.js`)
  - GET `/instagram` - Webhook verification
  - POST `/instagram` - Receive webhook events

- [x] **Message API** (`routes/messages.js`)
  - POST `/send` - Send text message
  - POST `/send/template` - Send template
  - POST `/send/quick-reply` - Send quick replies
  - POST `/send/media` - Send media
  - GET `/rate-limit` - Check rate status
  - PUT `/rate-limit` - Update daily limit
  - GET `/message/:id` - Get message details

- [x] **Webhook Subscription Management** (`routes/webhookSubscription.js`)
  - GET `/subscription/status/:id` - Check webhook status
  - POST `/subscription/subscribe/:id` - Subscribe to webhooks
  - POST `/subscription/unsubscribe/:id` - Unsubscribe
  - POST `/subscription/refresh/:id` - Refresh subscription

---

## API Endpoints Summary

### OAuth & Account Management
```
GET    /api/instagram/auth/url              # Generate OAuth URL
GET    /api/instagram/auth/callback         # Handle OAuth callback
GET    /api/instagram/accounts              # List all accounts
GET    /api/instagram/accounts/:id          # Get account details
DELETE /api/instagram/accounts/:id          # Disconnect account
```

### Message Sending
```
POST /api/messages/accounts/:id/send               # Text message
POST /api/messages/accounts/:id/send/template      # Template message
POST /api/messages/accounts/:id/send/quick-reply   # Quick reply
POST /api/messages/accounts/:id/send/media         # Media message
GET  /api/messages/accounts/:id/rate-limit         # Check rate limit
PUT  /api/messages/accounts/:id/rate-limit         # Update limit
GET  /api/messages/accounts/:id/message/:msgId     # Get message details
```

### Webhook Management
```
GET  /api/webhooks/subscription/status/:id       # Check status
POST /api/webhooks/subscription/subscribe/:id    # Subscribe
POST /api/webhooks/subscription/unsubscribe/:id  # Unsubscribe
POST /api/webhooks/subscription/refresh/:id      # Refresh
```

### Webhook Events
```
GET  /webhooks/instagram       # Webhook verification
POST /webhooks/instagram       # Receive events
```

---

## Database Schema

### InstagramAccount
```javascript
{
  user: ObjectId,                           // Reference to User
  instagramId: String,                      // Instagram user ID
  businessAccountId: String,                // Meta business account ID
  pageId: String,                           // Facebook page ID
  username: String,                         // Instagram @username
  name: String,                             // Account display name
  profilePicture: String,                   // Profile image URL
  followersCount: Number,                   // Current followers
  websiteUrl: String,                       // Link in bio
  email: String,                            // Associated email
  
  // Encrypted token fields
  accessToken: String,                      // AES-256-GCM encrypted
  refreshToken: String,                     // AES-256-GCM encrypted
  tokenExpiresAt: Date,
  tokenType: String,                        // USER_ACCESS_TOKEN | SYSTEM_USER_TOKEN
  lastTokenRefresh: Date,
  
  // Webhook management
  webhookVerifyToken: String,
  webhookSubscribed: Boolean,
  webhookSubscriptionFields: [String],
  lastWebhookSubscriptionAt: Date,
  webhookSubscriptionStatus: String,        // active | inactive | failed
  
  // Account status
  isActive: Boolean,
  accountStatus: String,                    // connected | disconnected | error | suspended
  lastStatusCheck: Date,
  
  // Sync & metadata
  connectedAt: Date,
  disconnectedAt: Date,
  lastSyncedAt: Date,
  syncStatus: String,                       // syncing | synced | failed | idle
  
  // Rate limiting
  messagingLimitResetTime: Date,
  messagesSentToday: Number,
  dailyMessageLimit: Number,                // Default: 100
  
  // Error tracking
  lastError: String,
  lastErrorAt: Date,
  errorCount: Number,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Features

### Token Encryption
- Algorithm: AES-256-GCM (Galois/Counter Mode)
- Key Derivation: PBKDF2 using master secret
- Format: `iv:authTag:encryptedData` (hex)
- Stored encrypted at rest in MongoDB

### Webhook Security
- HMAC-SHA256 signature verification
- Timing-safe comparison (prevents timing attacks)
- Payload validation
- CSRF protection via state token in OAuth

### Rate Limiting
- Per-account daily message limits
- Automatic reset at midnight UTC
- 429 response when limit exceeded
- Configurable limits per subscription tier

### Error Handling
- Comprehensive logging of all operations
- Error tracking with counts and timestamps
- Graceful degradation on failures
- Automatic retry mechanisms

---

## Environment Variables Required

```env
# Meta API
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=
INSTAGRAM_API_VERSION=v18.0

# URLs
BACKEND_URL=
FRONTEND_URL=
API_URL=

# Security
TOKEN_ENCRYPTION_KEY=              # 256-bit hex
JWT_SECRET=
JWT_EXPIRY=7d

# Database
MONGODB_URI=

# Logging
LOG_LEVEL=info
```

---

## Testing Commands

### Webhook Verification
```bash
curl -X GET "http://localhost:5001/webhooks/instagram?hub.mode=subscribe&hub.challenge=CHALLENGE&hub.verify_token=VERIFY_TOKEN"
```

### Get Auth URL
```bash
curl -X GET http://localhost:5001/api/instagram/auth/url \
  -H "Authorization: Bearer JWT_TOKEN"
```

### Send Message
```bash
curl -X POST http://localhost:5001/api/messages/accounts/ACCOUNT_ID/send \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipientId":"USER_PSID","text":"Hello"}'
```

### Check Webhook Status
```bash
curl -X GET http://localhost:5001/api/webhooks/subscription/status/ACCOUNT_ID \
  -H "Authorization: Bearer JWT_TOKEN"
```

### Subscribe to Webhooks
```bash
curl -X POST http://localhost:5001/api/webhooks/subscription/subscribe/ACCOUNT_ID \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fields":["messages","message_echoes","message_template_status_update"]}'
```

---

## Architecture Overview

```
Meta Graph API
       ↓
  ┌────────────────────────────────┐
  │ OAuth Flow                      │
  ├────────────────────────────────┤
  │ 1. Generate Auth URL            │
  │ 2. User Authorizes              │
  │ 3. Callback with Code           │
  │ 4. Exchange for Access Token    │
  │ 5. Store Encrypted Token        │
  └────────────────────────────────┘
       ↓
  ┌────────────────────────────────┐
  │ Token Management                │
  ├────────────────────────────────┤
  │ • Encrypt with AES-256-GCM      │
  │ • Store in MongoDB              │
  │ • Refresh when expired          │
  │ • Error tracking                │
  └────────────────────────────────┘
       ↓
  ┌────────────────────────────────┐
  │ Message Sending                 │
  ├────────────────────────────────┤
  │ • Text messages                 │
  │ • Templates                     │
  │ • Quick replies                 │
  │ • Media attachments             │
  │ • Rate limiting                 │
  └────────────────────────────────┘
       ↓
  ┌────────────────────────────────┐
  │ Webhook Events                  │
  ├────────────────────────────────┤
  │ • Signature verification        │
  │ • Incoming messages             │
  │ • Delivery confirmations        │
  │ • Read receipts                 │
  │ • Message echoes                │
  └────────────────────────────────┘
       ↓
    MongoDB
```

---

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   └── InstagramAccount.js        ✅ Enhanced with encryption & webhooks
│   ├── services/
│   │   ├── instagramOAuth.js          ✅ OAuth flow
│   │   ├── metaApi.js                 ✅ Message API
│   │   ├── webhookHandler.js          ✅ Webhook processing
│   │   └── tokenEncryption.js         ✅ Encryption utility
│   ├── routes/
│   │   ├── instagramOAuth.js          ✅ OAuth endpoints
│   │   ├── messages.js                ✅ Message sending
│   │   ├── webhooks.js                ✅ Webhook events
│   │   └── webhookSubscription.js     ✅ Subscription management
│   ├── middleware/
│   │   ├── auth.js                    ✅ JWT authentication
│   │   └── subscription.js            ✅ Account limits
│   └── server.js                      ✅ Main app
└── utils/
    └── logger.js                      ✅ Logging
```

---

## Next Steps

1. **Deploy to Production**
   - Set environment variables
   - Configure Meta App webhook URL
   - Test all endpoints

2. **Monitor & Logging**
   - Watch for webhook delivery failures
   - Track API usage
   - Monitor error rates

3. **Scaling**
   - Implement message queue (BullMQ)
   - Add caching layer (Redis)
   - Database optimization

4. **Advanced Features**
   - Conversation threading
   - Media storage
   - AI-powered responses
   - Template management

---

## References

- [Meta Graph API v18.0](https://developers.facebook.com/docs/graph-api)
- [Instagram Business Account API](https://developers.facebook.com/docs/instagram-api)
- [Webhook Documentation](https://developers.facebook.com/docs/messenger-platform/webhooks)
- [OAuth 2.0 Best Practices](https://auth0.com/docs/get-started/auth0-overview/create-applications)
