# How to Connect Instagram Business Accounts

## ⚠️ Important: You Cannot Use Personal Instagram Accounts

The "Invalid platform app" error occurs because **Instagram Business accounts can ONLY be connected through Facebook Pages**.

## What You Need

1. **Facebook Account** - Your personal or business Facebook account
2. **Facebook Page** - A Facebook Page that you manage (admin access)
3. **Instagram Business Account** - An Instagram account converted to Business type
4. **Link Between Page & Instagram** - Your Instagram Business account must be linked to your Facebook Page

## How to Set This Up

### Step 1: Convert Your Instagram to Business Account

1. Open Instagram app on your phone
2. Go to Settings → Account
3. Tap "Switch to Professional Account"
4. Choose "Business"
5. Connect to your Facebook Page

### Step 2: Verify Facebook Page Link

1. Go to your Facebook Page
2. Click Settings → Instagram
3. Verify your Instagram Business account is connected
4. If not connected, click "Connect Account" and follow steps

### Step 3: Connect to LUMINEX

1. In LUMINEX dashboard, go to **Accounts** page
2. Click **"Connect Facebook"** button
3. Log in with Facebook and approve permissions:
   - `pages_show_list` - To see your Facebook pages
   - `pages_messaging` - To enable messaging features
   - `instagram_basic` - To access your Instagram Business info
   - `instagram_manage_messages` - To automate Instagram DMs
   - `instagram_manage_comments` - To automate comment replies
4. After approval, you'll see your Facebook Pages listed
5. Pages with linked Instagram Business accounts will show the Instagram details

## Why The Old "Connect Instagram" Button Failed

The error you saw: **"Invalid Request: Request parameters are invalid: Invalid platform app"**

This happened because:
- LUMINEX was trying to use the Instagram Basic Display API (deprecated)
- That API only works with Personal Instagram accounts
- Business accounts MUST use Facebook Login and Instagram Graph API
- The app ID `778182015333115` is for the old API type

## What Changed

✅ The "Connect Instagram" button now uses **Facebook OAuth**
✅ You'll connect through Facebook to access Instagram Business accounts
✅ This is the ONLY way Meta/Instagram allows Business account access
✅ You can manage multiple Facebook Pages and their Instagram accounts

## Troubleshooting

### "No Instagram Business Account linked" warning

**Solution:** Link your Instagram to your Facebook Page:
1. Go to Facebook Page → Settings → Instagram
2. Click "Connect Account"
3. Log in to Instagram and approve
4. Refresh LUMINEX dashboard

### "No Facebook Pages found"

**Solution:** Make sure you have admin access to at least one Facebook Page:
1. Create a new Facebook Page if needed
2. Make sure you're an admin (not just editor)
3. Reconnect Facebook in LUMINEX

### Still seeing errors?

Check the backend logs for detailed error messages:
```powershell
# In terminal where backend is running, look for logs like:
[Facebook OAuth] Error: ...
```

## Developer Notes

### App Configuration

The app now uses:
- **Facebook OAuth** for authentication
- **Facebook App ID**: `1430937031965549`
- **Graph API v19.0** for fetching pages
- **Instagram Graph API** for Business account access

### API Endpoints

- `GET /api/auth/facebook` - Initiates Facebook OAuth
- `GET /api/auth/facebook/callback` - Handles OAuth callback
- `GET /api/auth/facebook/pages` - Lists connected pages with Instagram info

### Required Permissions

```javascript
scopes: [
  'email',
  'public_profile',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_metadata',
  'pages_messaging',
  'instagram_basic',
  'instagram_manage_messages',
  'instagram_manage_comments'
]
```

## Summary

🎯 **Instagram Business accounts = Facebook OAuth flow**
🎯 **Personal Instagram accounts = Not supported (Instagram deprecated that API)**
🎯 **Always connect through Facebook first, then Instagram will be available**

---

## Next Steps

1. Convert your Instagram to Business (if not already)
2. Link it to a Facebook Page
3. Click "Connect Facebook" in LUMINEX
4. Approve all permissions
5. Your Instagram Business account will be accessible! 🚀
