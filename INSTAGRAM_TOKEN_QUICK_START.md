# 🚀 Quick Start: Instagram Token Management

## What This Does

Your Instagram token management system now:
1. ✅ Exchanges 1-hour tokens → 60-day tokens automatically
2. ✅ Refreshes tokens every 30 days automatically  
3. ✅ Keeps users connected forever (no manual reconnection)

---

## Files Changed

```
backend/src/
├── services/instagramOAuth.js      ✏️  Added token exchange & refresh
├── routes/instagramOAuth.js        ✏️  Updated OAuth callback
├── jobs/refreshInstagramTokens.js  🆕  New cron job
└── server.js                       ✏️  Registered cron job
```

---

## How To Use

### 1️⃣ User Connects Instagram (Frontend)

No changes needed - existing flow works!

```javascript
// User clicks "Connect Instagram" button
// Frontend redirects to Meta OAuth
// Meta redirects back to your callback
// ✨ Magic happens automatically in callback ✨
```

### 2️⃣ Backend Handles Token Exchange (Automatic)

```javascript
// In: backend/src/routes/instagramOAuth.js
// OAuth callback automatically:

1. Gets short-lived token (1 hour)
2. Exchanges for long-lived token (60 days)  ⭐ NEW
3. Saves to database with expiration date     ⭐ NEW
4. User is now connected!
```

### 3️⃣ Cron Job Refreshes Tokens (Automatic)

```javascript
// In: backend/src/jobs/refreshInstagramTokens.js
// Runs daily at 2:00 AM UTC

1. Finds tokens expiring in < 30 days
2. Refreshes each token (adds 60 more days)
3. Updates database
4. User stays connected forever!
```

---

## Testing

### Test #1: Connect New Account

1. Go to your frontend
2. Click "Connect Instagram"
3. Authorize the app
4. Check database:

```javascript
db.instagramaccounts.findOne(
  { username: "your_username" },
  { tokenExpiresAt: 1, lastTokenRefresh: 1 }
);

// Should show:
// tokenExpiresAt: ~60 days from now
// lastTokenRefresh: current time
```

### Test #2: Manual Token Refresh

```bash
# SSH into your server or run locally
node -e "
const { refreshInstagramTokens } = require('./backend/src/jobs/refreshInstagramTokens');
refreshInstagramTokens().then(() => console.log('Done'));
"
```

Check logs for:
```
[Token Refresh Job] Found accounts to refresh
[Token Refresh Job] Token refreshed successfully
```

### Test #3: Verify Cron Job

```bash
# Check server startup logs
✅ Scheduled jobs started (usage reset, token refresh)

# Wait until 2:00 AM UTC or manually trigger above
# Check logs for automatic refresh
```

---

## Monitoring

### Check Token Status

```javascript
// Find accounts expiring soon
const accounts = await InstagramAccount.find({
  isActive: true,
  tokenExpiresAt: { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
}).select('username tokenExpiresAt lastTokenRefresh');

console.table(accounts.map(a => ({
  username: a.username,
  expiresAt: a.tokenExpiresAt,
  daysLeft: Math.floor((a.tokenExpiresAt - Date.now()) / (24 * 60 * 60 * 1000))
})));
```

### Check Refresh History

```bash
# Search logs for refresh activity
grep "Token Refresh Job" /path/to/logs

# Or check database
db.instagramaccounts.find(
  { isActive: true },
  { username: 1, lastTokenRefresh: 1, tokenExpiresAt: 1 }
).sort({ lastTokenRefresh: -1 });
```

---

## Troubleshooting

### ❌ Token Refresh Fails

**Error**: Invalid token (Error 190)

**Cause**: User revoked access or token invalidated

**Solution**: User must reconnect account

**Automatic Handling**: Account marked as `isActive: false`

---

### ⚠️ Cron Job Not Running

**Check**: Is job registered?

```bash
grep "refreshInstagramTokens" backend/src/server.js
# Should show: require("./jobs/refreshInstagramTokens");
```

**Check**: Server logs on startup

```bash
# Should see:
✅ Scheduled jobs started (usage reset, token refresh)
```

**Manual Run**: Test job directly

```javascript
require('./backend/src/jobs/refreshInstagramTokens');
```

---

### 🔍 Token Expires Too Soon

**Check**: Is long-lived token being saved?

```javascript
// In OAuth callback, verify this runs:
const { accessToken: longLivedToken, expiresIn } = 
  await exchangeForLongLivedToken(shortLivedToken);

// expiresIn should be ~5184000 (60 days)
```

---

## API Reference

### Exchange Short → Long Token

```bash
GET https://graph.instagram.com/access_token
  ?grant_type=ig_exchange_token
  &client_secret=YOUR_APP_SECRET
  &access_token=SHORT_LIVED_TOKEN

Response:
{
  "access_token": "LONG_TOKEN",
  "expires_in": 5184000
}
```

### Refresh Long Token

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

---

## Security Notes

🔒 **Client secret never exposed** - Only used in backend  
🔒 **Tokens encrypted** - AES-256-GCM in database  
🔒 **HTTPS required** - Production must use HTTPS  
🔒 **No frontend storage** - Tokens only in backend  

---

## Next Steps

1. ✅ Implementation complete
2. 🧪 Test token exchange with new account
3. 🧪 Test manual token refresh
4. 📊 Monitor logs for 24 hours
5. 🚀 Deploy to production
6. 📈 Monitor refresh job daily

---

## Quick Reference

| What | When | Where |
|------|------|-------|
| **Token Exchange** | User connects | `routes/instagramOAuth.js` |
| **Token Refresh** | Daily 2:00 AM | `jobs/refreshInstagramTokens.js` |
| **Token Storage** | Always | Database (encrypted) |
| **Token Lifetime** | 60 days | Auto-refreshed at 30 days |

---

## Documentation

📖 **Detailed Guide**: [INSTAGRAM_TOKEN_MANAGEMENT.md](./INSTAGRAM_TOKEN_MANAGEMENT.md)  
📊 **Visual Flow**: [INSTAGRAM_TOKEN_FLOW_VISUAL.md](./INSTAGRAM_TOKEN_FLOW_VISUAL.md)  
📋 **Summary**: [INSTAGRAM_TOKEN_IMPLEMENTATION_SUMMARY.md](./INSTAGRAM_TOKEN_IMPLEMENTATION_SUMMARY.md)

---

**Status**: ✅ Ready to Use  
**Date**: February 14, 2026

🎉 **Users will never be disconnected again!**
