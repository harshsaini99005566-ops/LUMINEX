# 🔧 FIX: Instagram Account Connection Not Showing

## Problem
Connected Instagram account doesn't appear on the website.

## Root Causes Identified

### 1. ❌ Missing Instagram Credentials
Your `.env` file has placeholder values:
```
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
```

### 2. ❌ Missing BACKEND_URL
The OAuth redirect URI needs the backend URL configured.

### 3. ❌ Wrong Redirect URI
Old setting: `http://localhost:5000/auth/instagram/callback`  
Should be: `http://localhost:5001/api/instagram/auth/callback`

---

## ✅ SOLUTION: Get Instagram Credentials

### Step 1: Create Meta App
1. Go to [Meta Developer Portal](https://developers.facebook.com/)
2. Login with your Facebook account
3. Click "My Apps" → "Create App"
4. Choose "Business" as app type
5. Fill in app details and create

### Step 2: Add Instagram Product
1. In your app dashboard, click "Add Product"
2. Find "Instagram Graph API" and click "Set Up"
3. Complete the setup process

### Step 3: Get Your Credentials
1. Go to **Settings** → **Basic**
2. Copy your **App ID** and **App Secret**
3. Go to **Products** → **Instagram Graph API** → **Settings**
4. Add App Domains and Redirect URIs:
   - App Domain: `localhost`
   - Valid OAuth Redirect URIs: `http://localhost:5001/api/instagram/auth/callback`

### Step 4: Update .env File
Open `backend/.env` and replace:

```env
# BEFORE (Wrong)
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:5000/auth/instagram/callback

# AFTER (Correct)
INSTAGRAM_APP_ID=123456789012345          # Your actual App ID
INSTAGRAM_APP_SECRET=abc123def456xyz789   # Your actual App Secret
INSTAGRAM_REDIRECT_URI=http://localhost:5001/api/instagram/auth/callback
```

### Step 5: Restart Backend Server
```bash
# Kill old process
taskkill /IM node.exe /F

# Start backend again
cd backend
npm run start
```

### Step 6: Test Connection
1. Open http://localhost:3000
2. Go to Instagram Accounts section
3. Click "Connect Instagram Account"
4. Authorize the app when prompted
5. Check if account appears in the list

---

## 🔍 Verify Installation

### Check Backend Logs
```bash
# Should show successful OAuth flow:
[OAuth] Auth URL generated
[OAuth Callback] Received
[OAuth] Token exchange successful
[OAuth] Fetching account info
```

### Check Database
```bash
# Verify account was saved
node backend/scripts/testMongoConnection.js
```

### Check API Response
```bash
# Get all connected accounts
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/instagram/accounts
```

---

## ⚠️ Common Issues

### "Invalid OAuth redirect URI"
- Make sure redirect URI in Meta App matches `.env` exactly
- Use `http://localhost:5001` (not `:5000`)

### "Unable to exchange code for token"
- Check App Secret is correct
- Verify App ID matches Meta Developer Portal
- Check internet connection

### "Business account not found"
- Instagram account must be a Business/Creator account
- Regular personal accounts won't work
- Go to Instagram Settings → Account Type → Switch to Business

### "Webhook subscription failed"
- May need Page Access Token (different from User Token)
- Check Instagram Business Account has necessary permissions

---

## 🎯 Testing Checklist

- [ ] Have real Instagram App ID
- [ ] Have real Instagram App Secret
- [ ] BACKEND_URL is set in .env
- [ ] Redirect URI is correct in Meta App
- [ ] Backend server is running
- [ ] Frontend is running
- [ ] Instagram account is Business/Creator type
- [ ] Can authorize and see connected account

---

## 📚 Additional Resources

- [Meta Developer Documentation](https://developers.facebook.com/docs/instagram-api)
- [Instagram Graph API Reference](https://developers.facebook.com/docs/instagram-graph-api)
- [OAuth Flow Guide](https://developers.facebook.com/docs/instagram-api/guides/getting-started)

---

## ❓ Still Not Working?

Check backend logs:
```bash
cd backend
npm run dev  # Will show detailed error messages
```

Check browser console (F12):
- Look for network errors
- Check API calls are succeeding
- Verify JWT token is valid

Check MongoDB:
```bash
node backend/scripts/testMongoConnection.js
```

---

**Last Updated:** January 28, 2026  
**Status:** Follow steps above to resolve ✅
