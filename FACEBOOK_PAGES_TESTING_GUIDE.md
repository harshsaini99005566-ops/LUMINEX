# 🧪 Facebook Pages API - Testing Quick Reference

## Endpoint Summary

| Property | Value |
|----------|-------|
| **URL** | `/api/auth/facebook/pages` |
| **Method** | GET |
| **Auth Required** | YES (JWT Bearer Token) |
| **Response Format** | JSON |
| **Response Time** | ~50ms |
| **Status Code (Success)** | 200 OK |
| **Status Code (Failure)** | 401/404/500 |

---

## Authentication

### Required Header
```
Authorization: Bearer <JWT_TOKEN>
```

### How to Get Token

**Option 1: From Browser Console**
```javascript
// In browser DevTools Console:
localStorage.getItem('token')

// Returns:
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YTJmYjBlNGE4ZmEyODExOWVkYTdkZiIsImVtYWlsIjoidGVzdC5mYWNlYm9va0BleGFtcGxlLmNvbSIsImlhdCI6MTc3MjI5MjUxNCwiZXhwIjoxNzcyMjk2MTE0fQ.6OmPDQGP-JCysU6BfLKSimOAp8MbFljdlnw3BctmEZ4"
```

**Option 2: From MongoDB**
```bash
# Generate a fresh token from backend
cd backend
node -e "require('dotenv').config(); const jwt = require('jsonwebtoken'); const token = jwt.sign({id:'69a2fb0e4a8fa28119eda7df', email:'test.facebook@example.com'}, process.env.JWT_SECRET, {expiresIn:'1h'}); console.log(token);"
```

**Option 3: Re-login with Facebook**
```
1. Go to http://localhost:3000/login
2. Click "Continue with Facebook"
3. Complete Facebook auth
4. Token automatically stored in localStorage
5. Use from console as Option 1
```

---

## cURL Testing

### Basic Request
```bash
curl -X GET http://localhost:5001/api/auth/facebook/pages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### With Pretty JSON Output (jq required)
```bash
curl -s http://localhost:5001/api/auth/facebook/pages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" | jq .
```

### Using Token Variable
```bash
TOKEN=$(cd backend && node -e "require('dotenv').config(); const jwt = require('jsonwebtoken'); console.log(jwt.sign({id:'69a2fb0e4a8fa28119eda7df', email:'test.facebook@example.com'}, process.env.JWT_SECRET, {expiresIn:'1h'}))")

curl -X GET http://localhost:5001/api/auth/facebook/pages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## PowerShell Testing

### Using Token from Console
```powershell
$token = "paste_your_token_here"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:5001/api/auth/facebook/pages" `
  -Method GET `
  -Headers $headers | ConvertTo-Json -Depth 10
```

### Full One-Liner
```powershell
$token = "your_jwt_token"; Invoke-RestMethod -Uri "http://localhost:5001/api/auth/facebook/pages" -Headers @{"Authorization"="Bearer $token"} | ConvertTo-Json -Depth 10
```

---

## JavaScript Fetch Testing

### In Browser Console
```javascript
// Copy your token first
const token = localStorage.getItem('token');

fetch('http://localhost:5001/api/auth/facebook/pages', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(res => res.json())
.then(data => {
  console.log('Pages:', data.pages);
  console.log('Page Count:', data.pages.length);
  data.pages.forEach((p, i) => {
    console.log(`${i+1}. ${p.name} (ID: ${p.id})`);
  });
})
.catch(err => console.error('Error:', err));
```

### Using Axios
```javascript
const token = localStorage.getItem('token');

axios.get('http://localhost:5001/api/auth/facebook/pages', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => console.log(res.data))
.catch(err => console.error(err));
```

---

## Response Examples

### Success Response (200 OK)
```json
{
  "success": true,
  "pages": [
    {
      "id": "1430937031965549",
      "name": "Luminex Labs",
      "hasInstagram": true
    },
    {
      "id": "246810121416",
      "name": "Tech Innovations Hub",
      "hasInstagram": false
    }
  ],
  "hasConnected": true,
  "user": {
    "id": "69a2fb0e4a8fa28119eda7df",
    "name": "Test User",
    "email": "test.facebook@example.com"
  }
}
```

### No Pages (Still 200 OK)
```json
{
  "success": true,
  "pages": [],
  "hasConnected": false,
  "user": {
    "id": "69a2fb0e4a8fa28119eda7df",
    "name": "Test User",
    "email": "test.facebook@example.com"
  }
}
```

### Missing Token (401 Unauthorized)
```json
{
  "success": false,
  "error": "User not authenticated",
  "pages": []
}
```

### Invalid Token (401 Unauthorized)
```json
{
  "success": false,
  "error": "Token verification failed",
  "pages": []
}
```

### User Not Found (404 Not Found)
```json
{
  "success": false,
  "error": "User not found",
  "pages": []
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Failed to fetch Facebook pages",
  "pages": []
}
```

---

## Debugging Checklist

### Step 1: Verify Server is Running
```bash
# Check if backend is listening on port 5001
netstat -an | find ":5001"

# Or use PowerShell
Test-NetConnection -ComputerName localhost -Port 5001

# Should show: TcpTestSucceeded : True
```

### Step 2: Verify Token is Valid
```javascript
// In browser console:

// Check token exists
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);

// Decode token to check expiry
const payload = token.split('.')[1];
const decoded = JSON.parse(atob(payload));
console.log('User ID:', decoded.id);
console.log('Email:', decoded.email);
console.log('Expires:', new Date(decoded.exp * 1000));
console.log('Is Expired:', new Date() > new Date(decoded.exp * 1000));
```

### Step 3: Check Network Request
```javascript
// In Chrome DevTools:
1. Open Network tab (F12)
2. Reload page
3. Look for request to /api/auth/facebook/pages
4. Click on it
5. Check:
   - Status: 200
   - Response tab: pages array
   - Headers: Bearer token present
```

### Step 4: Check Backend Logs
```bash
# Watch backend logs in real-time
# Terminal should show:
# [Auth Middleware] Token verified
# [Auth] GET /api/auth/facebook/pages - Status 200

# Or check log file:
tail -f backend/server.log | grep "facebook/pages"
```

### Step 5: Verify Database
```bash
# Connect to MongoDB
mongo

# Use database
use insta_automation

# Find user
db.users.findOne({email: "test.facebook@example.com"})

# Check facebookPages field
# Should show:
# "facebookPages" : [
#   {
#     "pageId" : "1430937031965549",
#     "pageName" : "Luminex Labs",
#     "hasInstagram" : true
#   }
# ]
```

---

## Common Issues & Solutions

### Issue: 401 Unauthorized

**Cause 1: Missing Token**
```
Solution: 
const token = localStorage.getItem('token');
console.log(token); // Should not be null
```

**Cause 2: Expired Token**
```
Solution:
// Check expiry
const decoded = JSON.parse(atob(token.split('.')[1]));
const isExpired = Date.now() > decoded.exp * 1000;
console.log('Expired:', isExpired);

// If expired, re-login
// Go to http://localhost:3000/login
// Click "Continue with Facebook"
```

**Cause 3: Token tampering**
```
Solution:
localStorage.removeItem('token');
localStorage.removeItem('user');
// Re-login to get fresh token
```

### Issue: 404 Not Found

**Cause: Wrong endpoint**
```
Solution:
// Check URL is exactly:
http://localhost:5001/api/auth/facebook/pages

// Not any of these:
http://localhost:5001/api/facebook/pages          ❌
http://localhost:5001/api/facebook-pages          ❌
http://localhost:5001/api/pages                   ❌
```

### Issue: Empty Pages Array

**Cause 1: User has no Facebook pages**
```
Solution:
1. Create a test page on Facebook
2. Assign user's account as admin
3. Re-authenticate
```

**Cause 2: Pages not saved during OAuth**
```
Solution:
1. Check backend logs during OAuth
2. Look for "[Facebook OAuth] Saved X pages"
3. If not there, check Graph API permissions
```

### Issue: 500 Server Error

**Check logs:**
```bash
# Backend logs
tail -50 backend/server.log

# Typical errors:
# "MongoDB connection failed"
# "Graph API request failed"
# "User model not found"

# Solutions:
# 1. Ensure MongoDB is running: mongod
# 2. Ensure backend server is running: npm run dev
# 3. Check MONGODB_URI in .env
```

---

## Performance Testing

### Measure Response Time
```javascript
console.time('Facebook Pages API');

fetch('http://localhost:5001/api/auth/facebook/pages', {
  headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
})
.then(r => r.json())
.then(d => console.log('Pages fetched:', d.pages.length))
.finally(() => console.timeEnd('Facebook Pages API'));

// Output: Facebook Pages API: 48.50ms
```

### Load Testing (Simple)
```javascript
// Run 10 requests
for(let i = 0; i < 10; i++) {
  fetch('http://localhost:5001/api/auth/facebook/pages', {
    headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
  })
  .then(r => r.json())
  .then(d => console.log(`Request ${i+1}: ${d.pages.length} pages`))
}
```

---

## Backend Testing Tools

### Monitor Real-Time Requests
```bash
# Terminal 1: Start backend with logging
cd backend
npm run dev

# Terminal 2: Watch logs real-time
tail -f server.log | grep "facebook/pages"

# Terminal 3: Make requests
curl http://localhost:5001/api/auth/facebook/pages -H "Authorization: Bearer TOKEN"
```

### Test All Status Codes
```bash
# Test 200 OK (valid token)
curl -H "Authorization: Bearer VALID_TOKEN" http://localhost:5001/api/auth/facebook/pages

# Test 401 Unauthorized (no token)
curl http://localhost:5001/api/auth/facebook/pages

# Test 401 Unauthorized (bad token)
curl -H "Authorization: Bearer invalid_token_here" http://localhost:5001/api/auth/facebook/pages

# Test with basic auth (should fail)
curl -u user:pass http://localhost:5001/api/auth/facebook/pages
```

---

## For Meta Reviewers

When demonstrating, show:

1. **Open DevTools Network Tab**
   - Click on `/api/auth/facebook/pages` request
   - Show Status: 200 OK
   - Show Response with pages array
   - Show Response Time: ~50ms

2. **Click on Response Tab**
   - Show pages is an array with proper structure
   - Show each page has: id, name, hasInstagram
   - Show no sensitive data exposed

3. **Click on Headers Tab**
   - Show Authorization header with Bearer token
   - Compare with database - confirm data matches

4. **Run in Console**
   ```javascript
   // Show pages are rendering correctly
   document.querySelectorAll('[class*="facebook"]').length
   // Should find the Connected Facebook Pages section
   ```

5. **Open Database**
   - Show user document has facebookPages array
   - Show data structure matches API response

---

## Quick Command Reference

### Get Token (One-Liner)
```bash
cd backend && node -e "require('dotenv').config(); const jwt = require('jsonwebtoken'); console.log(jwt.sign({id:'69a2fb0e4a8fa28119eda7df'}, process.env.JWT_SECRET, {expiresIn:'1h'}))"
```

### Test Endpoint (One-Liner)  
```bash
TOKEN=$(cd backend && node -e "require('dotenv').config(); const jwt = require('jsonwebtoken'); console.log(jwt.sign({id:'69a2fb0e4a8fa28119eda7df'}, process.env.JWT_SECRET, {expiresIn:'1h'}))") && curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5001/api/auth/facebook/pages | json_pp
```

### Monitor Logs (One-Liner)
```bash
tail -f backend/server.log | grep -E "(facebook|pages|auth)" --color
```

---

Generated: 2026-02-28
Ready for Testing ✅
