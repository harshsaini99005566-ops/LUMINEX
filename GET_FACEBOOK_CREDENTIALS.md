# 🎯 Get Facebook App Credentials - Step by Step

Follow these steps **exactly** to get your Facebook App credentials in under 10 minutes.

---

## ✅ Prerequisites
- [ ] A Facebook account (personal account)
- [ ] Browser open

---

## 📝 STEP 1: Go to Facebook Developers

1. **Open this URL in your browser:**
   ```
   https://developers.facebook.com/apps/
   ```

2. **Log in** with your Facebook account if prompted

3. You should see the "My Apps" page

---

## 📝 STEP 2: Create New App

1. **Click the green "Create App" button** (top right)

2. **Choose an app type:**
   - Select: **"Business"** or **"Consumer"**
   - Click **"Next"**

3. **Fill in app details:**
   - **Display Name:** `LUMINEX Automation` (or your preferred name)
   - **App Contact Email:** Your email address
   - **Business Account:** Leave blank (optional)
   - Click **"Create App"**

4. **Complete security check** if prompted (CAPTCHA)

5. **Wait** - Facebook is creating your app (takes 5-10 seconds)

---

## 📝 STEP 3: Get Your Credentials

1. **You should now see your App Dashboard**

2. **In the left sidebar**, click: **"Settings" → "Basic"**

3. **You'll see two important fields:**

   ### App ID:
   ```
   [Copy this number - looks like: 123456789012345]
   ```
   
   ### App Secret:
   ```
   Click "Show" button
   Enter your Facebook password when prompted
   [Copy this long string - looks like: abc123def456...]
   ```

4. **Keep this page open** - you'll need these values

---

## 📝 STEP 4: Add Facebook Login Product

1. **Scroll down** on the left sidebar to **"Products"** section

2. **Find "Facebook Login"** in the product list

3. **Click "Set Up"** button next to Facebook Login

4. **Choose platform:** Select **"Web"**

5. You'll see a Quick Start guide - **you can skip this**, just click through or close it

---

## 📝 STEP 5: Configure OAuth Redirect URIs

1. **In the left sidebar**, under Facebook Login, click **"Settings"**

2. **Find the field:** "Valid OAuth Redirect URIs"

3. **Add this URL exactly:**
   ```
   http://localhost:5001/api/auth/facebook/callback
   ```

4. **Click "Save Changes"** (bottom right)

---

## 📝 STEP 6: Set App Mode to Development

1. **At the top of the page**, you'll see a toggle that says **"In Development"** or **"Live Mode"**

2. **Make sure it says "In Development"** (this is default for new apps)

3. For testing, Development mode is perfect!

---

## 📝 STEP 7: Update Your .env File

Now copy your credentials into your project:

1. **Open your `.env` file** (already open in VS Code)

2. **Replace these lines:**
   ```env
   FACEBOOK_CLIENT_ID=YOUR_FACEBOOK_APP_ID_HERE
   FACEBOOK_CLIENT_SECRET=YOUR_FACEBOOK_APP_SECRET_HERE
   ```

   **With your actual values:**
   ```env
   FACEBOOK_CLIENT_ID=123456789012345
   FACEBOOK_CLIENT_SECRET=abc123def456ghi789jkl012mno345pq
   ```

3. **Save the file** (Ctrl+S)

---

## 📝 STEP 8: Restart Backend Server

Tell me when you're ready, and I'll restart the server for you!

Or run this command yourself:
```powershell
# Stop current server: Ctrl+C in the backend terminal
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
⚠️ Facebook OAuth credentials not configured properly
```

---

## 🧪 STEP 9: Test Facebook Login

1. **Open browser:** http://localhost:3000/login

2. **Click:** "Continue with Facebook"

3. **Facebook will ask for permissions** - Click "Continue" or "Allow"

4. **You should be redirected** to your dashboard!

5. **Check MongoDB** - you should see a new user with `facebookId`

---

## ❓ Troubleshooting

### "URL can't be loaded: App is in development mode"
**Solution:** 
1. Go to **Roles → Test Users** in your Facebook App
2. Create a test user
3. Use that test account to login
4. OR add your personal Facebook account to test users

### "Redirect URI Mismatch"
**Solution:**
- Double-check the redirect URI is exactly: `http://localhost:5001/api/auth/facebook/callback`
- Make sure you clicked "Save Changes"

### "Invalid Client ID"
**Solution:**
- Make sure you copied the App ID correctly (no extra spaces)
- It should be a long number (15+ digits)

---

## 📋 Quick Checklist

Before testing, verify:
- [ ] Created Facebook App
- [ ] Copied App ID and App Secret
- [ ] Added them to `.env` file
- [ ] Added Facebook Login product
- [ ] Configured OAuth Redirect URI: `http://localhost:5001/api/auth/facebook/callback`
- [ ] Saved changes in Facebook
- [ ] Saved `.env` file
- [ ] Restarted backend server
- [ ] Server shows: "✅ Facebook OAuth configured successfully"

---

## 🎉 Success!

Once working, you'll be able to:
- ✅ Sign up with Facebook (creates new account)
- ✅ Login with Facebook (uses existing account)
- ✅ Link Facebook to existing email account
- ✅ Access Facebook Pages data (for Instagram automation)

---

## 📞 Next Steps

After you have the credentials:
1. Tell me when you're ready to update the `.env` file
2. I'll verify the format is correct
3. I'll restart the backend server
4. We'll test the Facebook login together

**Ready to start?** Just tell me which step you're on or if you need help!
