# Instagram Token Flow - Visual Guide

## 🔄 Complete Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER CONNECTS INSTAGRAM                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: OAuth Authorization                                    │
│  ─────────────────────────                                      │
│  User clicks "Connect Instagram"                                │
│  → Redirects to instagram.com/oauth/authorize                   │
│  → User authorizes app                                          │
│  → Meta redirects back with CODE                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Exchange Code → Short-Lived Token                     │
│  ──────────────────────────────────────                        │
│  POST https://api.instagram.com/oauth/access_token             │
│    grant_type: authorization_code                              │
│    code: [CODE_FROM_CALLBACK]                                  │
│                                                                  │
│  Response:                                                       │
│    {                                                            │
│      "access_token": "SHORT_TOKEN",  ⏱️  Expires in 1 HOUR     │
│      "user_id": "123456789"                                    │
│    }                                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  🔥 STEP 3: Exchange Short → Long-Lived Token (CRITICAL!)      │
│  ──────────────────────────────────────────────────────        │
│  GET https://graph.instagram.com/access_token                  │
│    grant_type: ig_exchange_token                               │
│    client_secret: [YOUR_APP_SECRET]                            │
│    access_token: [SHORT_TOKEN]                                 │
│                                                                  │
│  Response:                                                       │
│    {                                                            │
│      "access_token": "LONG_TOKEN",  ⏱️  Expires in 60 DAYS    │
│      "expires_in": 5184000                                     │
│    }                                                            │
│                                                                  │
│  ✅ Save to database:                                           │
│    - accessToken: LONG_TOKEN (encrypted)                       │
│    - tokenExpiresAt: NOW + 60 days                             │
│    - lastTokenRefresh: NOW                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  ✨ USER CONNECTED - SYSTEM OPERATIONAL                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ (30 days later...)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  🤖 STEP 4: Automatic Token Refresh (Cron Job)                 │
│  ───────────────────────────────────────────                   │
│  Runs: Daily at 2:00 AM UTC                                    │
│  Triggers when:                                                 │
│    - Token expires in < 30 days                                │
│    - OR last refresh was > 25 days ago                         │
│                                                                  │
│  GET https://graph.instagram.com/refresh_access_token          │
│    grant_type: ig_refresh_token                                │
│    access_token: [LONG_TOKEN]                                  │
│                                                                  │
│  Response:                                                       │
│    {                                                            │
│      "access_token": "NEW_LONG_TOKEN",  ⏱️  +60 DAYS          │
│      "expires_in": 5184000                                     │
│    }                                                            │
│                                                                  │
│  ✅ Update database:                                            │
│    - accessToken: NEW_LONG_TOKEN                               │
│    - tokenExpiresAt: NOW + 60 days                             │
│    - lastTokenRefresh: NOW                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                    ♻️  Loop Forever
            (User never needs to reconnect!)
```

## 📊 Timeline Visualization

```
Day 0        Day 30       Day 60       Day 90       Day 120
  │            │            │            │            │
  ├─ Connect   │            │            │            │
  │  (Long     │            │            │            │
  │   Token)   │            │            │            │
  │            │            │            │            │
  │~~~~~~~~~~  ├─ Refresh   │            │            │
  │  Using     │  (New      │            │            │
  │  Token     │   Token)   │            │            │
  │~~~~~~~~~~  │            │            │            │
  │            │~~~~~~~~~~  ├─ Refresh   │            │
  │            │  Using     │  (New      │            │
  │            │  Token     │   Token)   │            │
  │            │~~~~~~~~~~  │            │            │
  │            │            │~~~~~~~~~~  ├─ Refresh   │
  │            │            │  Using     │  (New      │
  │            │            │  Token     │   Token)   │
  │            │            │~~~~~~~~~~  │            │
  │            │            │            │~~~~~~~~~~  ├─ And so on...
  
  🟢 = Connected    🔄 = Auto Refresh    ✅ = Always Active
```

## ⚠️ Without Auto-Refresh (OLD SYSTEM)

```
Day 0                                          Day 60
  │                                              │
  ├─ User Connects                               │
  │  (Token Valid)                               │
  │                                              │
  │~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  ├─ 💥 TOKEN EXPIRES
  │          Working fine...                     │
  │                                              │
  │                                              ├─ ❌ USER DISCONNECTED
  │                                              │   ❌ Service stops
  │                                              │   ❌ Manual reconnect needed
  │                                              │
```

## 🎯 Token Types Comparison

| Feature | Short-Lived Token | Long-Lived Token |
|---------|-------------------|------------------|
| **Lifetime** | 1 hour | 60 days |
| **How to Get** | OAuth code exchange | Exchange short token |
| **Can Refresh?** | ❌ No | ✅ Yes |
| **Stored in DB?** | ❌ No | ✅ Yes (encrypted) |
| **Usage** | Immediately exchange | All API calls |
| **Grant Type** | `authorization_code` | `ig_exchange_token` |
| **Refresh Grant** | N/A | `ig_refresh_token` |

## 🔐 Security Flow

```
┌─────────────┐
│   Frontend  │  ❌ Never sees tokens
└──────┬──────┘
       │
       │ (User clicks Connect)
       ▼
┌─────────────┐
│   Backend   │  ✅ Handles OAuth
│             │  ✅ Gets SHORT token
│             │  ✅ Exchanges for LONG token
│             │  ✅ Encrypts token
│             │  ✅ Stores in database
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │  ✅ Encrypted storage
│             │  ✅ AES-256-GCM
└─────────────┘

🔒 CLIENT_SECRET never exposed to frontend
🔒 All tokens encrypted at rest
🔒 HTTPS required in production
```

## 🚀 Implementation Checklist

### Backend Service (`instagramOAuth.js`)
- [x] `exchangeCodeForToken()` - Gets short token
- [x] `exchangeForLongLivedToken()` - SHORT → LONG
- [x] `refreshLongLivedToken()` - Refresh before expiry

### OAuth Route (`instagramOAuth.js`)
- [x] Callback receives authorization code
- [x] Exchanges code → short token
- [x] Exchanges short → long token
- [x] Saves long token to database
- [x] Saves `tokenExpiresAt` field
- [x] Updates `lastTokenRefresh` timestamp

### Cron Job (`refreshInstagramTokens.js`)
- [x] Runs daily at 2:00 AM
- [x] Finds tokens expiring < 30 days
- [x] Refreshes each token
- [x] Updates database
- [x] Handles failures gracefully
- [x] Logs all actions

### Server Configuration (`server.js`)
- [x] Loads cron job on startup
- [x] Job runs automatically

## 📈 Expected Behavior

### ✅ Success Scenario
```
1. User connects Instagram
2. System exchanges code → short token → long token
3. Token saved with expiry date (60 days from now)
4. Every 30 days, cron refreshes token automatically
5. User stays connected forever (no action needed)
```

### ⚠️ Refresh Failure Scenario
```
1. Cron tries to refresh token
2. Meta API returns error (invalid token)
3. System marks account as disconnected
4. User notified to reconnect
5. Other accounts continue working
```

## 💡 Key Takeaways

✨ **Short tokens (1 hour) → Long tokens (60 days)**  
✨ **Automatic refresh every 30 days**  
✨ **No user intervention required**  
✨ **Graceful error handling**  
✨ **Secure token storage**  
✨ **Production-ready implementation**

---

**Implementation Date**: February 14, 2026  
**Status**: ✅ Complete and Operational
