# Instagram Business Account Integration Guide

## Overview

This guide provides complete instructions for implementing Instagram Business Account connection using Meta's Graph API v18.0. The system handles OAuth 2.0 authentication, token management, webhook subscriptions, and real-time message receiving.

## Table of Contents

1. [Architecture](#architecture)
2. [Setup Instructions](#setup-instructions)
3. [OAuth Flow](#oauth-flow)
4. [Webhook Configuration](#webhook-configuration)
5. [API Endpoints](#api-endpoints)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  InstagramConnect Component                          │   │
│  │  - "Connect Instagram" Button                        │   │
│  │  - Calls GET /api/instagram/auth/url                │   │
│  │  - Redirects to Meta login URL                       │   │
│  │  - Handles OAuth callback                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ (OAuth flow)
┌─────────────────────────────────────────────────────────────┐
│                 Meta / Instagram OAuth                       │
│                                                               │
│  https://www.instagram.com/oauth/authorize                  │
│  https://graph.instagram.com/v18.0/oauth/access_token       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ (Code exchange)
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                         │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  OAuth Service (services/instagramOAuth.js)          │   │
│  │  - generateAuthUrl(state)                            │   │
│  │  - exchangeCodeForToken(code)                        │   │
│  │  - getBusinessAccountInfo(token, id)                 │   │
│  │  - subscribeToWebhook(token, id)                     │   │
│  │  - refreshAccessToken(account)                       │   │
│  │  - sendInstagramMessage(account, recipient, text)    │   │
│  │  - verifyWebhookSignature(payload, signature)        │   │
│  │  - handleWebhookMessage(data)                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  OAuth Routes (routes/instagramOAuth.js)             │   │
│  │  - GET /api/instagram/auth/url                       │   │
│  │  - GET /api/instagram/auth/callback                  │   │
│  │  - GET /api/instagram/accounts                       │   │
│  │  - GET /api/instagram/accounts/:id                   │   │
│  │  - DELETE /api/instagram/accounts/:id                │   │
│  │  - POST /api/instagram/accounts/:id/messages         │   │
│  │  - GET /api/instagram/accounts/:id/conversations     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Webhook Routes (routes/webhooks.js)                 │   │
│  │  - GET /webhooks/instagram (verification)            │   │
│  │  - POST /webhooks/instagram (events)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database Models                                     │   │
│  │  - InstagramAccount (tokens, account info)           │   │
│  │  - Message (incoming/outgoing messages)              │   │
│  │  - Conversation (DM threads)                         │   │
│  │  - User (OAuth state CSRF token)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓ (Webhook events)
┌─────────────────────────────────────────────────────────────┐
│            Meta Webhook (Real-time events)                   │
│                                                               │
│  POST /webhooks/instagram                                    │
│  X-Hub-Signature-256: sha256=HMAC...                        │
│  {                                                            │
│    "entry": [{                                               │
│      "messaging": [{                                         │
│        "sender": { "id": "..." },                           │
│        "message": { "text": "..." },                        │
│        "timestamp": 1234567890                             │
│      }]                                                      │
│    }]                                                        │
│  }                                                            │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **OAuth Connection**
   - User clicks "Connect Instagram" button
   - Frontend requests auth URL from backend
   - Backend generates URL with CSRF state token, returns to frontend
   - Frontend redirects user to Meta login page
   - User authorizes app
   - Meta redirects to `/api/instagram/auth/callback` with code
   - Backend exchanges code for access_token
   - Backend fetches account info, stores in database
   - Backend subscribes to webhooks
   - User is redirected to dashboard with success message

2. **Incoming Messages**
   - Customer sends DM to Instagram account
   - Meta sends webhook POST to `/webhooks/instagram`
   - Backend verifies webhook signature
   - Backend stores message in database
   - Frontend is notified via WebSocket or polling
   - Message appears in conversation thread

3. **Sending Messages**
   - User types reply in frontend
   - Frontend calls `POST /api/instagram/accounts/:id/messages`
   - Backend calls Meta Graph API to send message
   - Message is sent through Instagram DM
   - Status is returned to frontend

---

## Setup Instructions

### Step 1: Create Meta App

1. Go to [Meta Developers](https://developers.meta.com/)
2. Create new app or use existing one
3. Add "Instagram Graph API" product to app
4. Create an access token (temporarily)
5. Note your **App ID** and **App Secret**

### Step 2: Generate Webhook Verification Token

Generate a secure random token for webhook verification:

**On Windows PowerShell:**
```powershell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Maximum 999999999).ToString())) -replace '=', '' | Select-Object -First 32
```

Or simpler approach (Node.js):
```javascript
require('crypto').randomBytes(32).toString('hex')
```

Example result: `abc123def456ghi789jkl012mno345pqr`

### Step 3: Configure Environment Variables

Update `.env` file in backend directory:

```bash
# Backend port
PORT=5001

# Instagram Meta App credentials
INSTAGRAM_APP_ID=your_app_id_here
INSTAGRAM_APP_SECRET=your_app_secret_here
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=generated_token_here
INSTAGRAM_API_VERSION=v18.0

# URLs (adjust for your domain in production)
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
```

### Step 4: Configure Meta App Settings

1. In Meta App Dashboard → Instagram → Settings
2. Set **Webhook Callback URL** to: `https://yourdomain.com/webhooks/instagram`
3. Set **Verify Token** to your generated token
4. For development: Use ngrok or similar to expose localhost
   ```bash
   ngrok http 5001
   # Use https://abc123.ngrok.io for BACKEND_URL
   ```

5. Subscribe to these **Webhook Fields**:
   - `messages`
   - `messaging_postbacks`

### Step 5: Set OAuth Redirect URI

In Meta App Dashboard → Settings → Basic:

1. Add **Valid OAuth Redirect URIs**:
   - `http://localhost:5001/api/instagram/auth/callback` (development)
   - `https://yourdomain.com/api/instagram/auth/callback` (production)

### Step 6: Get Long-Lived User Access Token

1. Go to Tools → Access Token Debugger
2. Create temporary access token with these permissions:
   - `instagram_business_basic`
   - `instagram_business_content_publish`
   - `instagram_business_manage_messages`
   - `instagram_business_manage_comments`
   - `pages_read_engagement`

3. Exchange for long-lived token using Facebook SDK or API call:

```bash
GET https://graph.instagram.com/v18.0/oauth/access_token?
  client_id=YOUR_APP_ID&
  client_secret=YOUR_APP_SECRET&
  grant_type=authorization_code&
  redirect_uri=YOUR_REDIRECT_URI&
  code=CODE_FROM_OAUTH_FLOW
```

---

## OAuth Flow

### User Perspective

```
User Browser                Backend                    Meta
    │                         │                        │
    │─────────────────────────│                        │
    │  Click "Connect         │                        │
    │   Instagram"            │                        │
    │                         │                        │
    │  GET /api/instagram/auth/url                     │
    │────────────────────────→│                        │
    │                         │ Generate state token   │
    │                         │ (CSRF protection)      │
    │  ← Auth URL + state ────│                        │
    │                         │                        │
    │─────────────────────────────────────────────────→│
    │  Redirect to Meta login │                        │
    │                         │                        │
    │  [User logs in]         │                        │
    │  [User authorizes app]  │                        │
    │                         │                        │
    │←─────────────────────────────────────────────────│
    │  Redirect to callback   │                        │
    │  ?code=CODE&state=STATE │                        │
    │                         │                        │
    │  GET /api/instagram/auth/callback?code=..&state=..│
    │────────────────────────→│                        │
    │                         │ Verify state           │
    │                         │ Exchange code for      │
    │                         │ access_token           │
    │                         │                        │
    │                         │ POST oauth/access_token│
    │                         │───────────────────────→│
    │                         │                        │
    │                         │ ← access_token ────────│
    │                         │                        │
    │                         │ GET business info      │
    │                         │─────────────────────→  │
    │                         │ ← account info ────────│
    │                         │                        │
    │                         │ Subscribe to webhooks  │
    │                         │─────────────────────→  │
    │                         │ ← success ─────────────│
    │                         │                        │
    │                         │ Save to database       │
    │                         │                        │
    │ ← Redirect to dashboard │                        │
    │   with success ─────────│                        │
    │                         │                        │
```

### Code Flow

**Step 1: Frontend requests auth URL**
```javascript
// Frontend code
const response = await fetch('/api/instagram/auth/url');
const { url, state } = await response.json();
window.location.href = url; // Redirect to Meta login
```

**Step 2: Backend generates auth URL**
```javascript
// routes/instagramOAuth.js
router.get('/auth/url', authenticate, async (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  await User.findByIdAndUpdate(req.user.id, { instagramOAuthState: state });
  
  const authUrl = generateAuthUrl(state);
  res.json({ url: authUrl, state });
});
```

**Step 3: Meta redirects with code**
```
https://yourdomain.com/api/instagram/auth/callback?code=ABC123&state=XYZ789
```

**Step 4: Backend exchanges code for token**
```javascript
// routes/instagramOAuth.js
router.get('/auth/callback', authenticate, async (req, res) => {
  const { code, state } = req.query;
  
  // Verify state (CSRF protection)
  const user = await User.findById(req.user.id);
  if (user.instagramOAuthState !== state) {
    throw new Error('CSRF attack detected');
  }
  
  // Exchange code for token
  const { accessToken, instagramId } = await exchangeCodeForToken(code);
  
  // Get account info
  const accountInfo = await getBusinessAccountInfo(accessToken, instagramId);
  
  // Save account to database
  const account = await InstagramAccount.create({
    userId: req.user.id,
    instagramId,
    username: accountInfo.username,
    accessToken,
    ...accountInfo
  });
  
  // Subscribe to webhooks
  await subscribeToWebhook(accessToken, instagramId);
  
  // Redirect to success page
  res.redirect(`/dashboard/accounts?success=true&account=${account._id}`);
});
```

---

## Webhook Configuration

### Webhook Events

Your app receives these events from Meta:

```javascript
{
  "entry": [{
    "id": "page_id",
    "time": 1234567890,
    "messaging": [{
      "sender": { "id": "customer_id" },
      "recipient": { "id": "page_id" },
      "timestamp": 1234567890,
      
      // Incoming message
      "message": {
        "mid": "mid.1234567890",
        "text": "Hello!",
        "attachments": []
      },
      
      // OR delivery confirmation
      "delivery": {
        "mids": ["mid.1234567890"],
        "watermark": 1234567890
      },
      
      // OR read receipt
      "read": {
        "watermark": 1234567890
      },
      
      // OR message echo (our message)
      "message": {
        "is_echo": true,
        "mid": "mid.1234567890",
        "text": "Our reply"
      }
    }]
  }]
}
```

### Webhook Verification

When you set the webhook URL in Meta app settings, Meta sends a GET request:

```
GET /webhooks/instagram?
  hub.mode=subscribe&
  hub.challenge=CHALLENGE_STRING&
  hub.verify_token=YOUR_VERIFY_TOKEN
```

Your app must respond with the challenge string:

```javascript
// routes/webhooks.js
router.get('/instagram', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;
  
  if (mode === 'subscribe' && verifyWebhookToken(token)) {
    res.send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});
```

### Signature Verification

Every webhook POST includes an `X-Hub-Signature-256` header:

```
X-Hub-Signature-256: sha256=HASH_VALUE
```

Verify this signature to ensure the webhook is from Meta:

```javascript
// services/instagramOAuth.js
const verifyWebhookSignature = (payload, signature) => {
  const hash = crypto
    .createHmac('sha256', process.env.INSTAGRAM_APP_SECRET)
    .update(payload)
    .digest('hex');
  
  const expectedSignature = `sha256=${hash}`;
  return signature === expectedSignature;
};
```

### Webhook Event Processing

```javascript
// routes/webhooks.js
router.post('/instagram', async (req, res) => {
  // 1. Verify signature
  const signature = req.headers['x-hub-signature-256'];
  const payload = req.rawBody; // Captured before JSON parsing
  
  if (!verifyWebhookSignature(payload, signature)) {
    return res.status(403).send('Forbidden');
  }
  
  // 2. Process events
  for (const pageEntry of req.body.entry) {
    for (const event of pageEntry.messaging) {
      
      // Handle incoming message
      if (event.message && !event.message.is_echo) {
        await handleWebhookMessage(event.message);
      }
      
      // Handle delivery confirmation
      if (event.delivery) {
        updateMessageStatus('delivered', event.delivery.mids);
      }
      
      // Handle read receipt
      if (event.read) {
        updateConversationWatermark(event.read.watermark);
      }
    }
  }
  
  // 3. Always return 200 to acknowledge
  res.status(200).json({ status: 'ok' });
});
```

---

## API Endpoints

### Authentication Endpoints

#### 1. Get OAuth Authorization URL
```
GET /api/instagram/auth/url

Headers:
  Authorization: Bearer JWT_TOKEN

Response:
{
  "url": "https://www.instagram.com/oauth/authorize?...",
  "state": "abc123def456..."
}
```

#### 2. Handle OAuth Callback
```
GET /api/instagram/auth/callback?code=CODE&state=STATE

Headers:
  Authorization: Bearer JWT_TOKEN

Response: Redirect to /dashboard/accounts?success=true
```

### Account Management Endpoints

#### 3. List Connected Accounts
```
GET /api/instagram/accounts

Headers:
  Authorization: Bearer JWT_TOKEN

Response:
{
  "accounts": [
    {
      "_id": "account_id",
      "instagramId": "instagram_id",
      "username": "myaccount",
      "name": "My Business Account",
      "profilePicture": "https://...",
      "followersCount": 1000,
      "isActive": true,
      "connectedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

#### 4. Get Account Details
```
GET /api/instagram/accounts/:accountId

Headers:
  Authorization: Bearer JWT_TOKEN

Response:
{
  "account": {
    "_id": "account_id",
    "instagramId": "instagram_id",
    "username": "myaccount",
    "name": "My Business Account",
    "profilePicture": "https://...",
    "followersCount": 1000,
    "websiteUrl": "https://mysite.com",
    "isActive": true,
    "connectedAt": "2024-01-15T10:30:00Z",
    "lastTokenRefresh": "2024-01-20T14:22:00Z"
  }
}
```

#### 5. Disconnect Account
```
DELETE /api/instagram/accounts/:accountId

Headers:
  Authorization: Bearer JWT_TOKEN

Response:
{
  "message": "Account disconnected"
}
```

### Messaging Endpoints

#### 6. Send Message
```
POST /api/instagram/accounts/:accountId/messages

Headers:
  Authorization: Bearer JWT_TOKEN
  Content-Type: application/json

Body:
{
  "recipientId": "instagram_user_id",
  "message": "Hello! How can I help?"
}

Response:
{
  "message": "Message sent",
  "messageId": "mid.1234567890"
}
```

#### 7. Get Conversations
```
GET /api/instagram/accounts/:accountId/conversations

Headers:
  Authorization: Bearer JWT_TOKEN

Response:
{
  "conversations": [
    {
      "id": "conversation_id",
      "participants": [...],
      "updated_time": "2024-01-20T14:22:00Z"
    }
  ]
}
```

### Webhook Endpoints

#### 8. Webhook Verification
```
GET /webhooks/instagram?
  hub.mode=subscribe&
  hub.challenge=CHALLENGE&
  hub.verify_token=TOKEN

Response: CHALLENGE (the challenge string)
```

#### 9. Receive Webhook Events
```
POST /webhooks/instagram

Headers:
  X-Hub-Signature-256: sha256=HASH

Body:
{
  "entry": [{
    "messaging": [{
      "sender": { "id": "..." },
      "message": { "text": "..." },
      "timestamp": 1234567890
    }]
  }]
}

Response:
{
  "status": "ok"
}
```

---

## Testing

### 1. Test OAuth Flow

**Setup:**
1. Update `.env` with your Meta app credentials
2. Start backend: `npm start` in backend directory
3. Start frontend: `npm run dev` in frontend directory

**Test Steps:**
1. Navigate to dashboard
2. Click "Connect Instagram Account"
3. You'll be redirected to Instagram/Meta login
4. Log in with a business account
5. Authorize the app
6. You'll be redirected back to dashboard
7. Check if account appears in connected accounts list

**Verify in Database:**
```javascript
// Backend terminal
const accounts = await InstagramAccount.find();
console.log(accounts);
// Should show your Instagram account with accessToken
```

### 2. Test Webhook Verification

**Setup webhook URL in Meta app settings:**
1. Go to Meta App Dashboard
2. Go to Settings → Advanced
3. Set Webhook Callback URL: `https://yourdomain.com/webhooks/instagram`
4. Set Verify Token: `your_token_from_.env`
5. Subscribe to webhook fields: messages

**Test:**
Meta will automatically send a GET request to verify the URL. Check backend logs:
```
[Webhook Verification] Request received
[Webhook Verification] Successful
```

### 3. Test Incoming Messages

**Send Test Message:**
1. Send a DM to your Instagram business account from another account
2. Check backend logs for webhook received
3. Check database for stored message:

```javascript
const messages = await Message.find().sort({ createdAt: -1 }).limit(1);
console.log(messages[0]);
```

### 4. Test Sending Messages

**Using API:**
```bash
# Get account ID
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/instagram/accounts

# Send message
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "instagram_user_id",
    "message": "Thanks for reaching out!"
  }' \
  http://localhost:5001/api/instagram/accounts/ACCOUNT_ID/messages
```

**Verify:**
- Check Instagram DM thread - message should appear
- Check backend logs: `[Send Message] Success`
- Check database for outgoing message record

### 5. Test with ngrok (Local Webhook Testing)

**Setup:**
```bash
# Install ngrok
npm install -g ngrok

# Start ngrok
ngrok http 5001
# Note the https URL, e.g., https://abc123.ngrok.io

# Update .env
BACKEND_URL=https://abc123.ngrok.io

# Restart backend
npm start
```

**Configure in Meta App:**
1. Webhook URL: `https://abc123.ngrok.io/webhooks/instagram`
2. Verify Token: Your token
3. Save and test

**Monitor:**
```bash
# In another terminal, watch ngrok traffic
ngrok config add-authtoken YOUR_NGROK_TOKEN
```

---

## Troubleshooting

### OAuth Issues

**Problem: "Invalid state parameter - possible CSRF attack"**
- **Cause**: State token mismatch
- **Solution**: Clear browser cookies, try again
- **Verify**: Check that User.instagramOAuthState is being saved and compared correctly

**Problem: "Failed to exchange code for token"**
- **Cause**: Wrong App ID, App Secret, or Redirect URI
- **Solution**: 
  - Verify credentials in Meta app settings
  - Ensure Redirect URI matches exactly: `http://localhost:5001/api/instagram/auth/callback`
  - Check app is approved for Instagram Graph API

**Problem: User redirected back but account not saved**
- **Cause**: Token exchange succeeded but account creation failed
- **Solution**: 
  - Check MongoDB connection
  - Check InstagramAccount model has required fields
  - Review backend logs for error message

### Webhook Issues

**Problem: "Webhook Verification Failed"**
- **Cause**: Verify token doesn't match
- **Solution**:
  - Ensure `INSTAGRAM_WEBHOOK_VERIFY_TOKEN` in `.env` matches Meta app settings
  - Token is case-sensitive
  - No spaces or special characters

**Problem: "Invalid signature" errors**
- **Cause**: App Secret is incorrect or changed
- **Solution**:
  - Verify `INSTAGRAM_APP_SECRET` is correct
  - Regenerate tokens in Meta app if changed
  - Check that raw body is captured before JSON parsing

**Problem: Webhook endpoint not receiving events**
- **Cause**: 
  1. Webhook URL not registered in Meta app
  2. Verification failed so subscription wasn't completed
  3. App not subscribed to "messages" field
- **Solution**:
  - Verify webhook URL in Meta settings: https://yourdomain.com/webhooks/instagram
  - Re-run webhook verification test
  - Ensure "messages" field is in subscribed fields list
  - Check backend is running: `curl http://localhost:5001/health`

### Token Issues

**Problem: "Token has expired"**
- **Cause**: Access token is valid for 60 days, then expires
- **Solution**:
  - Token refresh happens automatically before API calls
  - If still failing, regenerate token through OAuth flow again
  - Check `tokenExpiresAt` in database vs current time

**Problem: "Invalid access token"**
- **Cause**: 
  1. Token was revoked by user
  2. App credentials changed
  3. Token never exchanged properly
- **Solution**:
  - Have user re-authorize through OAuth flow
  - Check token exists in database: `InstagramAccount.accessToken`
  - Verify token is not truncated when stored

### Message Issues

**Problem: "Failed to send message"**
- **Cause**:
  1. Token expired or invalid
  2. Recipient ID is incorrect
  3. Account not properly subscribed to webhooks
- **Solution**:
  - Verify token: `curl https://graph.instagram.com/v18.0/me?access_token=TOKEN`
  - Check recipient ID format (should be numeric)
  - Test webhook subscription worked during OAuth

**Problem: Incoming messages not appearing**
- **Cause**:
  1. Webhooks not subscribed
  2. Webhook verification failed
  3. Messages not being stored
- **Solution**:
  - Check that subscribeToWebhook() was called during OAuth
  - Verify webhook is receiving POST requests in logs
  - Check Message documents in database are being created

### Performance Issues

**Problem: Slow message sending**
- **Cause**: Token refresh happening on every request
- **Solution**:
  - Reduce token refresh checks
  - Pre-refresh tokens before expiry
  - Use queue for batch messages

**Problem: High webhook latency**
- **Cause**: Synchronous database operations in webhook handler
- **Solution**:
  - Move message storage to async queue (Bull, RabbitMQ)
  - Return 200 immediately, process async
  - Use batch inserts for multiple messages

---

## Production Checklist

- [ ] Use environment variables for all credentials
- [ ] Enable HTTPS for all URLs
- [ ] Use ngrok or CDN for webhook URL in production
- [ ] Set proper CORS origins (not *)
- [ ] Enable rate limiting on API endpoints
- [ ] Add request validation and sanitization
- [ ] Implement token encryption in database
- [ ] Set up monitoring/alerting for webhook failures
- [ ] Add retry logic for failed message sends
- [ ] Implement message queuing for reliability
- [ ] Set up database backups
- [ ] Enable request logging and audit trail
- [ ] Test with production Meta app credentials
- [ ] Set up proper error handling and recovery
- [ ] Document runbook for common issues
- [ ] Set up alerting for token expiry

---

## Additional Resources

- [Meta Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Webhook Documentation](https://developers.facebook.com/docs/instagram-api/webhooks)
- [OAuth Flow](https://developers.facebook.com/docs/instagram-api/getting-started)
- [Permissions Reference](https://developers.facebook.com/docs/instagram-api/permissions)
- [Rate Limits](https://developers.facebook.com/docs/instagram-api/reference/rate-limiting)

---

## Code Examples

### Frontend Component Example

```typescript
// components/InstagramConnect.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function InstagramConnect() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError('');

      // Get auth URL from backend
      const response = await fetch('/api/instagram/auth/url', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      const { url } = await response.json();

      // Redirect to Meta login
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {loading ? 'Connecting...' : 'Connect Instagram'}
    </button>
  );
}
```

### Backend Service Usage Example

```javascript
// Example: Send a reply to an Instagram message
const { sendInstagramMessage } = require('./services/instagramOAuth');

async function replyToMessage(accountId, customerId, replyText) {
  try {
    const account = await InstagramAccount.findById(accountId);
    
    const result = await sendInstagramMessage(
      account,
      customerId,
      replyText
    );
    
    console.log('Message sent:', result.message_id);
    return result;
  } catch (error) {
    console.error('Failed to send reply:', error);
    throw error;
  }
}
```

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Author**: Instagram Automation Team
