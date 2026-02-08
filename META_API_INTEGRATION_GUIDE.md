# Instagram Business Account - Meta API Integration Guide

## Complete Implementation Overview

This guide covers the complete integration of Instagram Business Account connection using Meta API with secure OAuth, webhook handling, and message management.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Setup & Configuration](#setup--configuration)
3. [OAuth Flow](#oauth-flow)
4. [Webhook Integration](#webhook-integration)
5. [Message Management](#message-management)
6. [Security](#security)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      Meta Graph API (v18.0+)                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────┐         ┌────────┐        ┌──────────┐
    │ OAuth  │         │Webhooks│        │Messaging │
    │ Flow   │         │Handler │        │API       │
    └────┬───┘         └───┬────┘        └────┬─────┘
         │                 │                   │
         ▼                 ▼                   ▼
    ┌────────────────────────────────────────────────┐
    │     Backend Services (Node.js/Express)        │
    │                                                │
    │  instagramOAuth.js    webhookHandler.js        │
    │  metaApi.js           messages.js              │
    │  webhookSubscription.js                        │
    └──────────────────┬─────────────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────────┐
    │          MongoDB Database                    │
    │  InstagramAccount  Message  Conversation    │
    │  User              Subscription             │
    └──────────────────────────────────────────────┘
```

### Key Features

- **OAuth 2.0**: Secure user authorization with Meta
- **Token Encryption**: AES-256-GCM encryption for tokens
- **Webhook Verification**: HMAC-SHA256 signature validation
- **Message Queue**: Handle multiple message types
- **Rate Limiting**: Daily message limits per account
- **Error Handling**: Comprehensive logging and recovery

---

## Setup & Configuration

### 1. Environment Variables

Create `.env` file in backend directory:

```env
# Meta API Configuration
INSTAGRAM_APP_ID=your_app_id
INSTAGRAM_APP_SECRET=your_app_secret
INSTAGRAM_API_VERSION=v18.0
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token

# Token Encryption
TOKEN_ENCRYPTION_KEY=your_256bit_encryption_key

# URLs
BACKEND_URL=https://your-backend-url.com
FRONTEND_URL=https://your-frontend-url.com
API_URL=https://your-api-url.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db_name

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=7d
```

### 2. Database Indexes

The InstagramAccount model automatically creates indexes for:

```javascript
// Performance indexes
- { user: 1 }
- { instagramId: 1 }
- { businessAccountId: 1 }
- { pageId: 1 }
- { username: 1 }
- { webhookSubscribed: 1 }
- { accountStatus: 1 }
- { createdAt: -1 }
```

### 3. Meta App Setup

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a new app (Business or Consumer type)
3. Add Instagram product
4. Configure OAuth redirect URIs
5. Get App ID and Secret
6. Generate webhook verify token

---

## OAuth Flow

### Step 1: User Initiates Login

**Frontend:**

```javascript
// Get auth URL from backend
const response = await fetch('/api/instagram/auth/url', {
  headers: { 'Authorization': `Bearer ${jwt_token}` }
});
const { url } = await response.json();

// Redirect to Meta
window.location.href = url;
```

### Step 2: Generate Auth URL

**Backend Route:** `GET /api/instagram/auth/url`

```javascript
// Returns OAuth URL with CSRF state token
{
  "url": "https://www.instagram.com/oauth/authorize?...",
  "state": "csrf_token_hex"
}
```

### Step 3: User Authorizes

User logs in to Instagram and grants permissions:

- `instagram_business_basic`
- `instagram_business_content_publish`
- `instagram_business_manage_messages`
- `instagram_business_manage_comments`
- `pages_read_engagement`

### Step 4: Handle Callback

**Backend Route:** `GET /api/instagram/auth/callback`

Query Parameters: `code`, `state`

```javascript
// Service: instagramOAuth.js
1. Verify state token (CSRF protection)
2. Exchange code for access token
3. Get account info from Meta
4. Encrypt and store token in database
5. Subscribe to webhooks
6. Redirect to dashboard
```

### Step 5: Token Storage

Tokens are encrypted before storage using AES-256-GCM:

```javascript
// InstagramAccount Schema
{
  accessToken: String,      // Encrypted with AES-256-GCM
  refreshToken: String,     // Encrypted
  tokenExpiresAt: Date,
  tokenType: String,        // USER_ACCESS_TOKEN | SYSTEM_USER_TOKEN
  lastTokenRefresh: Date
}
```

---

## Webhook Integration

### 1. Webhook Configuration

In Meta App Dashboard:

1. Go to Settings > Webhooks
2. Configure Webhook URL: `https://your-backend-url.com/webhooks/instagram`
3. Set Verify Token: (use `INSTAGRAM_WEBHOOK_VERIFY_TOKEN`)
4. Subscribe to Events:
   - messages
   - message_echoes
   - message_template_status_update

### 2. Webhook Verification

**Route:** `GET /webhooks/instagram`

Meta will send:
```
?hub.mode=subscribe
&hub.challenge=CHALLENGE_STRING
&hub.verify_token=YOUR_VERIFY_TOKEN
```

Backend responds with `CHALLENGE_STRING` to verify URL.

### 3. Webhook Events Processing

**Route:** `POST /webhooks/instagram`

Meta sends signed events:
```
Header: X-Hub-Signature-256: sha256=hash
Body: { entry: [ { messaging: [ { ... } ] } ] }
```

#### Signature Verification

```javascript
// Services/webhookHandler.js
const hash = HMAC-SHA256(payload, APP_SECRET);
const expected = 'sha256=' + hash;
// Compare with header using timing-safe comparison
```

### 4. Event Types Handled

#### Incoming Message
```javascript
{
  "sender": { "id": "user_psid" },
  "recipient": { "id": "page_psid" },
  "message": {
    "mid": "message_id",
    "text": "message content",
    "attachments": []
  },
  "timestamp": 1609459200
}
```

**Processing:**
1. Find InstagramAccount by recipient ID
2. Create/update Conversation
3. Store Message in database
4. Trigger automation rules

#### Delivery Confirmation
```javascript
{
  "delivery": {
    "mids": ["mid1", "mid2"],
    "watermark": 1609459200
  }
}
```

**Processing:**
- Update message status to "delivered"
- Set deliveredAt timestamp

#### Read Receipt
```javascript
{
  "read": {
    "watermark": 1609459200
  }
}
```

**Processing:**
- Update messages to status "read"
- Set readAt timestamp

---

## Message Management

### 1. Sending Messages

#### Text Message

**Endpoint:** `POST /api/messages/accounts/{accountId}/send`

```javascript
{
  "recipientId": "user_psid",
  "text": "Hello from bot!"
}
```

**Response:**
```javascript
{
  "success": true,
  "messageId": "message_id",
  "remaining": 99  // remaining in daily limit
}
```

#### Quick Reply Message

**Endpoint:** `POST /api/messages/accounts/{accountId}/send/quick-reply`

```javascript
{
  "recipientId": "user_psid",
  "text": "How can we help?",
  "quickReplies": [
    { "title": "Support", "payload": "support" },
    { "title": "Sales", "payload": "sales" }
  ]
}
```

#### Template Message

**Endpoint:** `POST /api/messages/accounts/{accountId}/send/template`

```javascript
{
  "recipientId": "user_psid",
  "templateName": "welcome_message",
  "parameters": ["John", "premium"]
}
```

#### Media Message

**Endpoint:** `POST /api/messages/accounts/{accountId}/send/media`

```javascript
{
  "recipientId": "user_psid",
  "mediaType": "image",  // image | video | audio | file
  "mediaUrl": "https://example.com/image.jpg",
  "caption": "Check this out!"
}
```

### 2. Rate Limiting

#### Daily Limits

```javascript
// Get current status
GET /api/messages/accounts/{accountId}/rate-limit

// Response
{
  "dailyLimit": 100,
  "sentToday": 45,
  "remaining": 55,
  "resetTime": "2024-01-27T00:00:00Z",
  "canSend": true
}
```

#### Update Limits

```javascript
PUT /api/messages/accounts/{accountId}/rate-limit
{
  "dailyLimit": 200
}
```

#### Limit Enforcement

- Checked on every send request
- Resets daily at midnight UTC
- Returns 429 (Too Many Requests) when exceeded
- Stored per InstagramAccount

---

## Webhook Subscription Management

### 1. Subscribe to Webhooks

**Endpoint:** `POST /api/webhooks/subscription/subscribe/{accountId}`

```javascript
{
  "fields": [
    "messages",
    "message_echoes",
    "message_template_status_update"
  ]
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Webhook subscription successful",
  "fields": ["messages", "message_echoes", ...],
  "status": "active"
}
```

### 2. Check Subscription Status

**Endpoint:** `GET /api/webhooks/subscription/status/{accountId}`

```javascript
{
  "accountId": "...",
  "instagramUsername": "@myusername",
  "webhookSubscribed": true,
  "webhookStatus": "active",  // active | inactive | failed
  "subscriptionFields": [...],
  "lastSubscriptionTime": "2024-01-27T10:30:00Z",
  "isActive": true
}
```

### 3. Refresh Subscription

**Endpoint:** `POST /api/webhooks/subscription/refresh/{accountId}`

Use when webhook subscription fails or needs renewal:

```javascript
{
  "success": true,
  "message": "Webhook subscription refreshed",
  "fields": ["messages", "message_echoes", ...],
  "status": "active"
}
```

### 4. Unsubscribe

**Endpoint:** `POST /api/webhooks/subscription/unsubscribe/{accountId}`

```javascript
{
  "success": true,
  "message": "Webhook unsubscription successful"
}
```

---

## Security

### 1. Token Encryption

All tokens are encrypted at rest using AES-256-GCM:

```javascript
// Encryption
const encrypted = encryptToken(token);
// Format: iv:authTag:encryptedData

// Decryption
const decrypted = decryptToken(encrypted);
```

### 2. Webhook Signature Verification

Every webhook is verified before processing:

```javascript
// Meta sends X-Hub-Signature-256 header
const signature = req.headers['x-hub-signature-256'];
const hash = HMAC-SHA256(payload, APP_SECRET);
// Constant-time comparison to prevent timing attacks
```

### 3. CSRF Protection

OAuth flow uses state parameter:

```javascript
// 1. Generate random state token
const state = crypto.randomBytes(16).toString('hex');

// 2. Store in user document
user.instagramOAuthState = state;

// 3. Verify on callback
if (user.instagramOAuthState !== state) {
  throw new Error('CSRF violation');
}
```

### 4. Rate Limiting

- Daily message limits per account
- Prevents abuse and cost overruns
- Configurable per subscription tier

### 5. Error Handling

- Comprehensive logging of all operations
- Error tracking with timestamp and count
- Automatic retry with exponential backoff
- Graceful degradation on failures

---

## Testing

### 1. Manual Testing

#### Test Webhook Verification

```bash
curl -X GET "http://localhost:5001/webhooks/instagram?hub.mode=subscribe&hub.challenge=CHALLENGE&hub.verify_token=VERIFY_TOKEN"
```

Expected Response:
```
CHALLENGE
```

#### Test Webhook Event

```bash
curl -X POST http://localhost:5001/webhooks/instagram \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=hash" \
  -d '{"object":"instagram","entry":[{"messaging":[{"sender":{"id":"123"},"message":{"mid":"m123","text":"hello"}}]}]}'
```

#### Test Message Sending

```bash
curl -X POST http://localhost:5001/api/messages/accounts/{accountId}/send \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "user_psid",
    "text": "Test message"
  }'
```

### 2. Unit Tests

Create `tests/meta-api.test.js`:

```javascript
describe('Meta API Integration', () => {
  
  describe('OAuth', () => {
    test('should generate auth URL with state', async () => {
      // Test implementation
    });

    test('should exchange code for token', async () => {
      // Test implementation
    });
  });

  describe('Webhook', () => {
    test('should verify webhook signature', () => {
      // Test implementation
    });

    test('should process incoming message', async () => {
      // Test implementation
    });
  });

  describe('Messaging', () => {
    test('should send text message', async () => {
      // Test implementation
    });

    test('should enforce rate limits', async () => {
      // Test implementation
    });
  });
});
```

### 3. Integration Tests

Test full flow:

```javascript
// 1. OAuth flow
// 2. Message sending
// 3. Webhook receiving
// 4. Message delivery
// 5. Rate limit enforcement
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid Webhook Token"

**Problem:** Webhook verification fails

**Solution:**
- Check `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` in .env matches Meta settings
- Verify exact string match (no extra spaces)
- Restart server after env changes

#### 2. "Signature Validation Failed"

**Problem:** Webhook events rejected

**Solution:**
- Verify `INSTAGRAM_APP_SECRET` is correct
- Check raw body is being used (not JSON parsed body)
- Ensure no middleware is modifying the payload

#### 3. "No Business Account Found"

**Problem:** Cannot get business account ID

**Solution:**
- Account must have Instagram Business profile (not Personal)
- May need to convert Personal to Business in Instagram settings
- Check token has correct scopes

#### 4. "Daily Limit Exceeded"

**Problem:** Messages not sending

**Solution:**
- Check remaining limit: `GET /api/messages/accounts/{accountId}/rate-limit`
- Update limit if needed: `PUT /api/webhooks/subscription/{accountId}`
- Limit resets at midnight UTC

#### 5. "Token Expired"

**Problem:** Messages fail with auth error

**Solution:**
- System automatically refreshes tokens
- Check `lastTokenRefresh` timestamp
- May need to re-authenticate if refresh fails

### Debug Logging

Enable detailed logging:

```javascript
// In .env
LOG_LEVEL=debug
DEBUG=meta-api:*
```

View logs:

```bash
tail -f logs/application.log
```

Key log prefixes:
- `[OAuth]` - OAuth flow
- `[Token Refresh]` - Token operations
- `[Webhook]` - Webhook events
- `[Send Message]` - Message sending
- `[Meta API]` - API calls

---

## API Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/instagram/auth/url` | Get OAuth URL |
| GET | `/api/instagram/auth/callback` | Handle OAuth callback |
| GET | `/api/instagram/accounts` | List accounts |
| GET | `/api/instagram/accounts/:id` | Get account details |
| DELETE | `/api/instagram/accounts/:id` | Disconnect account |
| POST | `/api/messages/accounts/:id/send` | Send text message |
| POST | `/api/messages/accounts/:id/send/quick-reply` | Send quick reply |
| POST | `/api/messages/accounts/:id/send/template` | Send template |
| POST | `/api/messages/accounts/:id/send/media` | Send media |
| GET | `/api/messages/accounts/:id/rate-limit` | Get rate status |
| PUT | `/api/messages/accounts/:id/rate-limit` | Update limit |
| GET | `/api/webhooks/subscription/status/:id` | Check webhook status |
| POST | `/api/webhooks/subscription/subscribe/:id` | Subscribe to webhooks |
| POST | `/api/webhooks/subscription/unsubscribe/:id` | Unsubscribe |
| POST | `/api/webhooks/subscription/refresh/:id` | Refresh subscription |
| GET | `/webhooks/instagram` | Webhook verification |
| POST | `/webhooks/instagram` | Webhook events |

---

## References

- [Meta Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Instagram Business Account API](https://developers.facebook.com/docs/instagram-api)
- [Webhook Documentation](https://developers.facebook.com/docs/messenger-platform/webhooks)
- [Meta Security Best Practices](https://developers.facebook.com/docs/security)

