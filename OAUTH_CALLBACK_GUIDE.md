# OAUTH Callback Implementation Guide

**Purpose**: Implement the final backend route to complete Instagram account linking  
**Effort**: ~30 minutes  
**Blocker**: Prevents end-to-end OAuth flow testing

## Overview

The OAuth callback route is the missing piece that allows the frontend InstagramConnect component to complete the account linking flow:

```
1. User clicks "Connect Account"
2. Opens Instagram OAuth dialog
3. User authenticates with Meta
4. Instagram redirects to /auth/instagram/callback?code=CODE
5. ⚠️ NEEDS IMPLEMENTATION ⚠️
6. Backend exchanges code → token → account ID
7. Backend stores account in database
8. Frontend shows account in list
```

## Implementation

### Step 1: Implement OAuth Callback Route

**File**: `backend/src/routes/auth.js`  
**Route**: `GET /auth/instagram/callback?code=CODE`

```javascript
// Add to backend/src/routes/auth.js (after other auth routes)

import { getAccessTokenFromCode, exchangeAccessToken, getInstagramBusinessAccountId } from '../services/instagram.js';
import InstagramAccount from '../models/InstagramAccount.js';

router.get('/instagram/callback', async (req, res) => {
  try {
    const { code, error, error_reason, error_description } = req.query;

    // Handle user denial
    if (error) {
      return res.redirect(`/dashboard/accounts?error=${encodeURIComponent(error_description || error)}`);
    }

    // Validate code
    if (!code) {
      return res.redirect('/dashboard/accounts?error=No authorization code received');
    }

    // Get user from session
    const userId = req.user?.id;
    if (!userId) {
      return res.redirect('/login?error=Session expired');
    }

    // Step 1: Exchange code for short-lived access token
    const { accessToken, userId: igUserId } = await getAccessTokenFromCode(code);
    
    if (!accessToken || !igUserId) {
      throw new Error('Failed to get access token from code');
    }

    // Step 2: Get Instagram Business Account ID
    const instagramId = await getInstagramBusinessAccountId(igUserId, accessToken);
    
    if (!instagramId) {
      throw new Error('Failed to get Instagram Business Account ID');
    }

    // Step 3: Exchange short-lived token for long-lived token (60 days)
    const { accessToken: longLivedToken } = await exchangeAccessToken(accessToken);
    
    if (!longLivedToken) {
      throw new Error('Failed to get long-lived access token');
    }

    // Step 4: Check if account already connected
    const existingAccount = await InstagramAccount.findOne({
      userId,
      instagramId
    });

    if (existingAccount && existingAccount.isActive) {
      return res.redirect('/dashboard/accounts?error=This account is already connected');
    }

    // Step 5: Get account details (optional but recommended)
    let accountInfo = {};
    try {
      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,username,name,biography,followers_count,profile_picture_url&access_token=${longLivedToken}`
      );
      accountInfo = await response.json();
    } catch (err) {
      console.warn('Failed to fetch account details:', err);
    }

    // Step 6: Create or update account
    let account;
    if (existingAccount) {
      // Reactivate previously disconnected account
      account = existingAccount;
      account.isActive = true;
      account.accessToken = longLivedToken;
      account.expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
      account.username = accountInfo.username || account.username;
      account.profilePicture = accountInfo.profile_picture_url || account.profilePicture;
      account.followers = accountInfo.followers_count || account.followers;
      account.lastSyncedAt = new Date();
    } else {
      // Create new account
      account = new InstagramAccount({
        userId,
        instagramId,
        username: accountInfo.username || '',
        profilePicture: accountInfo.profile_picture_url || '',
        followers: accountInfo.followers_count || 0,
        accessToken: longLivedToken,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true,
        connectedAt: new Date(),
        lastSyncedAt: new Date()
      });
    }

    await account.save();

    // Step 7: Update user subscription usage if needed
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);
    if (!existingAccount) {
      user.usage.accountsUsed = (user.usage.accountsUsed || 0) + 1;
      await user.save();
    }

    // Step 8: Redirect with success
    res.redirect('/dashboard/accounts?success=true&account=' + account._id);

  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorMessage = error.message || 'Failed to connect account';
    res.redirect(`/dashboard/accounts?error=${encodeURIComponent(errorMessage)}`);
  }
});

export default router;
```

### Step 2: Update Frontend to Handle Redirect Query Params

**File**: `frontend/app/dashboard/accounts/page.tsx`

The page should already handle `?success=true` and `?error=message` query params. Verify this code exists:

```tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const success = params.get('success')
  const error = params.get('error')

  if (success === 'true') {
    // Refresh accounts list
    fetchAccounts()
    // Show success message (optional)
  }

  if (error) {
    setError(decodeURIComponent(error))
  }
}, [])
```

### Step 3: Configure Environment Variables

**File**: `frontend/.env.local` (create if doesn't exist)

```env
NEXT_PUBLIC_INSTAGRAM_APP_ID=YOUR_APP_ID_HERE
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**File**: `backend/.env` (should already have)

```env
INSTAGRAM_APP_ID=YOUR_APP_ID_HERE
INSTAGRAM_APP_SECRET=YOUR_APP_SECRET_HERE
INSTAGRAM_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

### Step 4: Update Redirect URI in Meta Dashboard

1. Go to **Meta Developers Dashboard**
2. Select your Instagram app
3. Go to **Settings → Basic**
4. Find "OAuth Redirect URIs"
5. Add: `http://localhost:5000/auth/instagram/callback` (for local testing)
6. Also add: `https://yourdomain.com/auth/instagram/callback` (for production)
7. Save changes

## Testing the Complete Flow

### Manual Test Steps

1. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Navigate to Accounts Page**
   ```
   http://localhost:3000/dashboard/accounts
   ```

4. **Connect Instagram Account**
   - Click "Connect Instagram Account" button
   - Should redirect to `instagram.com/oauth/authorize`
   - Authenticate with a Meta account that has a Business Account
   - Should redirect back to `localhost:5000/auth/instagram/callback?code=...`
   - Backend processes code → token → account ID
   - Should redirect to `/dashboard/accounts?success=true`
   - New account should appear in the list

5. **View Inbox**
   - Click "Inbox" on the new account
   - Should load conversations
   - Select a conversation to view messages

6. **Send Message** (Optional - requires webhook setup)
   - Type a message in the input
   - Press Enter or click Send
   - Message should appear in conversation
   - Should be visible in Meta Dashboard

### Debugging

If OAuth fails, check:

1. **Authorization Code Not Received**
   - Verify app ID matches Meta Dashboard
   - Check redirect URI is correctly configured
   - Browser console for errors

2. **Code Exchange Fails**
   - Verify app secret in backend .env
   - Check network tab for 400 errors
   - Verify Phase 6 `getAccessTokenFromCode()` function

3. **Account ID Retrieval Fails**
   - Verify access token is valid
   - Check Business Account is connected to Meta account
   - Test with Graph API explorer in Meta Dashboard

4. **Database Save Fails**
   - Check InstagramAccount model fields
   - Verify MongoDB connection
   - Check user exists in database

## API Flow Diagram

```
Frontend                          Backend                          Meta API
─────────────────────────────────────────────────────────────────────────
1. Click Connect                                                     
   │                                                                 
2. Open OAuth Dialog                                                
   │                                                                 
3. User authenticates                ←──── Redirects to login ─────→ 
   │
4. Instagram redirects with code
   └─────────────────────→ /auth/instagram/callback?code=CODE
                          │
                          ├─→ getAccessTokenFromCode(code)
                          │   └──→ POST to Meta API ────────────→ Returns token
                          │
                          ├─→ getInstagramBusinessAccountId()
                          │   └──→ GET from Meta API ─────────→ Returns account ID
                          │
                          ├─→ exchangeAccessToken()
                          │   └──→ POST to Meta API ─────────→ Returns long-lived token
                          │
                          ├─→ Save to DB
                          │
                          └─→ Redirect with success
                          
5. Receive redirect with success
   └─← /dashboard/accounts?success=true
   
6. Fetch accounts
   ─────────────────────→ GET /api/instagram/accounts
                          └──→ Returns account list ────→ 
                          
7. Display account in list
   ←──────────────────────────────────────────────────────────────
```

## Error Handling

### Expected Error Scenarios

| Scenario | Error Message | Resolution |
|----------|---------------|-----------|
| User denies | `access_denied` | User action - try again |
| Bad app ID | `Invalid OAuth app` | Check Meta Dashboard config |
| Expired code | `Code has expired` | Redirect to re-authenticate |
| Missing secret | `Invalid app secret` | Check .env file |
| Wrong redirect URI | `Redirect URI mismatch` | Update Meta Dashboard |
| No business account | `Business account not found` | Connect business account to Meta |

## Security Considerations

1. **State Parameter** (Recommended Addition)
   ```javascript
   // Generate random state for CSRF protection
   const state = crypto.randomBytes(16).toString('hex')
   // Verify state matches when returning from Instagram
   ```

2. **Token Storage**
   - Access tokens are encrypted in database
   - Use HTTPS in production
   - Set secure httpOnly cookies for session

3. **Scope Validation**
   - Required scopes: `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_messages`
   - User can only connect accounts they own
   - Account ownership verified via userId

## Success Indicators

✅ OAuth callback route implemented  
✅ Code → token → account ID exchange working  
✅ Account stored in database  
✅ Frontend shows new account in list  
✅ Inbox accessible for new account  
✅ Messages can be viewed  
✅ Messages can be sent  

## Files Modified

- `backend/src/routes/auth.js` - Added OAuth callback route
- `frontend/.env.local` - Added app ID (create if needed)
- `backend/.env` - Verify Meta API credentials

## Time Estimate

| Task | Time |
|------|------|
| Implement callback route | 15 min |
| Configure env variables | 5 min |
| Update Meta Dashboard | 5 min |
| Test OAuth flow | 10 min |
| Debug & fix issues | 5-15 min |
| **Total** | **30-45 min** |

## Next After This

Once OAuth callback is working:
1. Test message sending end-to-end
2. Implement real-time webhook updates
3. Create rule builder integration
4. Build analytics dashboard
