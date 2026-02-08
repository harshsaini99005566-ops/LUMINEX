# Phase 6: Meta Instagram Messaging API Setup Guide

## Complete Integration Instructions

This guide walks you through setting up the Instagram Graph API (Meta's official API) for AutoDM's messaging and automation features.

---

## Prerequisites

Before starting, ensure you have:
- A Meta Business Account
- A Facebook Page
- An Instagram Business Account (linked to your Facebook Page)
- Developer access at [developers.facebook.com](https://developers.facebook.com)
- API credentials (App ID, App Secret)

---

## Step 1: Create a Meta App

### 1.1 Go to Meta Developers Dashboard
Visit: https://developers.facebook.com/apps

### 1.2 Create New App
- Click "Create App"
- Select "Business" as app type
- Fill in app name (e.g., "AutoDM")
- Select or create business account
- Click "Create App"

### 1.3 Get Your App Credentials
In the app dashboard:
- **App ID**: Settings → Basic → Copy "App ID"
- **App Secret**: Settings → Basic → Copy "App Secret" (reveal with password)

**Keep these safe!** You'll need them for configuration.

---

## Step 2: Configure Instagram API

### 2.1 Add Instagram Graph API Product
In your app dashboard:
1. Click "Add Product"
2. Search for "Instagram Graph API"
3. Click "Set Up"

### 2.2 Get Instagram Business Account ID
```bash
# Use this curl command (replace tokens):
curl -i -X GET \
  "https://graph.instagram.com/v18.0/{USER_ID}/instagram_business_accounts?access_token={ACCESS_TOKEN}"
```

Where:
- `{USER_ID}` = Your Facebook user ID
- `{ACCESS_TOKEN}` = Your app access token (from Settings → Basic)

Response will include:
```json
{
  "data": [
    {
      "id": "17841406..." // Instagram Business Account ID
      "name": "Your Business Account"
    }
  ]
}
```

**Save the Instagram Business Account ID** - you'll need this for webhooks.

---

## Step 3: Set Up Webhooks

### 3.1 Configure Webhook URL

In Meta Developers Dashboard:
1. Go to Products → Instagram Graph API → Settings → Webhooks
2. Add a webhook subscriber:
   - **Callback URL**: `https://yourdomain.com/api/webhook/instagram`
   - **Verify Token**: Generate a secure random token (save in .env)

### 3.2 Test Webhook Setup

```bash
# Test the webhook verification
curl -X GET "https://yourdomain.com/api/webhook/instagram?hub.mode=subscribe&hub.challenge=test123&hub.verify_token=YOUR_TOKEN"

# Should return: test123
```

Your backend automatically handles verification via the `/webhook/instagram` GET endpoint.

### 3.3 Subscribe to Webhook Fields

In your app dashboard, under Instagram Graph API → Settings → Webhooks:

Subscribe to these fields:
- ✅ `messages` - Incoming DMs
- ✅ `message_status` - Delivery/read receipts
- ✅ `comments` - Comment automation (optional)
- ✅ `story_mention` - Story mentions (optional)

---

## Step 4: Environment Configuration

### 4.1 Update `.env` File

```env
# Instagram API Configuration
INSTAGRAM_APP_ID=your_app_id_here
INSTAGRAM_APP_SECRET=your_app_secret_here
INSTAGRAM_API_VERSION=v18.0
INSTAGRAM_WEBHOOK_TOKEN=your_secure_webhook_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=17841406...
INSTAGRAM_REDIRECT_URI=https://yourdomain.com/auth/instagram/callback

# Optional: Instagram Page ID
INSTAGRAM_PAGE_ID=your_page_id_here
```

### 4.2 Create OAuth Redirect URI

Your app needs an OAuth redirect endpoint:

```javascript
// backend/src/routes/auth.js - Add this route:

router.get('/instagram/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect('/login?error=no_code');
    }

    // Exchange code for access token
    const { accessToken, userId } = await instagramService.getAccessTokenFromCode(code);
    
    // Get Instagram Business Account ID
    const igBusinessAccountId = await instagramService.getInstagramBusinessAccountId(userId, accessToken);
    
    // Exchange for long-lived token
    const { accessToken: longLivedToken } = await instagramService.exchangeAccessToken(accessToken);

    // Store in database with business account
    const account = new InstagramAccount({
      user: req.user._id,
      instagramId: igBusinessAccountId,
      accessToken: longLivedToken,
      userId,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    });

    await account.save();
    res.redirect('/dashboard/accounts?success=true');
  } catch (error) {
    logger.error('Instagram OAuth callback error', error);
    res.redirect('/login?error=auth_failed');
  }
});
```

---

## Step 5: Instagram OAuth Flow Setup

### 5.1 Configure OAuth Redirect URLs

In Meta App Dashboard:
1. Settings → Basic
2. Add App Domains: `yourdomain.com`
3. Go to Instagram Graph API → Settings → Basic
4. Add "Valid OAuth Redirect URIs":
   ```
   https://yourdomain.com/auth/instagram/callback
   ```

### 5.2 Create Login Button

In your frontend, create Instagram connect button:

```tsx
// frontend/components/InstagramConnect.tsx

export function InstagramConnect() {
  const handleConnect = () => {
    const appId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
    const redirectUri = `${window.location.origin}/auth/instagram/callback`;
    const scope = 'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages';
    
    const authUrl = `https://www.instagram.com/oauth/authorize?app_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    window.location.href = authUrl;
  };

  return (
    <button onClick={handleConnect}>
      Connect Instagram Account
    </button>
  );
}
```

---

## Step 6: API Permissions

Your Meta App needs these permissions:

### Necessary Permissions:
- `instagram_business_basic` - Read basic account info
- `instagram_business_content_publish` - Send messages
- `instagram_business_manage_messages` - Manage incoming messages
- `pages_read_user_content` - Read user content
- `pages_manage_metadata` - Manage page info

### Optional Permissions:
- `instagram_business_manage_comments` - Comment automation
- `instagram_insights` - Read analytics data

Request these in your OAuth scope:
```
scope=instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,pages_read_user_content,pages_manage_metadata
```

---

## Step 7: Webhook Security

### 7.1 Verify Webhook Signatures

Meta signs all webhook requests with an X-Hub-Signature-256 header.

The backend automatically verifies:
```javascript
// Implemented in instagramService.verifyWebhookSignature()
const signature = crypto
  .createHmac('sha256', appSecret)
  .update(rawBody)
  .digest('hex');

const isValid = signature === receivedSignature;
```

### 7.2 Configure Webhook Signing

In your app:
1. Settings → Basic → copy "App Secret"
2. Add to `.env` as `INSTAGRAM_APP_SECRET`
3. Backend automatically verifies all webhook requests

---

## Step 8: Testing the Integration

### 8.1 Send Test Message

```bash
curl -X POST https://graph.instagram.com/v18.0/me/messages \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": {
      "id": "RECIPIENT_IG_ACCOUNT_ID"
    },
    "message": {
      "text": "Hello from AutoDM!"
    },
    "access_token": "YOUR_ACCESS_TOKEN"
  }'
```

### 8.2 Get Conversations

```bash
curl -X GET https://graph.instagram.com/v18.0/me/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "fields": "id,senders,participants,updated_time",
    "access_token": "YOUR_ACCESS_TOKEN"
  }'
```

### 8.3 Monitor Webhook Events

In your backend logs, you should see:
```
INFO: ✅ Webhook verified successfully
INFO: Webhook signature verification passed
INFO: Incoming message from SENDER_ID
INFO: Automated reply sent for rule RULE_ID
```

---

## Step 9: Access Token Refresh

### 9.1 Token Expiration

By default, Instagram Graph API tokens expire in 60 days.

### 9.2 Implement Token Refresh

The backend includes automatic refresh:
```javascript
// Refresh every 45 days
const refreshInterval = 45 * 24 * 60 * 60 * 1000;

setInterval(async () => {
  const accounts = await InstagramAccount.find({
    expiresAt: { $lt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) } // Expires in 15 days
  });

  for (const account of accounts) {
    try {
      const newToken = await instagramService.refreshAccessToken(
        account.userId,
        account.accessToken
      );

      account.accessToken = newToken;
      account.expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      await account.save();
      
      logger.info(`Token refreshed for account ${account._id}`);
    } catch (error) {
      logger.error(`Failed to refresh token for account ${account._id}`, error);
    }
  }
}, refreshInterval);
```

---

## Step 10: Deploy to Production

### 10.1 Update App Settings

1. App Settings → Basic → App Roles
   - Add team members with "Admin" role (for access to webhooks)

2. App Settings → Live Mode
   - Request app review (if using customer access tokens)
   - Or use app access tokens for internal use

### 10.2 Configure Production URLs

Update your `.env.production`:
```env
INSTAGRAM_APP_ID=prod_app_id
INSTAGRAM_APP_SECRET=prod_app_secret
INSTAGRAM_WEBHOOK_TOKEN=prod_webhook_token
INSTAGRAM_REDIRECT_URI=https://production-domain.com/auth/instagram/callback
```

### 10.3 Test in Production

```bash
# Test webhook verification
curl "https://yourdomain.com/api/webhook/instagram?hub.mode=subscribe&hub.challenge=test&hub.verify_token=YOUR_TOKEN"

# Should return: test
```

---

## Troubleshooting

### Webhook Verification Fails

**Problem**: `hub.verify_token mismatch`

**Solution**:
1. Verify token in dashboard matches `.env` exactly
2. Check for extra spaces or quotes in `.env`
3. Restart backend: `npm run dev`

---

### Messages Not Arriving

**Problem**: Sent messages don't appear in Instagram DMs

**Solution**:
1. Verify access token is valid: `GET /me?access_token=TOKEN`
2. Verify business account is linked to page
3. Check Instagram account has "Professional" or "Business" type
4. Ensure recipient is a follower or has messaged first

---

### Webhook Events Not Received

**Problem**: No incoming message events

**Solution**:
1. Verify webhook is subscribed in dashboard
2. Check webhook subscription has `messages` field enabled
3. Verify X-Hub-Signature-256 verification passes (check logs)
4. Ensure callback URL is publicly accessible and returns 200

---

### Access Token Expired

**Problem**: API returns `Invalid OAuth Token`

**Solution**:
1. Re-authenticate at `/dashboard/accounts` → "Reconnect"
2. Or implement automatic token refresh (see Step 9)

---

## API Reference

### Send Direct Message

```javascript
await instagramService.sendMessage(accessToken, recipientId, messageText);
```

### Send Media (Image/Video)

```javascript
await instagramService.sendMediaMessage(accessToken, recipientId, mediaUrl, 'image');
```

### Get Conversations

```javascript
const conversations = await instagramService.getConversations(accessToken);
```

### Get Messages from Conversation

```javascript
const messages = await instagramService.getConversationMessages(accessToken, conversationId);
```

### Get Business Account Info

```javascript
const info = await instagramService.getBusinessAccountInfo(accessToken, businessAccountId);
```

### Verify Webhook Signature

```javascript
const isValid = instagramService.verifyWebhookSignature(rawBody, signature);
```

---

## Rate Limits

Meta API Rate Limits:
- **Standard Rate Limit**: 800 API calls per 1-hour rolling window
- **Message Send Limit**: 1000 API calls per 1-hour rolling window

**Best Practices**:
- Queue messages during peak hours
- Implement exponential backoff for retries
- Monitor rate limit headers: `X-Rate-Limit-*`

---

## Security Best Practices

### 1. Never expose secrets
```bash
# ❌ DON'T
const token = "igbusiness_..."; // In code

# ✅ DO
const token = process.env.INSTAGRAM_ACCESS_TOKEN; // From .env
```

### 2. Use environment variables
- `.env.local` for development
- CI/CD secrets for production
- Never commit credentials

### 3. Validate webhook signatures
- Always verify X-Hub-Signature-256
- Reject unverified requests
- Log failed verifications

### 4. Use HTTPS only
- Production URLs must be HTTPS
- Webhooks require HTTPS callback URL

### 5. Rotate tokens regularly
- Implement token refresh (Step 9)
- Monitor token expiration dates
- Have fallback authentication

---

## Next Steps

Once setup is complete:

1. ✅ Test message sending in dashboard
2. ✅ Create automation rules for incoming messages
3. ✅ Set up AI reply fallback
4. ✅ Monitor webhook events in logs
5. ✅ Deploy to production
6. ✅ Set up monitoring and alerts

---

## Support & Resources

- **Meta Developers Docs**: https://developers.facebook.com/docs/instagram-api
- **Instagram Graph API Reference**: https://developers.facebook.com/docs/instagram-graph-api/reference
- **Webhook Events**: https://developers.facebook.com/docs/instagram-api/webhooks
- **OAuth Flow**: https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow

---

**Phase 6 Setup Complete!** 🚀

Your Instagram Messaging API integration is now ready for production use.
