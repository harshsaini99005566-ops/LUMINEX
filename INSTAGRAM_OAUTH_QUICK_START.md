# Instagram Integration Quick Start

Complete this checklist to get Instagram Business Account integration running in 15 minutes.

## Prerequisites

- Meta Developer Account ([developers.meta.com](https://developers.meta.com))
- Instagram Business Account or Facebook Page with Business Account
- Node.js and MongoDB running
- Backend and frontend servers running

## Step-by-Step Setup (15 min)

### 1. Create Meta App (3 min)

```bash
1. Go to https://developers.meta.com/apps
2. Click "My Apps" → "Create App"
3. Choose "Business" as app type
4. Enter app name: "Instagram DM Automation"
5. Add your email and agree to terms
6. Complete security verification
```

**Save these values:**
```
APP_ID=your_app_id
APP_SECRET=your_app_secret
```

### 2. Generate Webhook Token (2 min)

Run this in Node.js REPL or create a quick script:

```javascript
// Generate token
const token = require('crypto').randomBytes(32).toString('hex');
console.log(token);
// Copy output and save
```

**Or use Windows PowerShell:**
```powershell
$token = -join (((1..32) | ForEach-Object { [char](Get-Random -Minimum 33 -Maximum 127) }) -split '')
Write-Host $token
```

**Save:**
```
WEBHOOK_TOKEN=your_generated_token_here
```

### 3. Update Environment Variables (2 min)

Edit `backend/.env`:

```bash
# Copy and update these lines:

INSTAGRAM_APP_ID=YOUR_APP_ID
INSTAGRAM_APP_SECRET=YOUR_APP_SECRET
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=YOUR_WEBHOOK_TOKEN
INSTAGRAM_API_VERSION=v18.0

BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
```

### 4. Configure Meta App (5 min)

Go to Meta App Dashboard:

**A. Add Instagram Graph API Product**
```
1. Dashboard → "Add Product"
2. Find "Instagram Graph API"
3. Click "Set Up"
4. Choose your app version (latest)
```

**B. Setup Webhook URL**
```
1. Go to Settings → Advanced
2. Scroll to "Webhooks"
3. Click "Edit"
4. Set Callback URL: http://localhost:5001/webhooks/instagram
   (For production: https://yourdomain.com/webhooks/instagram)
5. Set Verify Token: Your generated token from step 2
6. Subscribe to Fields: Check "messages"
7. Save
```

**C. Set OAuth Redirect URI**
```
1. Go to Settings → Basic
2. Scroll to "Valid OAuth Redirect URIs"
3. Add: http://localhost:5001/api/instagram/auth/callback
4. Save
```

**D. Test Webhook Verification**
```
1. After saving, Meta will automatically test your webhook
2. Check backend logs for:
   "[Webhook Verification] Successful"
3. If failed, verify:
   - Backend is running on port 5001
   - WEBHOOK_TOKEN matches exactly
   - Callback URL is correct
```

### 5. Test the Connection (3 min)

**Start servers:**
```bash
# Terminal 1: Backend
cd backend
npm start
# Should see: "✅ Server running on port 5001"

# Terminal 2: Frontend
cd frontend
npm run dev
# Should see: "Local: http://localhost:3000"
```

**Test OAuth flow:**
```
1. Open http://localhost:3000
2. Log in to your account
3. Go to Dashboard → Accounts section
4. Click "Connect Instagram Account"
5. You'll be redirected to Instagram login
6. Log in with your business account
7. Click "Authorize"
8. You'll be redirected back to dashboard
9. Your Instagram account should appear in the list
```

**Verify in database:**
```javascript
// In MongoDB shell or Compass
db.instagramaccounts.find({}).pretty()
// Should show your account with accessToken and instagramId
```

### 6. Test Webhook (Optional - 5 min)

**Send test message to your Instagram account:**
```
1. From another Instagram account, send a DM to your business account
2. Check backend logs for:
   "[Webhook Event] Received"
   "[Webhook Message] Message stored"
3. Check database:
   db.messages.find({}).pretty()
   // Should show the message you sent
```

**Test sending reply:**
```bash
# Get your account ID from the connected accounts list
ACCOUNT_ID=xxx

# Send a message
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "customer_instagram_id",
    "message": "Thanks for reaching out!"
  }' \
  http://localhost:5001/api/instagram/accounts/ACCOUNT_ID/messages
```

---

## Common Issues

### "Invalid Redirect URI"
```
Cause: Redirect URI doesn't match exactly
Fix: In Meta app settings, make sure callback URL is:
  http://localhost:5001/api/instagram/auth/callback
     (exactly as shown, no trailing slash)
```

### "Webhook Verification Failed"
```
Cause: Verify token doesn't match
Fix: 
  1. Check INSTAGRAM_WEBHOOK_VERIFY_TOKEN in .env
  2. Verify it matches exactly in Meta app settings
  3. Restart backend
  4. Test verification again from Meta dashboard
```

### "Access Token Invalid or Expired"
```
Cause: Token was revoked or app changed
Fix: Have user re-authorize through OAuth flow
  1. Click "Connect Instagram" again
  2. Log in and authorize
  3. New token will be stored
```

### "CORS Error" when connecting
```
Cause: Frontend and backend on different domains
Fix: Verify in backend/.env:
  FRONTEND_URL=http://localhost:3000 (development)
     or
  FRONTEND_URL=https://yourdomain.com (production)
```

---

## Files Modified/Created

✅ Created:
- `backend/src/services/instagramOAuth.js` - OAuth & Meta API integration
- `backend/src/routes/instagramOAuth.js` - OAuth endpoints
- `backend/src/routes/webhooks.js` - Webhook handlers

✅ Updated:
- `backend/src/server.js` - Added route registration & raw body middleware
- `backend/src/models/User.js` - Added instagramOAuthState field
- `backend/.env.example` - Updated Instagram credentials

---

## API Endpoints Now Available

```javascript
// Get OAuth URL
GET /api/instagram/auth/url
Authorization: Bearer JWT

// OAuth callback (handled automatically)
GET /api/instagram/auth/callback?code=...&state=...

// List connected accounts
GET /api/instagram/accounts
Authorization: Bearer JWT

// Get account details
GET /api/instagram/accounts/:accountId
Authorization: Bearer JWT

// Disconnect account
DELETE /api/instagram/accounts/:accountId
Authorization: Bearer JWT

// Send message
POST /api/instagram/accounts/:accountId/messages
Authorization: Bearer JWT
{
  "recipientId": "instagram_user_id",
  "message": "Your message text"
}

// Get conversations
GET /api/instagram/accounts/:accountId/conversations
Authorization: Bearer JWT

// Webhook verification
GET /webhooks/instagram?hub.mode=subscribe&hub.challenge=...&hub.verify_token=...

// Receive webhook events
POST /webhooks/instagram
X-Hub-Signature-256: sha256=...
```

---

## What's Working Now

✅ OAuth login with Meta  
✅ Account connection & token storage  
✅ Secure token refresh (60-day tokens)  
✅ Webhook signature verification  
✅ Incoming message storage  
✅ Message sending via DM  
✅ CSRF protection on OAuth flow  
✅ Account management (list, details, disconnect)  

---

## Next Steps

1. **Production Deployment**
   - Update BACKEND_URL to production domain
   - Use HTTPS for all URLs
   - Register production webhook URL in Meta app

2. **Frontend UI**
   - Create InstagramConnect component (button)
   - Show connected accounts in dashboard
   - Add message interface for conversations

3. **Automation Rules** (Phase 2)
   - Create rules to auto-reply to messages
   - Use AI to generate intelligent responses
   - Track message sentiment and priority

4. **Advanced Features** (Phase 3)
   - Bulk messaging
   - Conversation search & filters
   - Analytics & reporting
   - Team collaboration

---

## Support

For issues or questions:
1. Check `INSTAGRAM_OAUTH_INTEGRATION_GUIDE.md` for detailed documentation
2. Review backend logs: `backend/logs/`
3. Verify .env configuration
4. Test with webhook verification in Meta app dashboard

---

## Checklist

- [ ] Meta App created
- [ ] App ID and Secret saved
- [ ] Webhook token generated
- [ ] .env updated with credentials
- [ ] Webhook URL registered in Meta app
- [ ] OAuth Redirect URI configured
- [ ] Webhook fields subscribed (messages)
- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000
- [ ] OAuth flow tested successfully
- [ ] Account appears in database
- [ ] Webhook verification successful
- [ ] Test message received and stored

**Total Setup Time: ~15 minutes**

---

**Last Updated**: January 2024  
**Status**: Ready for Production
