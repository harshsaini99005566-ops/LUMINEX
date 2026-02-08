# Instagram OAuth Integration - Testing Guide

**Purpose**: Complete testing procedures for Instagram Business Account OAuth integration  
**Audience**: Developers  
**Estimated Time**: 1-2 hours

---

## Pre-Test Setup

### 1. Prerequisites

Before testing, ensure you have:

- ✅ Meta Developer Account ([developers.meta.com](https://developers.meta.com))
- ✅ Meta App created with Instagram API enabled
- ✅ Instagram Business Account (can be test account)
- ✅ Backend running on port 5001
- ✅ Frontend running on port 3000
- ✅ MongoDB running and connected
- ✅ .env file populated with credentials

### 2. Verify Environment

```bash
# Check backend is running
curl http://localhost:5001/health
# Should return: { "status": "ok", ... }

# Check frontend is running
curl http://localhost:3000/
# Should return HTML

# Check database connection
# MongoDB should be accessible
mongosh "mongodb+srv://user:pass@cluster..."
```

### 3. Verify .env Configuration

```bash
# Backend .env should have:
INSTAGRAM_APP_ID=YOUR_APP_ID
INSTAGRAM_APP_SECRET=YOUR_APP_SECRET
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=YOUR_TOKEN
INSTAGRAM_API_VERSION=v18.0
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:3000
```

---

## Test Scenarios

### Test 1: OAuth Flow (Happy Path)

**Objective**: Verify complete OAuth authentication flow  
**Duration**: 5 minutes  
**Dependencies**: None

**Steps**:

1. **Open Frontend**
   ```
   Navigate to http://localhost:3000
   Log in with test account
   Go to Dashboard → Accounts
   ```

2. **Initiate OAuth**
   ```
   Click "Connect Instagram Account" button
   Expected: Browser redirects to Instagram login
   ```

3. **Check Backend Logs**
   ```
   Should see: "[OAuth] Auth URL generated"
   ```

4. **Complete Meta Login**
   ```
   Log in with Instagram business account
   Review requested permissions
   Click "Authorize" button
   Expected: Browser redirects back to dashboard
   ```

5. **Verify Account Created**
   ```
   Should see success message
   Account appears in connected accounts list
   Can see:
     - Instagram username
     - Profile picture
     - Follower count
   ```

6. **Verify Database**
   ```javascript
   // In MongoDB:
   db.instagramaccounts.findOne({ username: "your_username" })
   
   // Should show:
   {
     _id: ObjectId(...),
     userId: ObjectId(...),
     instagramId: "123456789",
     username: "your_username",
     name: "Your Name",
     profilePicture: "https://...",
     followersCount: 1000,
     accessToken: "IGAB...",
     isActive: true,
     connectedAt: ISODate("2024-01-20T...")
   }
   ```

**Expected Result**: ✅ Account connected and saved to database

---

### Test 2: CSRF Protection

**Objective**: Verify CSRF protection prevents state token reuse  
**Duration**: 3 minutes  
**Dependencies**: Test 1 passed

**Steps**:

1. **Initiate Two OAuth Flows**
   ```
   Click "Connect Instagram" button
   Immediately click "Connect Instagram" again
   Two OAuth requests should be made
   Each should have different state tokens
   ```

2. **Check Backend Logs**
   ```
   Should see two separate:
   "[OAuth] Auth URL generated"
   With different state values in logs
   ```

3. **Test State Mismatch**
   ```
   Get one state token from first flow
   Manually construct callback URL with wrong state:
   http://localhost:5001/api/instagram/auth/callback?code=XXX&state=WRONG_STATE
   
   Expected: 400 error "Invalid state parameter"
   Backend logs: "[OAuth Callback] State mismatch"
   ```

**Expected Result**: ✅ Invalid state tokens are rejected

---

### Test 3: Webhook Verification

**Objective**: Verify webhook URL verification with Meta  
**Duration**: 5 minutes  
**Dependencies**: Test 1 passed, account connected

**Steps**:

1. **Set Webhook URL in Meta App**
   ```
   Go to Meta App Dashboard
   Settings → Advanced
   Webhook Callback URL: http://localhost:5001/webhooks/instagram
   Verify Token: (your INSTAGRAM_WEBHOOK_VERIFY_TOKEN value)
   Click "Verify and Save"
   ```

2. **Check Backend Logs**
   ```
   Should see:
   "[Webhook Verification] Request received"
   "[Webhook Verification] Successful"
   ```

3. **Verify in Meta Dashboard**
   ```
   Webhook should show green checkmark: "✅ Active"
   Status should show "Verified"
   ```

4. **Check Subscribed Fields**
   ```
   Ensure "messages" is in subscribed fields list
   ```

**Expected Result**: ✅ Webhook verified and subscribed

---

### Test 4: Webhook Signature Verification

**Objective**: Verify webhook signature verification works  
**Duration**: 5 minutes  
**Dependencies**: Test 3 passed

**Steps**:

1. **Prepare Test Payload**
   ```javascript
   // Create test webhook payload
   const payload = JSON.stringify({
     entry: [{
       messaging: [{
         sender: { id: "1234567890" },
         recipient: { id: "0987654321" },
         message: {
           mid: "mid.1234567890",
           text: "Test message"
         },
         timestamp: Math.floor(Date.now() / 1000)
       }]
     }]
   });
   ```

2. **Calculate HMAC Signature**
   ```javascript
   const crypto = require('crypto');
   const appSecret = process.env.INSTAGRAM_APP_SECRET;
   const hash = crypto
     .createHmac('sha256', appSecret)
     .update(payload)
     .digest('hex');
   const signature = `sha256=${hash}`;
   console.log(signature);
   ```

3. **Send Test Webhook with Valid Signature**
   ```bash
   curl -X POST http://localhost:5001/webhooks/instagram \
     -H "Content-Type: application/json" \
     -H "X-Hub-Signature-256: sha256=YOUR_SIGNATURE" \
     -d 'PAYLOAD'
   ```
   
   **Expected Response**: 200 OK

4. **Test with Invalid Signature**
   ```bash
   curl -X POST http://localhost:5001/webhooks/instagram \
     -H "Content-Type: application/json" \
     -H "X-Hub-Signature-256: sha256=WRONG_SIGNATURE" \
     -d 'PAYLOAD'
   ```
   
   **Expected Response**: 403 Forbidden
   **Backend Logs**: "[Webhook Signature] Invalid signature"

**Expected Result**: ✅ Valid signatures accepted, invalid rejected

---

### Test 5: Incoming Message Handling

**Objective**: Verify webhook receives and stores incoming messages  
**Duration**: 10 minutes  
**Dependencies**: Tests 1-4 passed

**Steps**:

1. **Clear Message Database**
   ```javascript
   db.messages.deleteMany({})
   ```

2. **Send Test Message via Instagram**
   ```
   From another Instagram account, send DM to your business account
   Wait 5 seconds for webhook delivery
   ```

3. **Check Backend Logs**
   ```
   Should see:
   "[Webhook Event] Received"
   "[Webhook Message] Message stored"
   ```

4. **Verify Message in Database**
   ```javascript
   db.messages.findOne({}, { sort: { createdAt: -1 } })
   
   Should contain:
   {
     _id: ObjectId(...),
     conversationId: ObjectId(...),
     sender: "customer",
     instagramMessageId: "mid.xxx",
     text: "Your test message",
     receivedAt: ISODate("2024-01-20T..."),
     isRead: false
   }
   ```

5. **Verify Conversation Created**
   ```javascript
   db.conversations.findOne({})
   
   Should contain:
   {
     _id: ObjectId(...),
     userId: ObjectId(...),
     instagramAccountId: ObjectId(...),
     instagramCustomerId: "123456789",
     senderName: "Sender Username",
     lastMessageAt: ISODate("2024-01-20T..."),
     messageCount: 1
   }
   ```

**Expected Result**: ✅ Messages received and stored

---

### Test 6: Send Message (API)

**Objective**: Verify sending messages via API  
**Duration**: 5 minutes  
**Dependencies**: Tests 1-5 passed

**Steps**:

1. **Get Connected Account**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5001/api/instagram/accounts
   
   Save the _id from response
   ```

2. **Get Recipient Customer ID**
   ```javascript
   // From database, get the Instagram customer ID who sent you a message
   db.conversations.findOne({})
   // Use the instagramCustomerId value
   ```

3. **Send Test Message**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "recipientId": "CUSTOMER_INSTAGRAM_ID",
       "message": "Thanks for reaching out! How can I help?"
     }' \
     http://localhost:5001/api/instagram/accounts/ACCOUNT_ID/messages
   ```

4. **Check Response**
   ```json
   {
     "message": "Message sent",
     "messageId": "mid.1234567890"
   }
   ```

5. **Verify Message Sent**
   ```
   Check Instagram DM thread on business account
   Your reply should appear in conversation
   ```

6. **Check Database**
   ```javascript
   db.messages.find({ direction: "outgoing" })
   
   Should show message with:
   - instagramMessageId: the mid from response
   - text: your message
   - sentAt: timestamp
   ```

**Expected Result**: ✅ Message sent through Instagram API

---

### Test 7: Account Management

**Objective**: Verify account listing, details, and disconnection  
**Duration**: 5 minutes  
**Dependencies**: Test 1 passed

**Steps**:

1. **Test List Accounts**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5001/api/instagram/accounts
   ```
   
   **Expected**: Array with your connected account(s)

2. **Test Get Account Details**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5001/api/instagram/accounts/ACCOUNT_ID
   ```
   
   **Expected**: Full account details (without accessToken)

3. **Test Disconnect Account**
   ```bash
   curl -X DELETE \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5001/api/instagram/accounts/ACCOUNT_ID
   ```
   
   **Expected Response**: { "message": "Account disconnected" }

4. **Verify Disconnection**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5001/api/instagram/accounts
   ```
   
   **Expected**: Account should have isActive: false (or not appear)

5. **Re-connect for Further Testing**
   ```
   Click "Connect Instagram" again to restore account
   ```

**Expected Result**: ✅ Account management operations work

---

### Test 8: Token Refresh

**Objective**: Verify automatic token refresh  
**Duration**: 10 minutes  
**Dependencies**: Test 1 passed

**Steps**:

1. **Modify Token Expiration (For Testing)**
   ```javascript
   // In MongoDB, set token to expire very soon
   db.instagramaccounts.updateOne(
     { username: "your_username" },
     { $set: { tokenExpiresAt: new Date() } }
   )
   ```

2. **Send Message**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "recipientId": "CUSTOMER_ID",
       "message": "Test refresh"
     }' \
     http://localhost:5001/api/instagram/accounts/ACCOUNT_ID/messages
   ```

3. **Check Backend Logs**
   ```
   Should see:
   "[Token Refresh] Refreshing token"
   "[Token Refresh] Token refreshed successfully"
   "[Send Message] Sent successfully"
   ```

4. **Verify New Token in Database**
   ```javascript
   db.instagramaccounts.findOne({ username: "your_username" })
   
   tokenExpiresAt should be ~60 days from now
   lastTokenRefresh should be recent timestamp
   ```

**Expected Result**: ✅ Token refreshed automatically

---

### Test 9: Error Handling

**Objective**: Verify proper error handling and status codes  
**Duration**: 5 minutes  
**Dependencies**: Tests 1-8 passed

**Steps**:

1. **Test Missing Authentication**
   ```bash
   curl http://localhost:5001/api/instagram/accounts
   ```
   **Expected**: 401 Unauthorized

2. **Test Invalid Account ID**
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5001/api/instagram/accounts/INVALID_ID
   ```
   **Expected**: 404 Not Found

3. **Test Invalid Recipient**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "recipientId": "INVALID_ID",
       "message": "Test"
     }' \
     http://localhost:5001/api/instagram/accounts/ACCOUNT_ID/messages
   ```
   **Expected**: Error from Instagram API (likely 400)

4. **Test Missing Fields**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{}' \
     http://localhost:5001/api/instagram/accounts/ACCOUNT_ID/messages
   ```
   **Expected**: 400 Bad Request

**Expected Result**: ✅ Proper error handling

---

### Test 10: Multiple Accounts

**Objective**: Verify multiple accounts can be connected  
**Duration**: 10 minutes  
**Dependencies**: Tests 1-9 passed

**Prerequisites**: Access to 2 different Instagram business accounts

**Steps**:

1. **Connect First Account**
   ```
   (Already done in Test 1)
   ```

2. **Connect Second Account**
   ```
   Click "Connect Instagram Account" again
   Log in with different Instagram account
   Authorize the app
   Account should appear in list
   ```

3. **Verify Both in Database**
   ```javascript
   db.instagramaccounts.find({ userId: ObjectId("your_user_id") })
   
   Should return 2 documents with different:
   - instagramId
   - username
   - profilePicture
   ```

4. **Send Message from Each**
   ```bash
   # From first account
   curl -X POST ... http://localhost:5001/api/instagram/accounts/ACCOUNT_ID_1/messages
   
   # From second account
   curl -X POST ... http://localhost:5001/api/instagram/accounts/ACCOUNT_ID_2/messages
   ```
   
   Both should succeed independently

**Expected Result**: ✅ Multiple accounts work independently

---

## Automated Test Script

Create `test-instagram-oauth.js` for automated testing:

```javascript
#!/usr/bin/env node

const axios = require('axios');
const crypto = require('crypto');

const API_URL = 'http://localhost:5001';
const JWT_TOKEN = process.env.JWT_TOKEN || 'YOUR_TOKEN_HERE';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'Content-Type': 'application/json'
  },
  validateStatus: () => true // Don't throw on any status
});

async function runTests() {
  console.log('🧪 Running Instagram OAuth Integration Tests\n');

  try {
    // Test 1: Get OAuth URL
    console.log('Test 1: Get OAuth Authorization URL');
    const authUrl = await client.get('/api/instagram/auth/url');
    if (authUrl.status === 200 && authUrl.data.url) {
      console.log('✅ PASS: Got OAuth URL');
    } else {
      console.log('❌ FAIL:', authUrl.data);
    }
    
    // Test 2: List Accounts
    console.log('\nTest 2: List Connected Accounts');
    const accounts = await client.get('/api/instagram/accounts');
    if (accounts.status === 200 && Array.isArray(accounts.data.accounts)) {
      console.log(`✅ PASS: Found ${accounts.data.accounts.length} accounts`);
    } else {
      console.log('❌ FAIL:', accounts.data);
    }
    
    // Test 3: Webhook Signature Verification
    console.log('\nTest 3: Webhook Signature Verification');
    const payload = JSON.stringify({ test: 'data' });
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    const hash = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex');
    const signature = `sha256=${hash}`;
    
    // Test valid signature
    const validWebhook = await client.post('/webhooks/instagram', 
      { test: 'data' },
      { headers: { 'X-Hub-Signature-256': signature } }
    );
    
    if (validWebhook.status === 200) {
      console.log('✅ PASS: Valid signature accepted');
    } else {
      console.log('❌ FAIL: Valid signature rejected');
    }
    
    // Test invalid signature
    const invalidWebhook = await client.post('/webhooks/instagram',
      { test: 'data' },
      { headers: { 'X-Hub-Signature-256': 'sha256=INVALID' } }
    );
    
    if (invalidWebhook.status === 403) {
      console.log('✅ PASS: Invalid signature rejected');
    } else {
      console.log('❌ FAIL: Invalid signature not rejected');
    }
    
    console.log('\n✅ Test suite complete!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

runTests();
```

**Run automated tests:**
```bash
JWT_TOKEN="your_jwt_token" node test-instagram-oauth.js
```

---

## Troubleshooting During Testing

### Issue: "Invalid state parameter"
```
Cause: Multiple rapid requests, state token mismatch
Fix: Clear browser localStorage, start fresh
localStorage.clear()
```

### Issue: "Webhook not verified"
```
Cause: WEBHOOK_VERIFY_TOKEN doesn't match
Fix: Copy exact token from Meta app dashboard
Verify no extra spaces or special characters
```

### Issue: "Failed to send message"
```
Cause: Invalid recipient ID or token expired
Fix: 
1. Get correct Instagram ID from conversation
2. Check token hasn't expired
3. Verify message text isn't too long (2000 char limit)
```

### Issue: "Message not received"
```
Cause: Webhook not subscribed to "messages" field
Fix: Re-subscribe in Meta app dashboard
Or restart webhook verification process
```

---

## Performance Testing

### Load Test: Webhook Handling

```bash
# Send 100 webhooks in quick succession
for i in {1..100}; do
  curl -X POST \
    -H "X-Hub-Signature-256: sha256=VALID_SIG" \
    -d '{"entry":[{"messaging":[...]}]}' \
    http://localhost:5001/webhooks/instagram &
done
wait

# Check response times and errors in logs
tail -100 backend/logs/error.log
```

### Metrics to Monitor

- **Webhook Processing Time**: < 1000ms
- **Database Queries**: < 500ms
- **API Response Time**: < 2000ms
- **Error Rate**: < 1%
- **Memory Usage**: < 500MB

---

## Test Report Template

```markdown
# Instagram OAuth Integration - Test Report

**Date**: January 20, 2024
**Tester**: Developer Name
**Environment**: Local Development (Docker)

## Test Results

| Test # | Name | Status | Notes |
|--------|------|--------|-------|
| 1 | OAuth Flow | ✅ PASS | Account connected successfully |
| 2 | CSRF Protection | ✅ PASS | State token validation working |
| 3 | Webhook Verification | ✅ PASS | Webhook verified in Meta app |
| 4 | Signature Verification | ✅ PASS | HMAC-SHA256 validation correct |
| 5 | Incoming Messages | ✅ PASS | Messages stored correctly |
| 6 | Send Message API | ✅ PASS | Message sent via Instagram DM |
| 7 | Account Management | ✅ PASS | All CRUD operations work |
| 8 | Token Refresh | ✅ PASS | Automatic refresh successful |
| 9 | Error Handling | ✅ PASS | Proper error codes returned |
| 10 | Multiple Accounts | ✅ PASS | 2 accounts connected |

## Summary

**Total Tests**: 10
**Passed**: 10
**Failed**: 0
**Skipped**: 0

**Status**: ✅ READY FOR PRODUCTION

## Issues Found

None

## Recommendations

None
```

---

## Sign-Off Checklist

Before considering testing complete:

- [ ] All 10 test scenarios passed
- [ ] No critical errors in logs
- [ ] Database has correct data
- [ ] API responses are correct
- [ ] Frontend shows connected accounts
- [ ] Webhook verification successful
- [ ] Messages sent and received correctly
- [ ] Token refresh working
- [ ] Error handling proper
- [ ] Multiple accounts functional
- [ ] Test report completed and filed

---

**Testing Version**: 1.0  
**Last Updated**: January 2024  
**Status**: Ready to Use
