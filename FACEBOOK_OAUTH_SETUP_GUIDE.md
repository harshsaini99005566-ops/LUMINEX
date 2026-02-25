# Facebook OAuth Setup Guide 🔐

## Overview
This guide will help you configure Facebook OAuth login for your LUMINEX application. After setup, users will be able to sign up and log in using their Facebook accounts.

## ✅ What Was Fixed

### Backend Changes
1. **User Model Updated** ([backend/src/models/User.js](backend/src/models/User.js))
   - Added `facebookId` field to store Facebook user ID
   - Added `facebookAccessToken` field to store Facebook access token
   - Added `facebookPages` array to store connected Facebook pages
   - Added `isEmailVerified` field (auto-set to true for Facebook users)
   - Made `password` field optional (not required for OAuth users)
   - Updated password hashing to skip OAuth users

2. **OAuth Callback Fixed** ([backend/src/routes/auth.js](backend/src/routes/auth.js#L467))
   - Now creates or finds user in database based on Facebook profile
   - Generates proper JWT authentication token (same format as regular login)
   - Sets HttpOnly cookie for session persistence
   - Redirects to `/dashboard` instead of `/dashboard/accounts`
   - Includes token in URL for localStorage backup
   - Error redirects now go to `/login` instead of `/dashboard/accounts`

### Frontend Changes
1. **Dashboard Page Updated** ([frontend/app/dashboard/page.tsx](frontend/app/dashboard/page.tsx))
   - Added useEffect hook to handle Facebook OAuth callback
   - Extracts token from URL parameters after Facebook login
   - Stores token in localStorage for authentication
   - Cleans up URL parameters after processing
   - Shows success message to user

### Configuration
1. **Environment Variables** ([.env](.env))
   - Updated with local development URLs
   - Added detailed setup instructions in comments
   - Fixed redirect URIs to use localhost

---

## 🚀 Setup Instructions

### Step 1: Create Facebook App

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/apps/
   - Log in with your Facebook account

2. **Create New App**
   - Click "Create App" button
   - Choose app type: "Consumer" or "Business"
   - Fill in:
     - App Name: "LUMINEX" (or your preferred name)
     - App Contact Email: your email
   - Click "Create App"

3. **Get Your Credentials**
   - Go to Settings > Basic
   - Copy your **App ID**
   - Click "Show" next to App Secret and copy **App Secret**

### Step 2: Configure Facebook Login

1. **Add Facebook Login Product**
   - In your app dashboard, click "+ Add Product"
   - Find "Facebook Login" and click "Set Up"
   - Choose "Web" platform

2. **Configure OAuth Settings**
   - Go to Facebook Login > Settings
   - In "Valid OAuth Redirect URIs" add:
     ```
     http://localhost:5001/api/auth/facebook/callback
     ```
   - Click "Save Changes"

3. **Set Required Permissions**
   The app already requests these permissions:
   - ✅ `email` - Get user's email
   - ✅ `public_profile` - Get user's name and profile picture
   - ✅ `pages_show_list` - List user's Facebook pages
   - ✅ `pages_messaging` - Enable page messaging (for Instagram DM features)
   - ✅ `instagram_basic` - Instagram account access
   - ✅ `instagram_manage_messages` - Manage Instagram messages

### Step 3: Update Environment Variables

1. **Open `.env` file** in your project root

2. **Replace placeholder values** with your actual credentials:
   ```env
   FACEBOOK_CLIENT_ID=1234567890123456
   FACEBOOK_CLIENT_SECRET=abc123def456ghi789jkl012mno345pq
   FACEBOOK_REDIRECT_URI=http://localhost:5001/api/auth/facebook/callback
   FRONTEND_URL=http://localhost:3000
   ```

3. **Save the file**

### Step 4: Restart Backend Server

After updating the `.env` file, you must restart the backend server:

```powershell
# If server is running, stop it first (Ctrl+C)
# Then restart:
cd backend
node src/server.js
```

You should see:
```
✅ Facebook OAuth configured successfully
```

Instead of:
```
⚠️ Facebook OAuth credentials not found
```

---

## 🧪 Testing Facebook Login

### 1. Start Servers
```powershell
# Terminal 1 - Backend
cd backend
node src/server.js

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Test Login Flow

1. **Open Browser**
   - Go to http://localhost:3000/login

2. **Click "Continue with Facebook"**
   - You'll be redirected to Facebook
   - Facebook will ask for permissions
   - Click "Continue" or "Allow"

3. **Verify Success**
   - You should be redirected back to http://localhost:3000/dashboard
   - Check browser console for success message: `✅ Facebook login successful!`
   - Dashboard should load with your user profile

### 3. Check Database

Open MongoDB and verify the user was created:
```javascript
db.users.findOne({ facebookId: { $exists: true } })
```

Should show:
```javascript
{
  _id: ObjectId("..."),
  email: "user@facebook.com",
  firstName: "John",
  lastName: "Doe",
  facebookId: "1234567890",
  isEmailVerified: true,
  plan: "free",
  createdAt: ISODate("...")
}
```

---

## 🔒 Security Notes

### What's Secure
✅ JWT tokens stored in HttpOnly cookies (prevents XSS attacks)
✅ Facebook App Secret never exposed to frontend
✅ CSRF protection via state parameter (if implemented)
✅ Tokens include user ID from database (not Facebook ID)
✅ Facebook access tokens stored separately (not in JWT)

### Best Practices
- Never commit `.env` file to version control
- Use different Facebook App for development and production
- Regenerate App Secret if accidentally exposed
- Enable 2FA on your Facebook developer account
- Regularly review your app's data access permissions

---

## 🐛 Troubleshooting

### Issue: "Facebook OAuth credentials not found"
**Solution:** Update `.env` with real credentials and restart backend server

### Issue: "Redirect URI mismatch"
**Cause:** The callback URL in Facebook app doesn't match your `.env`
**Solution:** 
- Check Facebook Login > Settings > Valid OAuth Redirect URIs
- Must exactly match: `http://localhost:5001/api/auth/facebook/callback`

### Issue: "This app is in Development Mode"
**Cause:** Facebook apps start in development mode
**Solution:** 
- For testing, add test users in Roles > Test Users
- For production, submit app for review to go live

### Issue: Redirects to login page after Facebook auth
**Cause:** This was the original issue - now fixed!
**What was wrong:**
- Backend wasn't creating user accounts
- No JWT token was being generated
- Frontend had no authentication token
**What's fixed:**
- Backend now creates/finds user by Facebook ID
- Proper JWT token generated and stored
- Dashboard handles OAuth callback properly

### Issue: "Can't access user email"
**Cause:** User declined email permission
**Solution:** Email field is optional - generates fallback email: `fb_[FACEBOOK_ID]@facebook.com`

---

## 📚 Additional Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 🎉 Success Checklist

Before considering Facebook OAuth fully configured:

- [ ] Facebook app created and configured
- [ ] App ID and App Secret added to `.env`
- [ ] Valid OAuth Redirect URI configured in Facebook app
- [ ] Backend server restarted and shows "Facebook OAuth configured"
- [ ] Frontend showing "Continue with Facebook" button
- [ ] Test login works and redirects to dashboard
- [ ] User account created in MongoDB with `facebookId`
- [ ] JWT token stored in localStorage and cookie
- [ ] Dashboard loads user profile correctly

---

## 🚀 Production Deployment

When deploying to production:

1. **Create Production Facebook App**
   - Don't use the same app for dev and production
   - Or add production URLs to existing app

2. **Update OAuth Redirect URI**
   ```
   https://yourdomain.com/api/auth/facebook/callback
   ```

3. **Update Environment Variables**
   ```env
   FACEBOOK_REDIRECT_URI=https://yourdomain.com/api/auth/facebook/callback
   FRONTEND_URL=https://yourdomain.com
   NODE_ENV=production
   ```

4. **Submit for App Review** (if using advanced permissions)
   - Required for public apps
   - Explain why you need each permission
   - Provide test credentials and video demo

---

**Need help?** Check [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for more guides.
