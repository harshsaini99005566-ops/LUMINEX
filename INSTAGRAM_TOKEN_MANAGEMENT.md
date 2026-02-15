# Instagram Token Management System

## Overview

This document describes the Instagram token management system that ensures users remain connected without needing to re-authenticate every 60 days.

## 🔑 Token Lifecycle

### Short-Lived Token (1 Hour)
- **Obtained**: During OAuth callback after user authorizes
- **Lifetime**: 1 hour
- **Usage**: Immediately exchanged for long-lived token
- **Storage**: Never stored in database

### Long-Lived Token (60 Days)
- **Obtained**: By exchanging short-lived token
- **Lifetime**: 60 days (5,184,000 seconds)
- **Usage**: Stored in database, used for all API calls
- **Refresh**: Automatically refreshed every 30 days

## 🚀 Implementation

### Step 1: Token Exchange (OAuth Callback)

When a user connects their Instagram account:

```javascript
// 1. Get authorization code from Meta
const { code } = req.query;

// 2. Exchange code for SHORT-LIVED token (1 hour)
const { accessToken: shortToken, instagramId } = await exchangeCodeForToken(code);

// 3. Exchange SHORT-LIVED token for LONG-LIVED token (60 days)
const { accessToken: longToken, expiresIn } = await exchangeForLongLivedToken(shortToken);

// 4. Calculate expiration date
const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

// 5. Save LONG-LIVED token to database
account.accessToken = longToken;
account.tokenExpiresAt = tokenExpiresAt;
account.lastTokenRefresh = new Date();
```

**API Endpoint**: 
```
GET https://graph.instagram.com/access_token
?grant_type=ig_exchange_token
&client_secret=YOUR_APP_SECRET
&access_token=SHORT_LIVED_TOKEN
```

### Step 2: Automatic Token Refresh (Cron Job)

A scheduled job runs daily at 2:00 AM UTC to refresh tokens:

```javascript
// Find accounts with tokens expiring within 30 days
const accountsToRefresh = await InstagramAccount.find({
  isActive: true,
  $or: [
    { tokenExpiresAt: { $lte: thirtyDaysFromNow } },
    { lastTokenRefresh: { $lte: twentyFiveDaysAgo } }
  ]
});

// Refresh each token
for (const account of accountsToRefresh) {
  const { accessToken: newToken, expiresIn } = await refreshLongLivedToken(account.accessToken);
  
  account.accessToken = newToken;
  account.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
  account.lastTokenRefresh = new Date();
  await account.save();
}
```

**API Endpoint**: 
```
GET https://graph.instagram.com/refresh_access_token
?grant_type=ig_refresh_token
&access_token=LONG_LIVED_TOKEN
```

## 📁 Files Modified/Created

### 1. Service Layer
**File**: `backend/src/services/instagramOAuth.js`

Added two new functions:

- **`exchangeForLongLivedToken(shortLivedToken)`**
  - Converts 1-hour token → 60-day token
  - Called immediately after OAuth callback
  - Returns: `{ accessToken, expiresIn }`

- **`refreshLongLivedToken(longLivedToken)`**
  - Extends token expiration by 60 days
  - Called by cron job every 30 days
  - Returns: `{ accessToken, expiresIn }`

### 2. Route Layer
**File**: `backend/src/routes/instagramOAuth.js`

Updated OAuth callback handler:
- Now exchanges short token for long token
- Saves `tokenExpiresAt` in database
- Updates `lastTokenRefresh` timestamp

### 3. Cron Job
**File**: `backend/src/jobs/refreshInstagramTokens.js` *(NEW)*

Automated token refresh system:
- Runs daily at 2:00 AM UTC
- Refreshes tokens expiring within 30 days
- Handles refresh failures gracefully
- Marks invalid tokens as disconnected

### 4. Server Initialization
**File**: `backend/src/server.js`

Registered new cron job:
```javascript
require("./jobs/refreshInstagramTokens");
```

## 📊 Database Schema

### InstagramAccount Model

```javascript
{
  accessToken: String,          // Encrypted long-lived token
  tokenExpiresAt: Date,         // When token expires (60 days from refresh)
  lastTokenRefresh: Date,       // Last refresh timestamp
  isActive: Boolean,            // Connection status
  accountStatus: String,        // 'connected' | 'disconnected' | 'error'
  // ... other fields
}
```

## 🔒 Security

✅ **Token Encryption**: All tokens stored encrypted in database  
✅ **CSRF Protection**: State parameter validates OAuth callback  
✅ **Client Secret**: Never exposed to frontend  
✅ **HTTPS Required**: Production must use HTTPS  
✅ **Automatic Cleanup**: Invalid tokens marked as disconnected

## 🎯 Benefits

### Before Implementation
❌ Users disconnected after 60 days  
❌ Manual reconnection required  
❌ Service interruption  
❌ Short-lived tokens stored (1 hour lifetime)

### After Implementation
✅ Automatic token refresh every 30 days  
✅ Uninterrupted service  
✅ Long-lived tokens (60 days)  
✅ No user intervention needed  
✅ Graceful error handling

## 🔧 Testing

### Manual Token Refresh

To manually test token refresh (useful for debugging):

```javascript
// In Node.js console or script
const { refreshInstagramTokens } = require('./backend/src/jobs/refreshInstagramTokens');

// Run refresh job immediately
await refreshInstagramTokens();
```

### Check Token Status

```javascript
const InstagramAccount = require('./backend/src/models/InstagramAccount');

// Find accounts expiring soon
const accounts = await InstagramAccount.find({
  isActive: true,
  tokenExpiresAt: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
}).select('username tokenExpiresAt lastTokenRefresh');

console.log(accounts);
```

### Verify Cron Job

Check server logs for:
```
✅ Scheduled jobs started (usage reset, token refresh)
[Token Refresh Job] Starting scheduled token refresh
[Token Refresh Job] Found accounts to refresh: count=X
[Token Refresh Job] Token refreshed successfully
```

## 📅 Refresh Schedule

| Event | Timing | Action |
|-------|--------|--------|
| **OAuth Connect** | Immediate | Exchange short → long token |
| **Token Age** | Every 30 days | Automatic refresh via cron |
| **Token Expiry Warning** | < 30 days to expiry | Trigger refresh |
| **Last Refresh** | > 25 days ago | Trigger refresh |
| **Token Invalid** | On refresh failure | Mark account disconnected |

## 🚨 Error Handling

### Invalid Token (Error Code 190)
- Account marked as `isActive: false`
- Account status set to `'error'`
- User notified to reconnect
- Logged for debugging

### Network Failure
- Retry on next scheduled run
- Token still valid until expiry
- No user impact if < 30 days to expiry

### API Rate Limit
- Job backs off gracefully
- Continues with next account
- Logged for monitoring

## 🔄 Migration

### For Existing Accounts

Run this script to set initial token expiration:

```javascript
const InstagramAccount = require('./backend/src/models/InstagramAccount');

// Set expiration for existing accounts (default 60 days from now)
await InstagramAccount.updateMany(
  { 
    isActive: true,
    tokenExpiresAt: { $exists: false }
  },
  {
    $set: {
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      lastTokenRefresh: new Date()
    }
  }
);
```

## 📞 API Reference

### Exchange for Long-Lived Token

```bash
GET https://graph.instagram.com/access_token
  ?grant_type=ig_exchange_token
  &client_secret=YOUR_APP_SECRET
  &access_token=SHORT_LIVED_TOKEN

Response:
{
  "access_token": "LONG_LIVED_TOKEN",
  "expires_in": 5184000
}
```

### Refresh Long-Lived Token

```bash
GET https://graph.instagram.com/refresh_access_token
  ?grant_type=ig_refresh_token
  &access_token=LONG_LIVED_TOKEN

Response:
{
  "access_token": "REFRESHED_TOKEN",
  "expires_in": 5184000
}
```

## ✅ Completion Checklist

- [x] `exchangeForLongLivedToken()` function added
- [x] `refreshLongLivedToken()` function added
- [x] OAuth callback updated to exchange tokens
- [x] Token expiration saved to database
- [x] Cron job created for automatic refresh
- [x] Cron job registered in server.js
- [x] Error handling for invalid tokens
- [x] Logging for debugging
- [x] Security: tokens encrypted in DB
- [x] Security: client secret never exposed

## 🎉 Result

✨ **Users never need to reconnect their Instagram accounts!**  
✨ **Tokens automatically refresh every 30 days**  
✨ **Seamless, uninterrupted service**

---

**Last Updated**: February 14, 2026
