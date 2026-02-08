# ✅ INSTAGRAM SETUP - STEP BY STEP GUIDE

## STEP 1: Create Meta Developer Account
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Go to: https://developers.facebook.com/
1. Click "Get Started"
2. Login with your Facebook account (create one if needed)
3. Accept terms and setup

⏱️ Time: 2-3 minutes
✓ What you get: Meta Developer account


## STEP 2: Create a Business App
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Location: My Apps (top right) → Create App

Fill in these details:
├─ App Name: "VEXORA" (or your project name)
├─ App Contact Email: your@email.com
├─ App Purpose: Select "Business" or "Apps for Instagram"
├─ App Type: Select "Business"
└─ Verify email

Click "Create App ID"

⏱️ Time: 2 minutes
✓ What you get: App ID (you'll need this)


## STEP 3: Add Instagram Product
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 In your app dashboard:

1. Look for "Add a Product" section
2. Find "Instagram Graph API"
3. Click "Set Up"
4. Follow the setup wizard
5. Complete initial setup

⏱️ Time: 3-5 minutes
✓ What you'll see: Instagram Graph API product added


## STEP 4: Get Your Credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Location: Settings → Basic (in your app dashboard)

You'll see:
├─ App ID: 123456789012345
├─ App Secret: abc123def456xyz789secret
└─ App Link

📋 COPY THESE TWO VALUES:
   ┌─────────────────────────────────────┐
   │ App ID: ___________________        │
   │ App Secret: ___________________    │
   └─────────────────────────────────────┘

⚠️ IMPORTANT: Keep App Secret confidential!

⏱️ Time: 1 minute
✓ What you get: Credentials needed for .env


## STEP 5: Configure OAuth Redirect URI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Location: Products → Instagram Graph API → Settings

1. Scroll down to "Valid OAuth Redirect URIs"
2. Click "Add URI"
3. Enter: http://localhost:5001/api/instagram/auth/callback
4. Click "Save Changes"

Also add App Domain:
1. Look for "App Domains"
2. Add: localhost

⏱️ Time: 1 minute
✓ What happens: OAuth callbacks will work


## STEP 6: Update Your .env File
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 File: backend/.env

CURRENT (WRONG):
┌────────────────────────────────────────────┐
│ INSTAGRAM_APP_ID=your_instagram_app_id     │
│ INSTAGRAM_APP_SECRET=your_instagram_app... │
│ # BACKEND_URL not set                      │
│ INSTAGRAM_REDIRECT_URI=http://localhost:... │
└────────────────────────────────────────────┘

REPLACE WITH (from Step 4):
┌────────────────────────────────────────────┐
│ INSTAGRAM_APP_ID=123456789012345           │
│ INSTAGRAM_APP_SECRET=abc123def456xyz789... │
│ BACKEND_URL=http://localhost:5001          │
│ INSTAGRAM_REDIRECT_URI=http://localhost:... │
│   /api/instagram/auth/callback             │
└────────────────────────────────────────────┘

📝 How to edit:
   1. Open: e:\INSTA AUTOMATION\backend\.env
   2. Find the Instagram section
   3. Replace App ID and Secret with real values
   4. Make sure BACKEND_URL is set
   5. Save file (Ctrl+S)

⏱️ Time: 2 minutes


## STEP 7: Restart Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 PowerShell:

```powershell
# Kill existing processes
taskkill /IM node.exe /F

# Start backend
cd "e:\INSTA AUTOMATION\backend"
npm run start

# Wait for startup messages
# Should see: ✅ Express Server running on port 5001
# Should see: ✅ Database: Connected to test
```

⏱️ Time: 3-5 seconds (startup)
✓ You'll see: Green checkmarks in terminal


## STEP 8: Test Connection
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 In your browser:

1. Open: http://localhost:3000
2. Login to your account
3. Go to: "Instagram Accounts" section
4. Click: "Connect Instagram Account"
5. You'll be redirected to Instagram login
6. Login and authorize the app
7. You'll be redirected back to website
8. ✅ Account should now appear in the list!

⏱️ Time: 2-3 minutes
✓ Success: Account shows up and says "Connected"


## TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ "Invalid OAuth redirect URI"
→ Make sure redirect URI in Meta App matches exactly
→ Use: http://localhost:5001 (not :5000)

❌ "App not found" or "Invalid app ID"
→ Copy-paste App ID again from Meta Developer
→ Restart backend after updating .env

❌ "Access Denied" or "Cannot authorize"
→ Make sure Instagram account is Business/Creator type
→ Go to Instagram Settings → Account Type → Switch to Business

❌ "Redirect loop" or keeps asking to login
→ Clear browser cache: Ctrl+Shift+R
→ Try different browser (Chrome, Edge, Firefox)

❌ Backend won't start
→ Check if port 5001 is already in use
→ Run: taskkill /IM node.exe /F
→ Check .env file has no syntax errors


## VERIFICATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before starting:
☐ Have real Instagram App ID (not placeholder)
☐ Have real Instagram App Secret
☐ Instagram account is Business type
☐ Meta App has correct redirect URI

During setup:
☐ .env file updated with real credentials
☐ BACKEND_URL is set
☐ Backend server restarted
☐ No error messages in backend console

After connection:
☐ Can connect to Instagram
☐ Account appears in website
☐ Account shows as "Connected"
☐ Can see account details (username, followers, etc.)


## TOTAL TIME ESTIMATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Steps 1-5 (Setup):  ~15 minutes
Step 6 (Update):    ~2 minutes
Step 7 (Restart):   ~5 minutes
Step 8 (Test):      ~2 minutes
─────────────────
Total:              ~25 minutes


## NEXT: FOLLOW THESE STEPS NOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

► Go to https://developers.facebook.com/
► Complete Steps 1-5 above
► Copy your App ID and App Secret
► Come back and tell me when you have the credentials
► I'll help you update the .env file
► Then we'll test it!


═══════════════════════════════════════════════════════════════
Ready to proceed? Let me know when you have your App ID and Secret!
═══════════════════════════════════════════════════════════════
