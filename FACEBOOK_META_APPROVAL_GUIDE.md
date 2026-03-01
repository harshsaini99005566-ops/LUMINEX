# 🎬 Facebook/Meta App Approval - Complete Guide

This guide will help you set up Facebook OAuth, test all features, and record the screencast for Meta App Review approval.

## 📋 Prerequisites

Before you begin, ensure you have:
- ✅ Facebook Developer Account
- ✅ Meta Business Account
- ✅ Facebook Page created
- ✅ Instagram Business Account linked to your Facebook Page
- ✅ Both servers running (frontend & backend)

---

## 🔧 Step 1: Configure Facebook App

### 1.1 Create/Access Your Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Business** type
4. Fill in app details:
   - **App Name**: LUMINEX Automation
   - **App Contact Email**: your-email@example.com
   - **Business Account**: Select your business account

### 1.2 Configure OAuth Settings

1. In your app dashboard, go to **Settings** → **Basic**
2. Add **App Domains**: `localhost` (for testing)
3. Go to **Facebook Login** → **Settings**
4. Add **Valid OAuth Redirect URIs**:
   ```
   http://localhost:5001/api/auth/facebook/callback
   ```

### 1.3 Get Your Credentials

1. In **Settings** → **Basic**, find:
   - **App ID** (this is your `FACEBOOK_CLIENT_ID`)
   - **App Secret** (click Show, this is your `FACEBOOK_CLIENT_SECRET`)

### 1.4 Add Required Permissions

Go to **App Review** → **Permissions and Features** and request:

✅ **Required Permissions:**
- `email` - Get user email (approved by default)
- `public_profile` - Get basic profile info (approved by default)
- `pages_show_list` - Display user's Facebook pages
- `pages_read_engagement` - Read page engagement metrics
- `pages_manage_metadata` - Manage page information
- `pages_messaging` - Send/receive messages via pages
- `instagram_basic` - Access basic Instagram account info
- `instagram_manage_messages` - Manage Instagram DMs
- `instagram_manage_comments` - Manage Instagram comments

---

## 🔐 Step 2: Update Environment Variables

### 2.1 Update Backend .env

Open `d:\LUMINEX AUTOMATION\.env` and add your Facebook credentials:

```env
# Facebook OAuth Configuration
FACEBOOK_CLIENT_ID=your_facebook_app_id_here
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret_here
FACEBOOK_REDIRECT_URI=http://localhost:5001/api/auth/facebook/callback
FACEBOOK_CALLBACK_URL=http://localhost:5001/api/auth/facebook/callback
```

**Replace:**
- `your_facebook_app_id_here` → Your actual App ID from Step 1.3
- `your_facebook_app_secret_here` → Your actual App Secret from Step 1.3

### 2.2 Restart Backend Server

After updating .env, restart the backend server:

```powershell
# Stop the current backend (Ctrl+C in the terminal running it)
cd "d:\LUMINEX AUTOMATION\backend"
npm start
```

---

## 🧪 Step 3: Test the OAuth Flow

### 3.1 Access the Login Page

1. Open your browser to: http://localhost:3000/login
2. You should see the **"Continue with Facebook"** button

### 3.2 Test Facebook Login

1. Click **"Continue with Facebook"**
2. You'll be redirected to Facebook's OAuth page
3. **IMPORTANT**: Use a test user or your own Facebook account
4. Review the permissions requested:
   - Email
   - Public Profile
   - Show list of Pages you manage
   - Read engagement data from Pages
   - Manage page metadata
   - Manage messages on behalf of pages
   - Access Instagram Basic info
   - Manage Instagram messages
   - Manage Instagram comments

5. Click **"Continue"** or **"Allow"**
6. You'll be redirected back to: http://localhost:3000/dashboard/accounts
7. You should see:
   - ✅ Success message with your name
   - Your Facebook pages listed
   - Instagram Business accounts (if linked)
   - Permission explanations

---

## 🎥 Step 4: Record Screencast for Meta App Review

Meta requires a screencast demonstrating your app's use of requested permissions. Follow this script:

### 4.1 Recording Setup

**Tools you can use:**
- Windows: Xbox Game Bar (Win + G)
- OBS Studio (free, professional)
- Loom (browser-based)
- Any screen recorder that captures audio

**Requirements:**
- Resolution: At least 720p (1280x720)
- Duration: 2-5 minutes
- Format: MP4, MOV, or WebM
- Include audio narration explaining each step

### 4.2 Screencast Script

Record the following sequence:

#### **Scene 1: Introduction (15 seconds)**
🎤 *"Hello, this is LUMINEX Automation, an Instagram DM and comment automation platform. I'll demonstrate how we use Facebook permissions."*

**Show:**
- App login page at http://localhost:3000/login

---

#### **Scene 2: Initiate Facebook Login (20 seconds)**
🎤 *"First, users click 'Continue with Facebook' to connect their account."*

**Actions:**
1. Click **"Continue with Facebook"** button
2. Show Facebook OAuth dialog loading

---

#### **Scene 3: Permission Request Screen (45 seconds)**
🎤 *"Facebook shows the permission request dialog. Let me explain why we need each permission."*

**Show the permission screen and explain:**

1. **pages_show_list**
   🎤 *"We need 'Show list of Pages' to display which Facebook pages the user manages, so they can select the page they want to automate."*

2. **pages_read_engagement**
   🎤 *"We need 'Read engagement data' to show analytics and metrics about their page's performance."*

3. **pages_manage_metadata**
   🎤 *"We need 'Manage page metadata' to keep page information up to date in our system."*

4. **pages_messaging**
   🎤 *"We need 'Manage messages' to automate responses to messages received on their Facebook page."*

5. **instagram_basic**
   🎤 *"We need 'Instagram Basic' to access their Instagram Business account linked to their Facebook page."*

6. **instagram_manage_messages**
   🎤 *"We need 'Manage Instagram messages' to automatically respond to Instagram DMs based on their automation rules."*

7. **instagram_manage_comments**
   🎤 *"We need 'Manage Instagram comments' to automatically respond to comments on Instagram posts."*

**Actions:**
- Click **"Continue"** or **"Allow"**

---

#### **Scene 4: After Login - Pages List (60 seconds)**
🎤 *"After authorization, users are redirected to our dashboard where they can see their connected Facebook pages."*

**Show:**
1. Dashboard redirect to http://localhost:3000/dashboard/accounts
2. Success message appears
3. **Point to Facebook Integration section showing:**
   - Your Facebook pages listed
   - Instagram Business accounts linked to pages
   - Each page showing "CONNECTED" status

🎤 *"Here, users can see all their Facebook pages that have the necessary permissions. Each page shows whether it has a linked Instagram Business account."*

**Scroll to show:**
- The permission explanation box at the bottom
- Read the permissions aloud
- Read these exact lines aloud:
   - **Pages fetched from Facebook**: We fetch your managed pages from Facebook Graph API
   - **Pages displayed in UI**: We show connected pages in this dashboard section
   - **Why permission is needed**: Meta requires clear and transparent permission usage

---

#### **Scene 5: Demonstrate Page Selection (30 seconds)**
🎤 *"Our app uses the pages_show_list permission to display these pages, allowing users to select which page they want to set up automation for."*

**Show:**
- Hover over different pages
- Show the Instagram username if available
- Highlight the "No Instagram Business Account linked" warning if present

---

#### **Scene 6: Explain Use Case (30 seconds)**
🎤 *"With these permissions, LUMINEX can automate Instagram DM responses and comment replies, helping businesses respond to customers 24/7 without manual intervention."*

**Show:**
- Navigate to /dashboard/rules (if available)
- Or explain: *"Users can create automation rules, set up triggers, and define automatic responses."*

---

#### **Scene 7: Data Privacy Statement (20 seconds)**
🎤 *"We take privacy seriously. All data is encrypted, stored securely, and only used for the automation features users explicitly set up. We never share or sell user data."*

**Show:**
- Navigate to http://localhost:5001/privacy
- Show the privacy policy page

---

#### **Scene 8: Closing (10 seconds)**
🎤 *"Thank you for reviewing LUMINEX. We're committed to helping businesses automate their Instagram engagement while respecting user privacy and Meta's platform policies."*

**Show:**
- Return to dashboard
- End recording

---

### 4.3 Recording Checklist

Before recording, ensure:

- ✅ Both servers are running
- ✅ Facebook OAuth credentials are configured
- ✅ You're using a test Facebook account or your own account
- ✅ Your Facebook page has an Instagram Business account linked
- ✅ Your microphone is working for narration
- ✅ Close unnecessary browser tabs
- ✅ Hide sensitive information (personal emails, production keys, etc.)
- ✅ Test the full flow once before recording

---

## 📤 Step 5: Submit to Meta App Review

### 5.1 Prepare Your Submission

1. Go to your Facebook App → **App Review** → **Permissions and Features**
2. For each permission, click **Request**
3. Fill in the form:

   **For each permission, provide:**
   
   - **How will your app use this permission?**
     ```
     LUMINEX uses this permission to [specific use case from the screencast]. 
     This allows users to automate Instagram DM responses and comment replies 
     for their business, improving customer engagement and response times.
     ```
   
   - **Upload your screencast** (the video you just recorded)
   
   - **Additional documentation:**
     - Privacy Policy URL: `http://localhost:5001/privacy` (update to production URL)
     - Terms of Service URL: `http://localhost:5001/terms` (update to production URL)

### 5.2 Permission-Specific Explanations

Copy these explanations for each permission:

#### **pages_show_list**
```
LUMINEX displays the user's Facebook pages in the dashboard (timestamp 1:20-2:00 
in screencast) to allow them to select which page they want to set up automation 
for. This is essential as users need to choose the specific page that will use 
our automation features.

Pages fetched from Facebook: We fetch managed pages from Facebook Graph API.
Pages displayed in UI: We show connected pages in the dashboard section.
Why permission is needed: Meta requires clear and transparent permission usage.
```

#### **pages_read_engagement**
```
LUMINEX reads page engagement metrics (likes, comments, messages) to provide 
analytics on the dashboard and help users understand which automation rules are 
most effective. This data helps users optimize their automated responses.
```

#### **pages_manage_metadata**
```
LUMINEX requires access to page metadata to keep our system synchronized with 
Facebook page information (name, profile picture, etc.) and ensure automation 
rules are applied to the correct page.
```

#### **pages_messaging**
```
LUMINEX sends automated responses to messages received on Facebook pages based 
on user-defined rules. This enables businesses to provide 24/7 customer support 
without manual intervention.
```

#### **instagram_basic**
```
LUMINEX accesses basic Instagram Business account information to verify the 
account is properly linked to the Facebook page and to display account details 
in the dashboard (shown at timestamp 2:00-2:30 in screencast).
```

#### **instagram_manage_messages**
```
LUMINEX manages Instagram Direct Messages by automatically responding to incoming 
DMs based on user-configured rules. This is the core feature of our platform, 
helping businesses respond to customer inquiries instantly.
```

#### **instagram_manage_comments**
```
LUMINEX manages Instagram comments by automatically responding to comments on 
posts based on user-configured rules. This helps businesses engage with their 
audience and answer common questions automatically.
```

### 5.3 Common Review Notes

**What Meta Reviewers Look For:**
- ✅ Clear demonstration of how EACH permission is used
- ✅ User benefit and value proposition
- ✅ Data handling and privacy practices
- ✅ Professional presentation
- ✅ Legitimate business use case

**Common Rejection Reasons to Avoid:**
- ❌ Not showing how a permission is used
- ❌ Recording is too short or unclear
- ❌ Missing audio narration
- ❌ Requesting permissions not used in the app
- ❌ Unclear privacy policy

---

## 🐛 Troubleshooting

### Issue: "Facebook OAuth not configured" error

**Solution:**
1. Check `.env` file has FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET
2. Restart backend server after updating .env
3. Verify credentials are correct (no extra spaces or quotes)

### Issue: 404 Error when clicking "Login with Facebook"

**Solution:**
1. Ensure backend server is running on port 5001
2. Check NEXT_PUBLIC_API_URL in frontend/.env.local is set to `http://localhost:5001`
3. Verify the button clicks to: `http://localhost:5001/api/auth/facebook`

### Issue: Redirect URI mismatch

**Solution:**
1. Go to Facebook App → Facebook Login → Settings
2. Add exact redirect URI: `http://localhost:5001/api/auth/facebook/callback`
3. Ensure no trailing slash

### Issue: No pages showing after login

**Solution:**
1. Ensure your Facebook account manages at least one page
2. Link an Instagram Business account to your page
3. Check browser console for errors
4. Verify backend logs show pages fetched

### Issue: "Invalid token" when fetching pages

**Solution:**
1. Clear browser cookies
2. Login with Facebook again
3. Check backend logs for JWT signing errors

---

## 📞 Production Deployment Notes

Before submitting for production approval:

1. **Update URLs in code:**
   - Change `http://localhost:3000` to your production frontend URL
   - Change `http://localhost:5001` to your production backend URL
   - Update FACEBOOK_REDIRECT_URI in production .env

2. **Update Facebook App Settings:**
   - Add production domain to **App Domains**
   - Add production redirect URI to **Valid OAuth Redirect URIs**
   - Set app to **Live Mode** (not Development)

3. **Update URLs in submission:**
   - Privacy Policy URL: `https://yourdomain.com/privacy`
   - Terms of Service URL: `https://yourdomain.com/terms`
   - Re-record screencast using production URLs (optional but recommended)

4. **Security:**
   - Use HTTPS in production
   - Enable `secure: true` for cookies
   - Set proper CORS origins
   - Use environment variables for all secrets

---

## ✅ Quick Test Checklist

Before recording your screencast, test everything:

- [ ] Backend server running on port 5001
- [ ] Frontend server running on port 3000
- [ ] Facebook credentials in .env file
- [ ] Can access http://localhost:3000/login
- [ ] "Continue with Facebook" button works
- [ ] Facebook OAuth dialog appears
- [ ] Can see permissions request screen
- [ ] After allowing, redirected to accounts page
- [ ] Success message appears
- [ ] Facebook pages are listed
- [ ] Instagram accounts are shown (if linked)
- [ ] Permission explanation box is visible
- [ ] Privacy policy accessible at http://localhost:5001/privacy
- [ ] Terms of service accessible at http://localhost:5001/terms

---

## 🎉 Success!

Once you complete these steps and submit your app for review:

1. Meta typically reviews within 5-7 business days
2. You'll receive email notifications about review status
3. If approved, your app can access the requested permissions for all users
4. If rejected, you'll receive specific feedback on what to improve

**Need help?** Check the Meta Platform Terms and Developer Policies at:
- https://developers.facebook.com/docs/apps/review
- https://developers.facebook.com/docs/development/release/

---

## 📚 Additional Resources

- [Meta App Review Guidelines](https://developers.facebook.com/docs/apps/review)
- [Facebook Login for Business](https://developers.facebook.com/docs/facebook-login/overview)
- [Instagram Platform API](https://developers.facebook.com/docs/instagram-api)
- [Pages API Reference](https://developers.facebook.com/docs/pages/overview)

---

**Good luck with your Meta App Review! 🚀**
